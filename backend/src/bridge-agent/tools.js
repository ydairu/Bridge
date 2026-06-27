import { verifyEmployerOrOffer } from "../services/verification.js";

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
