export const BRIDGE_TOOLS = [
  {
    type: "function",
    function: {
      name: "get_profile",
      description: "Get the current worker profile.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "create_or_update_profile",
      description: "Create or update the current worker profile from chat.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          language: { type: "string", description: "ISO-like language code such as en, bn, ta, hi, id, my, tl." },
          countryOfOrigin: { type: "string" },
          currentLocation: { type: "string" },
          skills: { type: "array", items: { type: "string" } },
          experience: { type: "string" },
          experienceSummary: { type: "string" },
          profileComplete: { type: "boolean" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_jobs",
      description: "Search Bridge jobs. Verified and skill-matched jobs are ranked first.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          location: { type: "string" },
          skills: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_job",
      description: "Get full job details by job ID.",
      parameters: {
        type: "object",
        properties: { jobId: { type: "string" } },
        required: ["jobId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "start_application",
      description: "Start a direct application for a safe Bridge job.",
      parameters: {
        type: "object",
        properties: { jobId: { type: "string" } },
        required: ["jobId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "submit_application",
      description: "Submit an application for the current worker.",
      parameters: {
        type: "object",
        properties: {
          jobId: { type: "string" },
          coverLetter: { type: "string" },
          answers: { type: "object" },
        },
        required: ["jobId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_applications",
      description: "List recent applications for the current worker.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "get_application_status",
      description: "Get one application status or the latest application status.",
      parameters: {
        type: "object",
        properties: { applicationId: { type: "string" } },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "scam_check",
      description: "Check a pasted external job offer or message for scam and exploitation risk.",
      parameters: {
        type: "object",
        properties: {
          offerText: { type: "string" },
          company: { type: "string" },
          website: { type: "string" },
          registeredId: { type: "string" },
        },
        required: ["offerText"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "request_support",
      description: "Create a support ticket for human follow-up.",
      parameters: {
        type: "object",
        properties: {
          topic: { type: "string" },
          message: { type: "string" },
        },
        additionalProperties: false,
      },
    },
  },
];
