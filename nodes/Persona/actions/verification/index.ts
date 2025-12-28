/**
 * Persona Verification Actions
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

import { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { personaApiRequest, personaApiRequestAllItems } from '../../transport/personaApi';
import { ENDPOINTS } from '../../constants/endpoints';

export const verificationOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['verification'],
      },
    },
    options: [
      { name: 'Get', value: 'get', description: 'Get a verification by ID', action: 'Get a verification' },
      { name: 'Get by Inquiry', value: 'getByInquiry', description: 'Get verifications for an inquiry', action: 'Get verifications by inquiry' },
      { name: 'Get Database Verification', value: 'getDatabaseVerification', description: 'Get a database verification', action: 'Get database verification' },
      { name: 'Get Document Verification', value: 'getDocumentVerification', description: 'Get a document verification', action: 'Get document verification' },
      { name: 'Get Email Verification', value: 'getEmailVerification', description: 'Get an email verification', action: 'Get email verification' },
      { name: 'Get Government ID Verification', value: 'getGovernmentIdVerification', description: 'Get a government ID verification', action: 'Get government ID verification' },
      { name: 'Get Phone Verification', value: 'getPhoneVerification', description: 'Get a phone verification', action: 'Get phone verification' },
      { name: 'Get Selfie Verification', value: 'getSelfieVerification', description: 'Get a selfie verification', action: 'Get selfie verification' },
      { name: 'Get Verification Checks', value: 'getChecks', description: 'Get checks for a verification', action: 'Get verification checks' },
      { name: 'Get Verification History', value: 'getHistory', description: 'Get history for a verification', action: 'Get verification history' },
      { name: 'List', value: 'list', description: 'List all verifications', action: 'List verifications' },
      { name: 'Retry', value: 'retry', description: 'Retry a verification', action: 'Retry a verification' },
    ],
    default: 'list',
  },
];

export const verificationFields: INodeProperties[] = [
  {
    displayName: 'Verification ID',
    name: 'verificationId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'ver_...',
    description: 'The ID of the verification',
    displayOptions: {
      show: {
        resource: ['verification'],
        operation: ['get', 'getChecks', 'getHistory', 'retry'],
      },
    },
  },
  {
    displayName: 'Inquiry ID',
    name: 'inquiryId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'inq_...',
    description: 'The ID of the inquiry',
    displayOptions: {
      show: {
        resource: ['verification'],
        operation: ['getByInquiry'],
      },
    },
  },
  {
    displayName: 'Government ID Verification ID',
    name: 'governmentIdVerificationId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'ver_...',
    description: 'The ID of the government ID verification',
    displayOptions: {
      show: {
        resource: ['verification'],
        operation: ['getGovernmentIdVerification'],
      },
    },
  },
  {
    displayName: 'Selfie Verification ID',
    name: 'selfieVerificationId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'ver_...',
    description: 'The ID of the selfie verification',
    displayOptions: {
      show: {
        resource: ['verification'],
        operation: ['getSelfieVerification'],
      },
    },
  },
  {
    displayName: 'Database Verification ID',
    name: 'databaseVerificationId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'ver_...',
    description: 'The ID of the database verification',
    displayOptions: {
      show: {
        resource: ['verification'],
        operation: ['getDatabaseVerification'],
      },
    },
  },
  {
    displayName: 'Document Verification ID',
    name: 'documentVerificationId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'ver_...',
    description: 'The ID of the document verification',
    displayOptions: {
      show: {
        resource: ['verification'],
        operation: ['getDocumentVerification'],
      },
    },
  },
  {
    displayName: 'Phone Verification ID',
    name: 'phoneVerificationId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'ver_...',
    description: 'The ID of the phone verification',
    displayOptions: {
      show: {
        resource: ['verification'],
        operation: ['getPhoneVerification'],
      },
    },
  },
  {
    displayName: 'Email Verification ID',
    name: 'emailVerificationId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'ver_...',
    description: 'The ID of the email verification',
    displayOptions: {
      show: {
        resource: ['verification'],
        operation: ['getEmailVerification'],
      },
    },
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
    displayOptions: {
      show: {
        resource: ['verification'],
        operation: ['list'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    description: 'Max number of results to return',
    typeOptions: { minValue: 1, maxValue: 500 },
    displayOptions: {
      show: {
        resource: ['verification'],
        operation: ['list'],
        returnAll: [false],
      },
    },
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['verification'],
        operation: ['list'],
      },
    },
    options: [
      {
        displayName: 'Status',
        name: 'status',
        type: 'multiOptions',
        options: [
          { name: 'Initiated', value: 'initiated' },
          { name: 'Submitted', value: 'submitted' },
          { name: 'Passed', value: 'passed' },
          { name: 'Failed', value: 'failed' },
          { name: 'Requires Review', value: 'requires_review' },
          { name: 'Confirmed', value: 'confirmed' },
        ],
        default: [],
        description: 'Filter by verification status',
      },
      {
        displayName: 'Verification Type',
        name: 'verificationType',
        type: 'multiOptions',
        options: [
          { name: 'Government ID', value: 'verification/government-ids' },
          { name: 'Selfie', value: 'verification/selfies' },
          { name: 'Database', value: 'verification/databases' },
          { name: 'Phone', value: 'verification/phone-numbers' },
          { name: 'Email', value: 'verification/email-addresses' },
          { name: 'Document', value: 'verification/documents' },
        ],
        default: [],
        description: 'Filter by verification type',
      },
      {
        displayName: 'Inquiry ID',
        name: 'inquiryId',
        type: 'string',
        default: '',
        description: 'Filter by inquiry ID',
      },
    ],
  },
];

export async function executeVerificationOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'get': {
      const verificationId = this.getNodeParameter('verificationId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.VERIFICATION_BY_ID(verificationId),
      });
      break;
    }

    case 'getByInquiry': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.INQUIRY_VERIFICATIONS(inquiryId),
      });
      break;
    }

    case 'list': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const qs: IDataObject = {};

      if (filters.status && (filters.status as string[]).length > 0) {
        qs['filter[status]'] = (filters.status as string[]).join(',');
      }
      if (filters.verificationType && (filters.verificationType as string[]).length > 0) {
        qs['filter[verification-type]'] = (filters.verificationType as string[]).join(',');
      }
      if (filters.inquiryId) {
        qs['filter[inquiry-id]'] = filters.inquiryId;
      }

      if (returnAll) {
        const items = await personaApiRequestAllItems.call(this, ENDPOINTS.VERIFICATIONS, qs);
        responseData = { data: items };
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        qs['page[size]'] = limit;
        responseData = await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: ENDPOINTS.VERIFICATIONS,
          qs,
        });
      }
      break;
    }

    case 'getGovernmentIdVerification': {
      const verificationId = this.getNodeParameter('governmentIdVerificationId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.VERIFICATION_GOVERNMENT_ID_BY_ID(verificationId),
      });
      break;
    }

    case 'getSelfieVerification': {
      const verificationId = this.getNodeParameter('selfieVerificationId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.VERIFICATION_SELFIE_BY_ID(verificationId),
      });
      break;
    }

    case 'getDatabaseVerification': {
      const verificationId = this.getNodeParameter('databaseVerificationId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.VERIFICATION_DATABASE_BY_ID(verificationId),
      });
      break;
    }

    case 'getDocumentVerification': {
      const verificationId = this.getNodeParameter('documentVerificationId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.VERIFICATION_DOCUMENT_BY_ID(verificationId),
      });
      break;
    }

    case 'getPhoneVerification': {
      const verificationId = this.getNodeParameter('phoneVerificationId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.VERIFICATION_PHONE_NUMBERS + `/${verificationId}`,
      });
      break;
    }

    case 'getEmailVerification': {
      const verificationId = this.getNodeParameter('emailVerificationId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.VERIFICATION_EMAIL_ADDRESSES + `/${verificationId}`,
      });
      break;
    }

    case 'getChecks': {
      const verificationId = this.getNodeParameter('verificationId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `${ENDPOINTS.VERIFICATION_BY_ID(verificationId)}/checks`,
      });
      break;
    }

    case 'getHistory': {
      const verificationId = this.getNodeParameter('verificationId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `${ENDPOINTS.VERIFICATION_BY_ID(verificationId)}/history`,
      });
      break;
    }

    case 'retry': {
      const verificationId = this.getNodeParameter('verificationId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: `${ENDPOINTS.VERIFICATION_BY_ID(verificationId)}/retry`,
      });
      break;
    }
  }

  return responseData;
}
