/**
 * Persona Document Types
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

export const GOVERNMENT_ID_TYPES = {
  PASSPORT: 'passport',
  DRIVERS_LICENSE: 'drivers_license',
  NATIONAL_ID: 'national_id',
  RESIDENCE_PERMIT: 'residence_permit',
  VISA: 'visa',
  WORK_PERMIT: 'work_permit',
  VOTER_ID: 'voter_id',
  TAX_ID: 'tax_id',
  MILITARY_ID: 'military_id',
  HEALTH_CARD: 'health_card',
  TRAVEL_DOCUMENT: 'travel_document',
} as const;

export const DOCUMENT_TYPES = {
  // Government IDs
  ...GOVERNMENT_ID_TYPES,

  // Proof of Address
  UTILITY_BILL: 'utility_bill',
  BANK_STATEMENT: 'bank_statement',
  CREDIT_CARD_STATEMENT: 'credit_card_statement',
  INSURANCE_DOCUMENT: 'insurance_document',
  TAX_RETURN: 'tax_return',
  LEASE_AGREEMENT: 'lease_agreement',
  MORTGAGE_STATEMENT: 'mortgage_statement',
  GOVERNMENT_LETTER: 'government_letter',

  // Business Documents
  ARTICLES_OF_INCORPORATION: 'articles_of_incorporation',
  BUSINESS_LICENSE: 'business_license',
  CERTIFICATE_OF_FORMATION: 'certificate_of_formation',
  PARTNERSHIP_AGREEMENT: 'partnership_agreement',
  OPERATING_AGREEMENT: 'operating_agreement',
  BUSINESS_TAX_RETURN: 'business_tax_return',
  ANNUAL_REPORT: 'annual_report',

  // Other Documents
  PROOF_OF_EMPLOYMENT: 'proof_of_employment',
  PAY_STUB: 'pay_stub',
  W2: 'w2',
  SOCIAL_SECURITY_CARD: 'social_security_card',
  BIRTH_CERTIFICATE: 'birth_certificate',
  MARRIAGE_CERTIFICATE: 'marriage_certificate',
  GENERIC: 'generic',
} as const;

export const DOCUMENT_SIDE = {
  FRONT: 'front',
  BACK: 'back',
} as const;

export const SELFIE_POSE = {
  CENTER: 'center',
  LEFT: 'left',
  RIGHT: 'right',
} as const;

export const VERIFICATION_TYPES = {
  GOVERNMENT_ID: 'verification/government-ids',
  SELFIE: 'verification/selfies',
  DATABASE: 'verification/databases',
  PHONE: 'verification/phone-numbers',
  EMAIL: 'verification/email-addresses',
  DOCUMENT: 'verification/documents',
} as const;

export const CHECK_TYPES = {
  // Government ID Checks
  ID_COMPARISON: 'id_comparison',
  ID_VALID: 'id_valid',
  ID_AUTHENTIC: 'id_authentic',
  ID_NOT_EXPIRED: 'id_not_expired',
  ID_BARCODE_VALID: 'id_barcode_valid',
  ID_MRZ_VALID: 'id_mrz_valid',
  ID_NFC_VALID: 'id_nfc_valid',

  // Selfie Checks
  SELFIE_LIVENESS: 'selfie_liveness',
  SELFIE_ID_COMPARISON: 'selfie_id_comparison',
  SELFIE_POSE_DETECTION: 'selfie_pose_detection',
  SELFIE_FACE_QUALITY: 'selfie_face_quality',
  SELFIE_MULTIPLE_FACES: 'selfie_multiple_faces',

  // Database Checks
  DATABASE_MATCH: 'database_match',
  DATABASE_NAME_MATCH: 'database_name_match',
  DATABASE_DOB_MATCH: 'database_dob_match',
  DATABASE_ADDRESS_MATCH: 'database_address_match',
  DATABASE_SSN_MATCH: 'database_ssn_match',
  DATABASE_PHONE_MATCH: 'database_phone_match',

  // Watchlist Checks
  WATCHLIST_SANCTIONS: 'watchlist_sanctions',
  WATCHLIST_PEP: 'watchlist_pep',
  WATCHLIST_ADVERSE_MEDIA: 'watchlist_adverse_media',
  WATCHLIST_WARNING_LISTS: 'watchlist_warning_lists',

  // Report Checks
  REPORT_CRIMINAL: 'report_criminal',
  REPORT_CIVIL: 'report_civil',
  REPORT_EVICTION: 'report_eviction',
  REPORT_CREDIT: 'report_credit',
  REPORT_EMPLOYMENT: 'report_employment',
  REPORT_EDUCATION: 'report_education',
} as const;

export type GovernmentIdType = (typeof GOVERNMENT_ID_TYPES)[keyof typeof GOVERNMENT_ID_TYPES];
export type DocumentType = (typeof DOCUMENT_TYPES)[keyof typeof DOCUMENT_TYPES];
export type DocumentSide = (typeof DOCUMENT_SIDE)[keyof typeof DOCUMENT_SIDE];
export type SelfiePose = (typeof SELFIE_POSE)[keyof typeof SELFIE_POSE];
export type VerificationType = (typeof VERIFICATION_TYPES)[keyof typeof VERIFICATION_TYPES];
export type CheckType = (typeof CHECK_TYPES)[keyof typeof CHECK_TYPES];
