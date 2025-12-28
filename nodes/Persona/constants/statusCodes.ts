/**
 * Persona Status Codes
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

export const INQUIRY_STATUS = {
  CREATED: 'created',
  PENDING: 'pending',
  COMPLETED: 'completed',
  APPROVED: 'approved',
  DECLINED: 'declined',
  EXPIRED: 'expired',
  FAILED: 'failed',
  NEEDS_REVIEW: 'needs_review',
  MARKED_FOR_REVIEW: 'marked_for_review',
} as const;

export const VERIFICATION_STATUS = {
  INITIATED: 'initiated',
  SUBMITTED: 'submitted',
  PROCESSING: 'processing',
  PASSED: 'passed',
  FAILED: 'failed',
  REQUIRES_REVIEW: 'requires_review',
  CONFIRMED: 'confirmed',
} as const;

export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  REDACTED: 'redacted',
} as const;

export const CASE_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DECLINED: 'declined',
  FLAGGED: 'flagged',
  UNDER_REVIEW: 'under_review',
} as const;

export const WATCHLIST_HIT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FALSE_POSITIVE: 'false_positive',
  CLEARED: 'cleared',
} as const;

export const REPORT_STATUS = {
  PENDING: 'pending',
  READY: 'ready',
  ERROR: 'error',
} as const;

export const CHECK_STATUS = {
  PASSED: 'passed',
  FAILED: 'failed',
  NOT_APPLICABLE: 'not_applicable',
  REQUIRES_REVIEW: 'requires_review',
} as const;

export const RISK_LEVEL = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  VERY_HIGH: 'very_high',
  CRITICAL: 'critical',
} as const;

export type InquiryStatus = (typeof INQUIRY_STATUS)[keyof typeof INQUIRY_STATUS];
export type VerificationStatus = (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];
export type AccountStatus = (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];
export type CaseStatus = (typeof CASE_STATUS)[keyof typeof CASE_STATUS];
export type TransactionStatus = (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS];
export type WatchlistHitStatus = (typeof WATCHLIST_HIT_STATUS)[keyof typeof WATCHLIST_HIT_STATUS];
export type ReportStatus = (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS];
export type CheckStatus = (typeof CHECK_STATUS)[keyof typeof CHECK_STATUS];
export type RiskLevel = (typeof RISK_LEVEL)[keyof typeof RISK_LEVEL];
