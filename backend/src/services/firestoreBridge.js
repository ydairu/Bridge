import admin from "firebase-admin";

const SERVER_TIMESTAMP = admin.firestore.FieldValue.serverTimestamp;

function nowIso() {
  return new Date().toISOString();
}

function normalizePhone(phone) {
  return String(phone || "").replace(/[^\d]/g, "");
}

function whatsappUserId(phone) {
  return `wa_${normalizePhone(phone)}`;
}

function safeArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function scoreJob(job, profile, queryText) {
  const profileSkills = safeArray(profile?.skills).map(normalizeText);
  const jobSkills = safeArray(job.skills || job.requiredSkills).map(normalizeText);
  const query = normalizeText(queryText);
  let score = 0;

  if (job.verificationStatus === "verified" || job.verified === true) score += 100;
  if (job.verificationStatus === "flagged" || job.feeRequired === true) score -= 100;

  for (const skill of profileSkills) {
    if (jobSkills.some((jobSkill) => jobSkill.includes(skill) || skill.includes(jobSkill))) {
      score += 12;
    }
    if (normalizeText(job.title).includes(skill) || normalizeText(job.description).includes(skill)) {
      score += 5;
    }
  }

  if (query) {
    const haystack = [
      job.title,
      job.description,
      job.category,
      job.company,
      job.employerName,
      ...(jobSkills || []),
    ]
      .join(" ")
      .toLowerCase();
    for (const term of query.split(/\s+/).filter(Boolean)) {
      if (haystack.includes(term)) score += 3;
    }
  }

  return score;
}

function jobSummary(job) {
  return {
    id: job.id,
    title: job.title,
    company: job.company || job.employerName || "Unknown company",
    location: job.location,
    salary: job.salaryDisplay || (job.salary ? `$${job.salary}/mo` : "Not listed"),
    type: job.type,
    category: job.category,
    skills: safeArray(job.skills || job.requiredSkills),
    status: job.status || "active",
    verificationStatus: job.verificationStatus || (job.verified ? "verified" : "unverified"),
    feeRequired: Boolean(job.feeRequired),
    riskLevel: job.riskLevel || "unknown",
    riskReasons: safeArray(job.riskReasons),
  };
}

export class BridgeFirestoreService {
  constructor(db) {
    this.db = db;
  }

  userIdForPhone(phone) {
    return whatsappUserId(phone);
  }

  async loadOrCreateWhatsAppUser({ phone, displayName = "" }) {
    const id = whatsappUserId(phone);
    const ref = this.db.collection("users").doc(id);
    const snap = await ref.get();

    if (snap.exists) {
      const existing = { id, ...snap.data() };
      if (displayName && !existing.name) {
        await ref.set({ name: displayName, updatedAt: nowIso() }, { merge: true });
        existing.name = displayName;
      }
      return existing;
    }

    const user = {
      name: displayName || "",
      waPhone: normalizePhone(phone),
      phone: `+${normalizePhone(phone)}`,
      role: "jobseeker",
      type: "jobseeker",
      source: "whatsapp",
      language: "en",
      skills: [],
      profileComplete: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    await ref.set(user);
    return { id, ...user };
  }

  async getProfile({ userId }) {
    const snap = await this.db.collection("users").doc(userId).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() };
  }

  async updateProfile({ userId, profile }) {
    const clean = {};
    const allowed = [
      "name",
      "language",
      "countryOfOrigin",
      "currentLocation",
      "skills",
      "experience",
      "experienceSummary",
      "phone",
      "profileComplete",
    ];

    for (const key of allowed) {
      if (profile[key] !== undefined && profile[key] !== null && profile[key] !== "") {
        clean[key] = key === "skills" ? safeArray(profile[key]) : profile[key];
      }
    }

    clean.updatedAt = nowIso();
    await this.db.collection("users").doc(userId).set(clean, { merge: true });
    return this.getProfile({ userId });
  }

  async getConversationState({ userId }) {
    const snap = await this.db.collection("conversationStates").doc(userId).get();
    if (!snap.exists) {
      return { userId, currentFlow: "idle", flowStep: "", scratch: {} };
    }
    return { userId, ...snap.data() };
  }

  async updateConversationState({ userId, patch }) {
    const data = {
      ...patch,
      updatedAt: SERVER_TIMESTAMP(),
    };
    await this.db.collection("conversationStates").doc(userId).set(data, { merge: true });
    return this.getConversationState({ userId });
  }

  async logMessage({ userId, direction, waMessageId, body, raw = {}, kind = "text" }) {
    if (waMessageId) {
      const duplicate = await this.db.collection("waMessages").doc(waMessageId).get();
      if (duplicate.exists) return { duplicate: true, id: waMessageId };
      await this.db.collection("waMessages").doc(waMessageId).set({
        userId,
        direction,
        waMessageId,
        body,
        raw,
        kind,
        createdAt: SERVER_TIMESTAMP(),
      });
      return { duplicate: false, id: waMessageId };
    }

    const ref = await this.db.collection("waMessages").add({
      userId,
      direction,
      body,
      raw,
      kind,
      createdAt: SERVER_TIMESTAMP(),
    });
    return { duplicate: false, id: ref.id };
  }

  async isDuplicateMessage(waMessageId) {
    if (!waMessageId) return false;
    const snap = await this.db.collection("waMessages").doc(waMessageId).get();
    return snap.exists;
  }

