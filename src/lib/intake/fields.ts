/** Core field allowlist for T0 form projection + gateway validation. */

export const CORE_FIELD_IDS = [
  "business_name",
  "business_type",
  "website_or_domain",
  "service_area",
  "primary_objective",
  "current_problem",
  "desired_outcome",
  "customer_actions",
  "staff_workflow",
  "seo_visibility_needs",
  "current_tools",
  "timing",
  "constraints",
  "other_context",
  "contact_name",
  "contact_email",
  "contact_phone",
  "preferred_followup",
] as const;

export type CoreFieldId = (typeof CORE_FIELD_IDS)[number];

export const FIELD_LABELS: Record<CoreFieldId, string> = {
  business_name: "Business name",
  business_type: "Kind of business",
  website_or_domain: "Website / domain",
  service_area: "Service area",
  primary_objective: "Primary objective",
  current_problem: "Current problem",
  desired_outcome: "Desired outcome",
  customer_actions: "What customers should be able to do",
  staff_workflow: "What happens on your side",
  seo_visibility_needs: "Getting found",
  current_tools: "What exists today (tools / systems)",
  timing: "Timing",
  constraints: "Constraints",
  other_context: "Other important context",
  contact_name: "Your name",
  contact_email: "Email",
  contact_phone: "Phone",
  preferred_followup: "Preferred follow-up",
};

/** Form-visible core set for T0 (subset; full list still valid on gateway). */
export const FORM_FIELD_IDS: CoreFieldId[] = [
  "business_name",
  "business_type",
  "current_problem",
  "primary_objective",
  "desired_outcome",
  "customer_actions",
  "contact_name",
  "contact_email",
];

export function isAllowedFieldId(id: string): id is CoreFieldId {
  return (CORE_FIELD_IDS as readonly string[]).includes(id);
}
