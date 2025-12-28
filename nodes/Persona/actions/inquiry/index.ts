/**
 * Persona Inquiry Actions
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

export const inquiryOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['inquiry'],
      },
    },
    options: [
      { name: 'Approve', value: 'approve', description: 'Approve an inquiry', action: 'Approve an inquiry' },
      { name: 'Create', value: 'create', description: 'Create a new inquiry', action: 'Create an inquiry' },
      { name: 'Decline', value: 'decline', description: 'Decline an inquiry', action: 'Decline an inquiry' },
      { name: 'Expire', value: 'expire', description: 'Expire an inquiry', action: 'Expire an inquiry' },
      { name: 'Generate One-Time Link', value: 'generateOneTimeLink', description: 'Generate a one-time link for an inquiry', action: 'Generate one time link' },
      { name: 'Get', value: 'get', description: 'Get an inquiry by ID', action: 'Get an inquiry' },
      { name: 'Get by Reference ID', value: 'getByReferenceId', description: 'Get an inquiry by reference ID', action: 'Get inquiry by reference ID' },
      { name: 'Get Documents', value: 'getDocuments', description: 'Get documents for an inquiry', action: 'Get inquiry documents' },
      { name: 'Get Fields', value: 'getFields', description: 'Get fields for an inquiry', action: 'Get inquiry fields' },
      { name: 'Get Reports', value: 'getReports', description: 'Get reports for an inquiry', action: 'Get inquiry reports' },
      { name: 'Get Selfies', value: 'getSelfies', description: 'Get selfies for an inquiry', action: 'Get inquiry selfies' },
      { name: 'Get Sessions', value: 'getSessions', description: 'Get sessions for an inquiry', action: 'Get inquiry sessions' },
      { name: 'Get Verifications', value: 'getVerifications', description: 'Get verifications for an inquiry', action: 'Get inquiry verifications' },
      { name: 'List', value: 'list', description: 'List all inquiries', action: 'List inquiries' },
      { name: 'Redact', value: 'redact', description: 'Redact an inquiry', action: 'Redact an inquiry' },
      { name: 'Resume', value: 'resume', description: 'Resume an inquiry', action: 'Resume an inquiry' },
      { name: 'Set Fields', value: 'setFields', description: 'Set fields on an inquiry', action: 'Set inquiry fields' },
      { name: 'Transition', value: 'transition', description: 'Transition an inquiry to a new status', action: 'Transition an inquiry' },
      { name: 'Update', value: 'update', description: 'Update an inquiry', action: 'Update an inquiry' },
      { name: 'Add Tag', value: 'addTag', description: 'Add a tag to an inquiry', action: 'Add tag to inquiry' },
      { name: 'Remove Tag', value: 'removeTag', description: 'Remove a tag from an inquiry', action: 'Remove tag from inquiry' },
    ],
    default: 'list',
  },
];

export const inquiryFields: INodeProperties[] = [
  // Inquiry ID field (used by most operations)
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
        resource: ['inquiry'],
        operation: ['get', 'approve', 'decline', 'expire', 'redact', 'resume', 'update', 'generateOneTimeLink', 'getFields', 'setFields', 'getDocuments', 'getSelfies', 'getVerifications', 'getSessions', 'getReports', 'transition', 'addTag', 'removeTag'],
      },
    },
  },
  // Reference ID field
  {
    displayName: 'Reference ID',
    name: 'referenceId',
    type: 'string',
    required: true,
    default: '',
    description: 'The external reference ID of the inquiry',
    displayOptions: {
      show: {
        resource: ['inquiry'],
        operation: ['getByReferenceId'],
      },
    },
  },
  // Template ID for create
  {
    displayName: 'Template ID',
    name: 'templateId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'itmpl_...',
    description: 'The ID of the inquiry template to use',
    displayOptions: {
      show: {
        resource: ['inquiry'],
        operation: ['create'],
      },
    },
  },
  // Create options
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['inquiry'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Reference ID',
        name: 'referenceId',
        type: 'string',
        default: '',
        description: 'Your external reference ID for this inquiry',
      },
      {
        displayName: 'Note',
        name: 'note',
        type: 'string',
        default: '',
        description: 'A note to attach to the inquiry',
      },
      {
        displayName: 'Account ID',
        name: 'accountId',
        type: 'string',
        default: '',
        placeholder: 'act_...',
        description: 'The ID of an account to associate with this inquiry',
      },
      {
        displayName: 'Redirect URI',
        name: 'redirectUri',
        type: 'string',
        default: '',
        description: 'The URI to redirect to after the inquiry is complete',
      },
      {
        displayName: 'Fields',
        name: 'fields',
        type: 'json',
        default: '{}',
        description: 'Pre-fill fields for the inquiry (JSON object)',
      },
    ],
  },
  // Tag name for add/remove tag
  {
    displayName: 'Tag Name',
    name: 'tagName',
    type: 'string',
    required: true,
    default: '',
    description: 'The name of the tag to add or remove',
    displayOptions: {
      show: {
        resource: ['inquiry'],
        operation: ['addTag', 'removeTag'],
      },
    },
  },
  // Transition target
  {
    displayName: 'Target State',
    name: 'targetState',
    type: 'string',
    required: true,
    default: '',
    description: 'The target state to transition the inquiry to',
    displayOptions: {
      show: {
        resource: ['inquiry'],
        operation: ['transition'],
      },
    },
  },
  // Update fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['inquiry'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Note',
        name: 'note',
        type: 'string',
        default: '',
        description: 'A note to attach to the inquiry',
      },
      {
        displayName: 'Reference ID',
        name: 'referenceId',
        type: 'string',
        default: '',
        description: 'Update the external reference ID',
      },
    ],
  },
  // Set fields
  {
    displayName: 'Fields',
    name: 'fields',
    type: 'json',
    required: true,
    default: '{}',
    description: 'Fields to set on the inquiry (JSON object)',
    displayOptions: {
      show: {
        resource: ['inquiry'],
        operation: ['setFields'],
      },
    },
  },
  // List filters
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
    displayOptions: {
      show: {
        resource: ['inquiry'],
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
    typeOptions: {
      minValue: 1,
      maxValue: 500,
    },
    displayOptions: {
      show: {
        resource: ['inquiry'],
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
        resource: ['inquiry'],
        operation: ['list'],
      },
    },
    options: [
      {
        displayName: 'Status',
        name: 'status',
        type: 'multiOptions',
        options: [
          { name: 'Created', value: 'created' },
          { name: 'Pending', value: 'pending' },
          { name: 'Completed', value: 'completed' },
          { name: 'Approved', value: 'approved' },
          { name: 'Declined', value: 'declined' },
          { name: 'Expired', value: 'expired' },
          { name: 'Failed', value: 'failed' },
          { name: 'Needs Review', value: 'needs_review' },
        ],
        default: [],
        description: 'Filter by inquiry status',
      },
      {
        displayName: 'Template ID',
        name: 'templateId',
        type: 'string',
        default: '',
        description: 'Filter by template ID',
      },
      {
        displayName: 'Account ID',
        name: 'accountId',
        type: 'string',
        default: '',
        description: 'Filter by account ID',
      },
      {
        displayName: 'Reference ID',
        name: 'referenceId',
        type: 'string',
        default: '',
        description: 'Filter by reference ID',
      },
      {
        displayName: 'Created After',
        name: 'createdAfter',
        type: 'dateTime',
        default: '',
        description: 'Filter inquiries created after this date',
      },
      {
        displayName: 'Created Before',
        name: 'createdBefore',
        type: 'dateTime',
        default: '',
        description: 'Filter inquiries created before this date',
      },
    ],
  },
];

export async function executeInquiryOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'create': {
      const templateId = this.getNodeParameter('templateId', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const body: IDataObject = {
        data: {
          attributes: {
            'inquiry-template-id': templateId,
            ...additionalFields.referenceId && { 'reference-id': additionalFields.referenceId },
            ...additionalFields.note && { note: additionalFields.note },
            ...additionalFields.redirectUri && { 'redirect-uri': additionalFields.redirectUri },
          },
        },
      };

      if (additionalFields.accountId) {
        (body.data as IDataObject).relationships = {
          account: {
            data: { type: 'account', id: additionalFields.accountId },
          },
        };
      }

      if (additionalFields.fields) {
        const fields = typeof additionalFields.fields === 'string'
          ? JSON.parse(additionalFields.fields)
          : additionalFields.fields;
        ((body.data as IDataObject).attributes as IDataObject).fields = fields;
      }

      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.INQUIRIES,
        body,
      });
      break;
    }

    case 'get': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.INQUIRY_BY_ID(inquiryId),
      });
      break;
    }

    case 'getByReferenceId': {
      const referenceId = this.getNodeParameter('referenceId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.INQUIRIES,
        qs: { 'filter[reference-id]': referenceId },
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
      if (filters.templateId) qs['filter[inquiry-template-id]'] = filters.templateId;
      if (filters.accountId) qs['filter[account-id]'] = filters.accountId;
      if (filters.referenceId) qs['filter[reference-id]'] = filters.referenceId;
      if (filters.createdAfter) qs['filter[created-at-after]'] = filters.createdAfter;
      if (filters.createdBefore) qs['filter[created-at-before]'] = filters.createdBefore;

      if (returnAll) {
        const items = await personaApiRequestAllItems.call(this, ENDPOINTS.INQUIRIES, qs);
        responseData = { data: items };
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        qs['page[size]'] = limit;
        responseData = await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: ENDPOINTS.INQUIRIES,
          qs,
        });
      }
      break;
    }

    case 'approve': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.INQUIRY_APPROVE(inquiryId),
      });
      break;
    }

    case 'decline': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.INQUIRY_DECLINE(inquiryId),
      });
      break;
    }

    case 'expire': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.INQUIRY_EXPIRE(inquiryId),
      });
      break;
    }

    case 'redact': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.INQUIRY_REDACT(inquiryId),
      });
      break;
    }

    case 'resume': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.INQUIRY_RESUME(inquiryId),
      });
      break;
    }

    case 'update': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      const body: IDataObject = {
        data: {
          attributes: {},
        },
      };

      if (updateFields.note) {
        ((body.data as IDataObject).attributes as IDataObject).note = updateFields.note;
      }
      if (updateFields.referenceId) {
        ((body.data as IDataObject).attributes as IDataObject)['reference-id'] = updateFields.referenceId;
      }

      responseData = await personaApiRequest.call(this, {
        method: 'PATCH',
        endpoint: ENDPOINTS.INQUIRY_BY_ID(inquiryId),
        body,
      });
      break;
    }

    case 'generateOneTimeLink': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.INQUIRY_ONE_TIME_LINK(inquiryId),
      });
      break;
    }

    case 'getFields': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.INQUIRY_FIELDS(inquiryId),
      });
      break;
    }

    case 'setFields': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      const fields = this.getNodeParameter('fields', i) as string;

      const body: IDataObject = {
        data: {
          attributes: {
            fields: typeof fields === 'string' ? JSON.parse(fields) : fields,
          },
        },
      };

      responseData = await personaApiRequest.call(this, {
        method: 'PATCH',
        endpoint: ENDPOINTS.INQUIRY_FIELDS(inquiryId),
        body,
      });
      break;
    }

    case 'getDocuments': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.INQUIRY_DOCUMENTS(inquiryId),
      });
      break;
    }

    case 'getSelfies': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.INQUIRY_SELFIES(inquiryId),
      });
      break;
    }

    case 'getVerifications': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.INQUIRY_VERIFICATIONS(inquiryId),
      });
      break;
    }

    case 'getSessions': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.INQUIRY_SESSIONS(inquiryId),
      });
      break;
    }

    case 'getReports': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.INQUIRY_REPORTS(inquiryId),
      });
      break;
    }

    case 'transition': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      const targetState = this.getNodeParameter('targetState', i) as string;

      const body: IDataObject = {
        meta: {
          'transition-type': targetState,
        },
      };

      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.INQUIRY_TRANSITION(inquiryId),
        body,
      });
      break;
    }

    case 'addTag': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      const tagName = this.getNodeParameter('tagName', i) as string;

      const body: IDataObject = {
        meta: {
          'tag-name': tagName,
        },
      };

      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.INQUIRY_ADD_TAG(inquiryId),
        body,
      });
      break;
    }

    case 'removeTag': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      const tagName = this.getNodeParameter('tagName', i) as string;

      const body: IDataObject = {
        meta: {
          'tag-name': tagName,
        },
      };

      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.INQUIRY_REMOVE_TAG(inquiryId),
        body,
      });
      break;
    }
  }

  return responseData;
}
