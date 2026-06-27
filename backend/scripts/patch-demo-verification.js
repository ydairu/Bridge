// Patch live Firestore demo data for the WhatsApp trust demo:
//   1. Mark a handful of reputable seeded jobs as `verified` (rank first in search).
//   2. Mark the remaining jobs `unverified` (only if they have no status yet).
//   3. Add ONE risky, fee-required listing so the agent visibly warns + blocks it.
//
// Idempotent: re-running won't create duplicate risky listings and won't clobber
// jobs already marked verified. Uses the same env creds as the backend server.
//
//   node scripts/patch-demo-verification.js
import dotenv from "dotenv";
import admin from "firebase-admin";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", "..", ".env") });

function serviceAccountFromEnv() {
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  if (!privateKey || !clientEmail || !projectId) {
    throw new Error("Missing FIREBASE_PRIVATE_KEY / FIREBASE_CLIENT_EMAIL / FIREBASE_PROJECT_ID in .env");
  }
  return {
    type: "service_account",
    project_id: projectId,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: privateKey,
    client_email: clientEmail,
    client_id: process.env.FIREBASE_CLIENT_ID,
  };
}

const sa = serviceAccountFromEnv();
admin.initializeApp({ credential: admin.credential.cert(sa), projectId: sa.project_id });
const db = admin.firestore();
const nowIso = () => new Date().toISOString();

// Companies we treat as trusted/verified for the demo.
const VERIFIED_COMPANIES = [
  "BuildTech Construction Pte Ltd",
  "Metro Infrastructure Solutions",
  "Elite Engineering Contractors",
  "Foundation Specialists Pte Ltd",
];

const RISKY = {
  marker: "wa-demo-risky",
  title: "URGENT: High-Pay Welder — Apply Today",
  company: "QuickGold Manpower Agency",
  employerName: "QuickGold Manpower Agency",
  location: "west",
  category: "construction",
  type: "full-time",
  skills: ["Welding", "General Construction"],
  salary: 9000,
  salaryMax: 9000,
  salaryDisplay: "$9,000/mo (too good to be true)",
  description:
    "Earn $9000/month immediately! Limited slots. Pay a small $800 processing/agent fee today to secure your work permit and start this week. WhatsApp only.",
  requirements: ["Pay $800 processing fee", "Send passport copy"],
  benefits: ["Guaranteed permit"],
  status: "active",
  feeRequired: true,
  verificationStatus: "flagged",
  riskLevel: "high",
  riskReasons: [
    "Asks for an upfront $800 processing/agent fee",
    "Salary far above market with no clear reason",
    "WhatsApp-only recruitment, no verifiable company",
    "Requests passport copy upfront",
  ],
};

async function run() {
  console.log(`\nPatching demo verification data on project: ${sa.project_id}\n`);

  const snapshot = await db.collection("jobs").get();
  console.log(`Found ${snapshot.size} jobs.`);

  let verified = 0;
  let unverified = 0;
  const batch = db.batch();

  snapshot.forEach((doc) => {
    const job = doc.data();
    if (job.__demoMarker === RISKY.marker) return; // never touch the risky listing here

    const company = job.company || job.employerName || "";
    const shouldVerify = VERIFIED_COMPANIES.some((c) => company.includes(c) || c.includes(company));

    if (shouldVerify) {
      batch.set(
        doc.ref,
        {
          verificationStatus: "verified",
          verified: true,
          verificationNotes: { source: "demo-patch", verifiedAt: nowIso() },
          feeRequired: false,
          riskLevel: "low",
          updatedAt: nowIso(),
        },
        { merge: true }
      );
      verified += 1;
    } else if (!job.verificationStatus) {
      batch.set(doc.ref, { verificationStatus: "unverified", updatedAt: nowIso() }, { merge: true });
      unverified += 1;
    }
  });

  await batch.commit();
  console.log(`  ✓ Marked ${verified} jobs verified, ${unverified} jobs unverified.`);

  // Add the risky listing once.
  const existingRisky = await db
    .collection("jobs")
    .where("__demoMarker", "==", RISKY.marker)
    .limit(1)
    .get();

  if (existingRisky.empty) {
    const ref = await db.collection("jobs").add({
      ...RISKY,
      __demoMarker: RISKY.marker,
      postedAt: nowIso(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      views: 12,
      applicants: 0,
    });
    console.log(`  ✓ Added risky demo listing: ${ref.id} (${RISKY.company})`);
  } else {
    console.log(`  • Risky demo listing already present (${existingRisky.docs[0].id}) — skipped.`);
  }

  console.log("\nDone. Verified jobs rank first; the risky listing is flagged (hidden from search) and blocks applications.\n");
  process.exit(0);
}

run().catch((err) => {
  console.error("Patch failed:", err.message);
  process.exit(1);
});