  async getRecentMessages({ userId, limit = 8 }) {
    const snapshot = await this.db
      .collection("waMessages")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get()
      .catch(async () => {
        const fallback = await this.db
          .collection("waMessages")
          .where("userId", "==", userId)
          .limit(limit)
          .get();
        return fallback;
      });

    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .reverse();
  }

  async searchJobs({ userId, query = "", location = "", skills = [] }) {
    const profile = userId ? await this.getProfile({ userId }) : null;
    const snapshot = await this.db.collection("jobs").get();
    const requestedSkills = safeArray(skills);

    const jobs = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((job) => (job.status || "active") !== "closed")
      .filter((job) => job.verificationStatus !== "flagged")
      .filter((job) => !location || normalizeText(job.location).includes(normalizeText(location)))
      .map((job) => ({
        ...jobSummary(job),
        matchScore: scoreJob(job, { ...profile, skills: [...safeArray(profile?.skills), ...requestedSkills] }, query),
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);

    return { jobs };
  }

  async getJob({ jobId }) {
    const snap = await this.db.collection("jobs").doc(jobId).get();
    if (!snap.exists) return null;
    const job = { id: snap.id, ...snap.data() };
    let employer = null;

    if (job.employerId) {
      const employerSnap = await this.db.collection("users").doc(job.employerId).get();
      if (employerSnap.exists) {
        employer = { id: employerSnap.id, ...employerSnap.data() };
      }
    }

    return {
      ...jobSummary(job),
      description: job.description,
      requirements: safeArray(job.requirements),
      benefits: safeArray(job.benefits),
      employerId: job.employerId,
      employer,
    };
  }

  async startApplication({ userId, jobId }) {
    const job = await this.getJob({ jobId });
    if (!job) throw new Error("Job not found");
    if (job.verificationStatus === "flagged" || job.feeRequired) {
      throw new Error("This listing is risky and cannot be applied to through Bridge.");
    }

    await this.updateConversationState({
      userId,
      patch: {
        currentFlow: "apply",
        flowStep: "confirm",
        scratch: { jobId },
      },
    });

    return {
      job,
      nextStep: "confirm_profile",
      message: "Confirm the worker profile and submit the application.",
    };
  }

  async submitApplication({ userId, jobId, coverLetter = "", answers = {} }) {
    const job = await this.getJob({ jobId });
    const profile = await this.getProfile({ userId });
    if (!job) throw new Error("Job not found");

    const referenceCode = `BR-${Date.now().toString(36).toUpperCase()}`;
    const ref = await this.db.collection("applications").add({
      jobId,
      jobTitle: job.title,
      userId,
      jobseekerId: userId,
      jobseekerName: profile?.name || "WhatsApp worker",
      jobseekerEmail: profile?.email || "",
      employerId: job.employerId || "",
      employerName: job.company,
      status: "pending",
      source: "whatsapp",
      submittedViaWaPhone: profile?.waPhone || "",
      referenceCode,
      coverLetter:
        coverLetter ||
        `WhatsApp application from ${profile?.name || "Bridge worker"} with skills: ${safeArray(
          profile?.skills
        ).join(", ")}`,
      resume: profile?.experienceSummary || profile?.experience || "Submitted via WhatsApp",
      answers,
      skills: safeArray(profile?.skills),
      createdAt: nowIso(),
      appliedAt: nowIso(),
    });

    await this.updateConversationState({
      userId,
      patch: { currentFlow: "idle", flowStep: "", scratch: {} },
    });

    return { applicationId: ref.id, referenceCode, status: "pending", job };
  }

  async listApplications({ userId }) {
    const snapshot = await this.db
      .collection("applications")
      .where("userId", "==", userId)
      .get();

    const applications = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);

    return { applications };
  }

  async getApplicationStatus({ userId, applicationId = "" }) {
    if (applicationId) {
      const snap = await this.db.collection("applications").doc(applicationId).get();
      if (!snap.exists) return null;
      const app = { id: snap.id, ...snap.data() };
      if (app.userId !== userId) throw new Error("Application does not belong to this worker.");
      return app;
    }

    const { applications } = await this.listApplications({ userId });
    return applications[0] || null;
  }

  async saveVerificationRun({ target, result, evidence = [] }) {
    const ref = await this.db.collection("verificationRuns").add({
      target,
      result,
      evidence,
      createdAt: SERVER_TIMESTAMP(),
    });
    return ref.id;
  }

  async updateJobVerification({ jobId, verification }) {
    await this.db.collection("jobs").doc(jobId).set(
      {
        verificationStatus: verification.verificationStatus,
        verificationNotes: verification,
        riskLevel: verification.riskLevel,
        riskReasons: verification.riskReasons || [],
        feeRequired: Boolean(verification.feeRequired),
        updatedAt: nowIso(),
      },
      { merge: true }
    );
    return this.getJob({ jobId });
  }

  async requestSupport({ userId, topic = "general", message = "" }) {
    const profile = await this.getProfile({ userId });
    const ref = await this.db.collection("supportTickets").add({
      userId,
      waPhone: profile?.waPhone || "",
      topic,
      message,
      status: "open",
      source: "whatsapp",
      createdAt: SERVER_TIMESTAMP(),
    });
    return { ticketId: ref.id, status: "open" };
  }
}
