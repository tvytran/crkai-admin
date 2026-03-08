export type CrudPermission = "r" | "ru" | "crud";

export interface EntityConfig {
  table: string;
  label: string;
  slug: string;
  crud: CrudPermission;
  orderBy?: string;
  limit?: number;
}

export const entities: Record<string, EntityConfig> = {
  profiles: {
    table: "profiles",
    label: "Users",
    slug: "profiles",
    crud: "r",
    orderBy: "created_datetime_utc",
  },
  images: {
    table: "images",
    label: "Images",
    slug: "images",
    crud: "crud",
    orderBy: "created_datetime_utc",
  },
  "humor-flavors": {
    table: "humor_flavors",
    label: "Humor Flavors",
    slug: "humor-flavors",
    crud: "r",
  },
  "humor-flavor-steps": {
    table: "humor_flavor_steps",
    label: "Humor Flavor Steps",
    slug: "humor-flavor-steps",
    crud: "r",
  },
  "humor-mix": {
    table: "humor_mix",
    label: "Humor Mix",
    slug: "humor-mix",
    crud: "ru",
  },
  "example-captions": {
    table: "example_captions",
    label: "Example Captions",
    slug: "example-captions",
    crud: "crud",
  },
  terms: {
    table: "terms",
    label: "Terms",
    slug: "terms",
    crud: "crud",
  },
  captions: {
    table: "captions",
    label: "Captions",
    slug: "captions",
    crud: "r",
    orderBy: "created_datetime_utc",
  },
  "caption-requests": {
    table: "caption_requests",
    label: "Caption Requests",
    slug: "caption-requests",
    crud: "r",
  },
  "caption-examples": {
    table: "caption_examples",
    label: "Caption Examples",
    slug: "caption-examples",
    crud: "crud",
  },
  "llm-models": {
    table: "llm_models",
    label: "LLM Models",
    slug: "llm-models",
    crud: "crud",
  },
  "llm-providers": {
    table: "llm_providers",
    label: "LLM Providers",
    slug: "llm-providers",
    crud: "crud",
  },
  "llm-prompt-chains": {
    table: "llm_prompt_chains",
    label: "LLM Prompt Chains",
    slug: "llm-prompt-chains",
    crud: "r",
  },
  "llm-responses": {
    table: "llm_responses",
    label: "LLM Responses",
    slug: "llm-responses",
    crud: "r",
  },
  "allowed-signup-domains": {
    table: "allowed_signup_domains",
    label: "Allowed Signup Domains",
    slug: "allowed-signup-domains",
    crud: "crud",
  },
  "whitelisted-emails": {
    table: "whitelisted_email_addresses",
    label: "Whitelisted Emails",
    slug: "whitelisted-emails",
    crud: "crud",
  },
};

export const allowedTables = Object.values(entities).map((e) => e.table);

export function getEntityByTable(table: string): EntityConfig | undefined {
  return Object.values(entities).find((e) => e.table === table);
}

export function getEntityBySlug(slug: string): EntityConfig | undefined {
  return entities[slug];
}
