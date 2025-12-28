/**
 * Persona Event Types
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

export const INQUIRY_EVENT_TYPES = [
  'inquiry.created',
  'inquiry.started',
  'inquiry.completed',
  'inquiry.approved',
  'inquiry.declined',
  'inquiry.expired',
  'inquiry.failed',
  'inquiry.pending',
  'inquiry.needs-review',
  'inquiry.transitioned',
  'inquiry.marked-for-review',
  'inquiry.session.started',
  'inquiry.session.expired',
] as const;

export const VERIFICATION_EVENT_TYPES = [
  'verification.passed',
  'verification.failed',
  'verification.requires-review',
  'verification.government-id.submitted',
  'verification.government-id.passed',
  'verification.government-id.failed',
  'verification.selfie.submitted',
  'verification.selfie.passed',
  'verification.selfie.failed',
  'verification.database.submitted',
  'verification.database.passed',
  'verification.database.failed',
  'verification.document.submitted',
  'verification.document.passed',
  'verification.document.failed',
  'verification.phone-number.submitted',
  'verification.phone-number.passed',
  'verification.phone-number.failed',
  'verification.email-address.submitted',
  'verification.email-address.passed',
  'verification.email-address.failed',
] as const;

export const ACCOUNT_EVENT_TYPES = [
  'account.created',
  'account.updated',
  'account.redacted',
  'account.merged',
  'account.tag.added',
  'account.tag.removed',
  'account.consolidated',
] as const;

export const WATCHLIST_EVENT_TYPES = [
  'watchlist.hit.detected',
  'watchlist.hit.cleared',
  'watchlist.hit.confirmed',
  'watchlist.hit.false-positive',
  'watchlist.ongoing-monitoring.alert',
] as const;

export const TRANSACTION_EVENT_TYPES = [
  'transaction.created',
  'transaction.updated',
  'transaction.approved',
  'transaction.declined',
  'transaction.flagged',
  'transaction.high-risk',
  'transaction.redacted',
] as const;

export const CASE_EVENT_TYPES = [
  'case.created',
  'case.assigned',
  'case.updated',
  'case.closed',
  'case.reopened',
  'case.comment.added',
] as const;

export const DOCUMENT_EVENT_TYPES = [
  'document.submitted',
  'document.processed',
  'document.rejected',
  'document.expired',
] as const;

export const SESSION_EVENT_TYPES = [
  'session.started',
  'session.completed',
  'session.abandoned',
  'session.timeout',
] as const;

export const REPORT_EVENT_TYPES = [
  'report.generated',
  'report.updated',
  'report.adverse-media.found',
  'report.pep.match',
  'report.watchlist.match',
] as const;

export const ALL_EVENT_TYPES = [
  ...INQUIRY_EVENT_TYPES,
  ...VERIFICATION_EVENT_TYPES,
  ...ACCOUNT_EVENT_TYPES,
  ...WATCHLIST_EVENT_TYPES,
  ...TRANSACTION_EVENT_TYPES,
  ...CASE_EVENT_TYPES,
  ...DOCUMENT_EVENT_TYPES,
  ...SESSION_EVENT_TYPES,
  ...REPORT_EVENT_TYPES,
] as const;

export type InquiryEventType = (typeof INQUIRY_EVENT_TYPES)[number];
export type VerificationEventType = (typeof VERIFICATION_EVENT_TYPES)[number];
export type AccountEventType = (typeof ACCOUNT_EVENT_TYPES)[number];
export type WatchlistEventType = (typeof WATCHLIST_EVENT_TYPES)[number];
export type TransactionEventType = (typeof TRANSACTION_EVENT_TYPES)[number];
export type CaseEventType = (typeof CASE_EVENT_TYPES)[number];
export type DocumentEventType = (typeof DOCUMENT_EVENT_TYPES)[number];
export type SessionEventType = (typeof SESSION_EVENT_TYPES)[number];
export type ReportEventType = (typeof REPORT_EVENT_TYPES)[number];
export type AllEventType = (typeof ALL_EVENT_TYPES)[number];
