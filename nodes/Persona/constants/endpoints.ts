/**
 * Persona API Endpoints
 *
 * [Velocity BPA Licensing Notice]
 *
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 *
 * Use of this node by for-profit organizations in production environments requires
 * a commercial license from Velocity BPA.
 *
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

export const PERSONA_API_ENDPOINTS = {
  PRODUCTION: 'https://withpersona.com/api/v1',
  SANDBOX: 'https://withpersona.com/api/v1',
} as const;

export const API_VERSIONS = {
  CURRENT: '2023-01-05',
  LEGACY: '2022-09-01',
} as const;

export const ENDPOINTS = {
  // Inquiry endpoints
  INQUIRIES: '/inquiries',
  INQUIRY_BY_ID: (id: string) => `/inquiries/${id}`,
  INQUIRY_RESUME: (id: string) => `/inquiries/${id}/resume`,
  INQUIRY_REDACT: (id: string) => `/inquiries/${id}/redact`,
  INQUIRY_EXPIRE: (id: string) => `/inquiries/${id}/expire`,
  INQUIRY_APPROVE: (id: string) => `/inquiries/${id}/approve`,
  INQUIRY_DECLINE: (id: string) => `/inquiries/${id}/decline`,
  INQUIRY_ADD_TAG: (id: string) => `/inquiries/${id}/add-tag`,
  INQUIRY_REMOVE_TAG: (id: string) => `/inquiries/${id}/remove-tag`,
  INQUIRY_SESSIONS: (id: string) => `/inquiries/${id}/sessions`,
  INQUIRY_VERIFICATIONS: (id: string) => `/inquiries/${id}/verifications`,
  INQUIRY_DOCUMENTS: (id: string) => `/inquiries/${id}/documents`,
  INQUIRY_SELFIES: (id: string) => `/inquiries/${id}/selfies`,
  INQUIRY_REPORTS: (id: string) => `/inquiries/${id}/reports`,
  INQUIRY_ONE_TIME_LINK: (id: string) => `/inquiries/${id}/generate-one-time-link`,
  INQUIRY_FIELDS: (id: string) => `/inquiries/${id}/fields`,
  INQUIRY_TRANSITION: (id: string) => `/inquiries/${id}/transition`,

  // Verification endpoints
  VERIFICATIONS: '/verifications',
  VERIFICATION_BY_ID: (id: string) => `/verifications/${id}`,
  VERIFICATION_GOVERNMENT_IDS: '/verification/government-ids',
  VERIFICATION_GOVERNMENT_ID_BY_ID: (id: string) => `/verification/government-ids/${id}`,
  VERIFICATION_DATABASES: '/verification/databases',
  VERIFICATION_DATABASE_BY_ID: (id: string) => `/verification/databases/${id}`,
  VERIFICATION_SELFIES: '/verification/selfies',
  VERIFICATION_SELFIE_BY_ID: (id: string) => `/verification/selfies/${id}`,
  VERIFICATION_PHONE_NUMBERS: '/verification/phone-numbers',
  VERIFICATION_EMAIL_ADDRESSES: '/verification/email-addresses',
  VERIFICATION_DOCUMENTS: '/verification/documents',
  VERIFICATION_DOCUMENT_BY_ID: (id: string) => `/verification/documents/${id}`,

  // Account endpoints
  ACCOUNTS: '/accounts',
  ACCOUNT_BY_ID: (id: string) => `/accounts/${id}`,
  ACCOUNT_REDACT: (id: string) => `/accounts/${id}/redact`,
  ACCOUNT_ADD_TAG: (id: string) => `/accounts/${id}/add-tag`,
  ACCOUNT_REMOVE_TAG: (id: string) => `/accounts/${id}/remove-tag`,
  ACCOUNT_MERGE: (id: string) => `/accounts/${id}/merge`,
  ACCOUNT_INQUIRIES: (id: string) => `/accounts/${id}/inquiries`,
  ACCOUNT_TRANSACTIONS: (id: string) => `/accounts/${id}/transactions`,
  ACCOUNT_CONSOLIDATE: (id: string) => `/accounts/${id}/consolidate`,

  // Document endpoints
  DOCUMENTS: '/documents',
  DOCUMENT_BY_ID: (id: string) => `/documents/${id}`,
  DOCUMENT_DOWNLOAD: (id: string, side: string) => `/documents/${id}/${side}`,
  DOCUMENT_GENERIC: '/documents/generics',
  DOCUMENT_GENERIC_BY_ID: (id: string) => `/documents/generics/${id}`,

  // Selfie endpoints
  SELFIES: '/selfies',
  SELFIE_BY_ID: (id: string) => `/selfies/${id}`,
  SELFIE_DOWNLOAD: (id: string, pose: string) => `/selfies/${id}/${pose}`,

  // Government ID endpoints
  GOVERNMENT_IDS: '/government-ids',
  GOVERNMENT_ID_BY_ID: (id: string) => `/government-ids/${id}`,
  GOVERNMENT_ID_FRONT: (id: string) => `/government-ids/${id}/front`,
  GOVERNMENT_ID_BACK: (id: string) => `/government-ids/${id}/back`,

  // Report endpoints
  REPORTS: '/reports',
  REPORT_BY_ID: (id: string) => `/reports/${id}`,
  REPORT_ADVERSE_MEDIA: '/reports/adverse-media',
  REPORT_WATCHLIST: '/reports/watchlist',
  REPORT_PEP: '/reports/pep',
  REPORT_SOCIAL_MEDIA: '/reports/social-media',
  REPORT_BACKGROUND_CHECK: '/reports/background-checks',

  // Watchlist endpoints
  WATCHLIST_SCREEN: '/watchlist/screen',
  WATCHLIST_HITS: '/watchlist-hits',
  WATCHLIST_HIT_BY_ID: (id: string) => `/watchlist-hits/${id}`,

  // Transaction endpoints
  TRANSACTIONS: '/transactions',
  TRANSACTION_BY_ID: (id: string) => `/transactions/${id}`,
  TRANSACTION_REDACT: (id: string) => `/transactions/${id}/redact`,
  TRANSACTION_LABEL: (id: string) => `/transactions/${id}/label`,

  // Case endpoints
  CASES: '/cases',
  CASE_BY_ID: (id: string) => `/cases/${id}`,
  CASE_ASSIGN: (id: string) => `/cases/${id}/assign`,
  CASE_CLOSE: (id: string) => `/cases/${id}/close`,
  CASE_REOPEN: (id: string) => `/cases/${id}/reopen`,
  CASE_COMMENTS: (id: string) => `/cases/${id}/comments`,

  // Template endpoints
  TEMPLATES: '/inquiry-templates',
  TEMPLATE_BY_ID: (id: string) => `/inquiry-templates/${id}`,
  TEMPLATE_CLONE: (id: string) => `/inquiry-templates/${id}/clone`,
  TEMPLATE_ARCHIVE: (id: string) => `/inquiry-templates/${id}/archive`,
  TEMPLATE_RESTORE: (id: string) => `/inquiry-templates/${id}/restore`,

  // Workflow endpoints
  WORKFLOWS: '/workflows',
  WORKFLOW_BY_ID: (id: string) => `/workflows/${id}`,
  WORKFLOW_RUNS: (id: string) => `/workflows/${id}/runs`,

  // Event endpoints
  EVENTS: '/events',
  EVENT_BY_ID: (id: string) => `/events/${id}`,

  // Webhook endpoints
  WEBHOOKS: '/webhooks',
  WEBHOOK_BY_ID: (id: string) => `/webhooks/${id}`,
  WEBHOOK_TEST: (id: string) => `/webhooks/${id}/test`,
  WEBHOOK_DELIVERIES: (id: string) => `/webhooks/${id}/deliveries`,
  WEBHOOK_EVENTS: (id: string) => `/webhooks/${id}/events`,

  // List endpoints
  LISTS: '/lists',
  LIST_BY_ID: (id: string) => `/lists/${id}`,
  LIST_ITEMS: (id: string) => `/lists/${id}/items`,
  LIST_ITEM_BY_ID: (listId: string, itemId: string) => `/lists/${listId}/items/${itemId}`,

  // API Log endpoints
  API_LOGS: '/api-logs',
  API_LOG_BY_ID: (id: string) => `/api-logs/${id}`,

  // Session endpoints
  SESSIONS: '/sessions',
  SESSION_BY_ID: (id: string) => `/sessions/${id}`,

  // Embedded Flow endpoints
  EMBEDDED_GENERATE_LINK: '/inquiries/generate-one-time-link',
  THEMES: '/themes',
  THEME_BY_ID: (id: string) => `/themes/${id}`,
} as const;
