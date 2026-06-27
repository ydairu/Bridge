import { verifyEmployerOrOffer } from "../services/verification.js";
import { generateAssessmentQuestions, normalizeDifficulty } from "../services/assessments.js";

export function createBridgeToolExecutor({ bridgeService, openAIConfig, exaApiKey, userId }) {
  return async function executeTool(name, args = {}) {
    switch (name) {
      case "get_profile":
        return bridgeService.getProfile({ userId });

      case "create_or_update_profile":
        return bridgeService.updateProfile({ userId, profile: args });

      case "search_jobs":
        return bridgeService.searchJobs({ userId, ...args });

      case "get_job":
        return bridgeService.getJob({ jobId: args.jobId });

      case "start_application":
        return bridgeService.startApplication({ userId, jobId: args.jobId });

      case "submit_application":
        return bridgeService.submitApplication({
          userId,
          jobId: args.jobId,
          coverLetter: args.coverLetter,
          answers: args.answers || {},
        });

      case "list_applications":
        return bridgeService.listApplications({ userId });

      case "get_application_status":
        return bridgeService.getApplicationStatus({ userId, applicationId: args.applicationId || "" });

      case "start_assessment": {
        const difficulty = normalizeDifficulty(args.difficulty);
        const questions = await generateAssessmentQuestions({
          openAIConfig,
          skill: args.skill,
          difficulty,
        });
        return bridgeService.startAssessment({
          userId,
          skill: String(args.skill || "").trim(),
          difficulty,
          questions,
        });
      }

      case "submit_assessment":
        return bridgeService.submitAssessment({ userId, answers: args.answers || [] });

      case "get_achievements":
        return bridgeService.getAchievements({ userId });

      case "get_employer_reviews":
        return bridgeService.getEmployerReviews({
          company: args.company || "",
          employerId: args.employerId || "",
        });

      case "verify_employer": {
        const job = await bridgeService.getJob({ jobId: args.jobId });
        if (!job) throw new Error("Job not found");
        const result = await verifyEmployerOrOffer({
          openAIConfig,
          exaApiKey,
          target: {
            company: job.company,
            employerName: job.employer?.companyName || job.company,
            website: job.employer?.website || "",
            registeredId: job.employer?.companyUEN || "",
          },
        });
        await bridgeService.updateJobVerification({ jobId: args.jobId, verification: result });
        await bridgeService.saveVerificationRun({
          target: { source: "listed_job", jobId: args.jobId, company: job.company },
          result,
          evidence: result.evidence || [],
        });
        return { jobId: args.jobId, company: job.company, ...result };
      }

      case "scam_check": {
        const result = await verifyEmployerOrOffer({
          openAIConfig,
          exaApiKey,
          target: {
            company: args.company || "",
            website: args.website || "",
            registeredId: args.registeredId || "",
          },
          offerText: args.offerText || "",
        });
        await bridgeService.saveVerificationRun({
          target: { source: "whatsapp_offer", company: args.company || "" },
          result,
          evidence: result.evidence || [],
        });
        return result;
      }

      case "request_support":
        return bridgeService.requestSupport({
          userId,
          topic: args.topic || "general",
          message: args.message || "",
        });

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  };
}
