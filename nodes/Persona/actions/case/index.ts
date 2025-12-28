/**
 * Persona Case Actions
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

export const caseOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['case'] } },
    options: [
      { name: 'Add Comment', value: 'addComment', description: 'Add a comment', action: 'Add comment' },
      { name: 'Add Inquiry', value: 'addInquiry', description: 'Add inquiry to case', action: 'Add inquiry to case' },
      { name: 'Assign', value: 'assign', description: 'Assign a case', action: 'Assign case' },
      { name: 'Close', value: 'close', description: 'Close a case', action: 'Close case' },
      { name: 'Create', value: 'create', description: 'Create a case', action: 'Create case' },
      { name: 'Get', value: 'get', description: 'Get a case', action: 'Get case' },
      { name: 'Get Comments', value: 'getComments', description: 'Get case comments', action: 'Get comments' },
      { name: 'Get Documents', value: 'getDocuments', description: 'Get case documents', action: 'Get documents' },
      { name: 'Get History', value: 'getHistory', description: 'Get case history', action: 'Get history' },
      { name: 'Get Inquiries', value: 'getInquiries', description: 'Get case inquiries', action: 'Get inquiries' },
      { name: 'Get Status', value: 'getStatus', description: 'Get case status', action: 'Get status' },
      { name: 'Get Tags', value: 'getTags', description: 'Get case tags', action: 'Get tags' },
      { name: 'List', value: 'list', description: 'List cases', action: 'List cases' },
      { name: 'Remove Inquiry', value: 'removeInquiry', description: 'Remove inquiry from case', action: 'Remove inquiry' },
      { name: 'Reopen', value: 'reopen', description: 'Reopen a case', action: 'Reopen case' },
      { name: 'Update', value: 'update', description: 'Update a case', action: 'Update case' },
    ],
    default: 'list',
  },
];

export const caseFields: INodeProperties[] = [
  {
    displayName: 'Case ID',
    name: 'caseId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'cas_...',
    displayOptions: {
      show: {
        resource: ['case'],
        operation: ['get', 'update', 'assign', 'close', 'reopen', 'addComment', 'getComments', 'getHistory', 'getInquiries', 'getDocuments', 'addInquiry', 'removeInquiry', 'getStatus', 'getTags'],
      },
    },
  },
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['case'], operation: ['create'] } },
  },
  {
    displayName: 'Assignee Email',
    name: 'assigneeEmail',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['case'], operation: ['assign'] } },
  },
  {
    displayName: 'Comment',
    name: 'comment',
    type: 'string',
    required: true,
    default: '',
    typeOptions: { rows: 4 },
    displayOptions: { show: { resource: ['case'], operation: ['addComment'] } },
  },
  {
    displayName: 'Inquiry ID',
    name: 'inquiryId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'inq_...',
    displayOptions: { show: { resource: ['case'], operation: ['addInquiry', 'removeInquiry'] } },
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: { show: { resource: ['case'], operation: ['create'] } },
    options: [
      { displayName: 'Description', name: 'description', type: 'string', default: '' },
      { displayName: 'Priority', name: 'priority', type: 'options', options: [{ name: 'Low', value: 'low' }, { name: 'Medium', value: 'medium' }, { name: 'High', value: 'high' }], default: 'medium' },
      { displayName: 'Tags', name: 'tags', type: 'string', default: '', description: 'Comma-separated tags' },
    ],
  },
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: { show: { resource: ['case'], operation: ['update'] } },
    options: [
      { displayName: 'Name', name: 'name', type: 'string', default: '' },
      { displayName: 'Description', name: 'description', type: 'string', default: '' },
      { displayName: 'Status', name: 'status', type: 'string', default: '' },
    ],
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: { show: { resource: ['case'], operation: ['list'] } },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    typeOptions: { minValue: 1, maxValue: 500 },
    displayOptions: { show: { resource: ['case'], operation: ['list'], returnAll: [false] } },
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: { show: { resource: ['case'], operation: ['list'] } },
    options: [
      { displayName: 'Status', name: 'status', type: 'options', options: [{ name: 'Open', value: 'open' }, { name: 'In Progress', value: 'in_progress' }, { name: 'Closed', value: 'closed' }], default: '' },
    ],
  },
];

export async function executeCaseOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'create': {
      const name = this.getNodeParameter('name', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
      const attributes: IDataObject = { name };
      if (additionalFields.description) attributes['description'] = additionalFields.description;
      if (additionalFields.priority) attributes['priority'] = additionalFields.priority;
      if (additionalFields.tags) attributes['tags'] = (additionalFields.tags as string).split(',').map((t) => t.trim());

      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.CASES,
        body: { data: { attributes } },
      });
      break;
    }

    case 'get': {
      const caseId = this.getNodeParameter('caseId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.CASE_BY_ID(caseId),
      });
      break;
    }

    case 'list': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const qs: IDataObject = {};
      if (filters.status) qs['filter[status]'] = filters.status;

      if (returnAll) {
        const items = await personaApiRequestAllItems.call(this, ENDPOINTS.CASES, qs);
        responseData = { data: items };
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        qs['page[size]'] = limit;
        responseData = await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: ENDPOINTS.CASES,
          qs,
        });
      }
      break;
    }

    case 'update': {
      const caseId = this.getNodeParameter('caseId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
      const attributes: IDataObject = {};
      if (updateFields.name) attributes['name'] = updateFields.name;
      if (updateFields.description) attributes['description'] = updateFields.description;
      if (updateFields.status) attributes['status'] = updateFields.status;

      responseData = await personaApiRequest.call(this, {
        method: 'PATCH',
        endpoint: ENDPOINTS.CASE_BY_ID(caseId),
        body: { data: { attributes } },
      });
      break;
    }

    case 'assign': {
      const caseId = this.getNodeParameter('caseId', i) as string;
      const assigneeEmail = this.getNodeParameter('assigneeEmail', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.CASE_ASSIGN(caseId),
        body: { meta: { 'assignee-email': assigneeEmail } },
      });
      break;
    }

    case 'close': {
      const caseId = this.getNodeParameter('caseId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.CASE_CLOSE(caseId),
      });
      break;
    }

    case 'reopen': {
      const caseId = this.getNodeParameter('caseId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.CASE_REOPEN(caseId),
      });
      break;
    }

    case 'addComment': {
      const caseId = this.getNodeParameter('caseId', i) as string;
      const comment = this.getNodeParameter('comment', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.CASE_COMMENTS(caseId),
        body: { data: { attributes: { body: comment } } },
      });
      break;
    }

    case 'getComments': {
      const caseId = this.getNodeParameter('caseId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.CASE_COMMENTS(caseId),
      });
      break;
    }

    case 'getHistory': {
      const caseId = this.getNodeParameter('caseId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `${ENDPOINTS.CASE_BY_ID(caseId)}/history`,
      });
      break;
    }

    case 'getInquiries': {
      const caseId = this.getNodeParameter('caseId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `${ENDPOINTS.CASE_BY_ID(caseId)}/inquiries`,
      });
      break;
    }

    case 'getDocuments': {
      const caseId = this.getNodeParameter('caseId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `${ENDPOINTS.CASE_BY_ID(caseId)}/documents`,
      });
      break;
    }

    case 'addInquiry': {
      const caseId = this.getNodeParameter('caseId', i) as string;
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: `${ENDPOINTS.CASE_BY_ID(caseId)}/inquiries`,
        body: { data: { id: inquiryId, type: 'inquiry' } },
      });
      break;
    }

    case 'removeInquiry': {
      const caseId = this.getNodeParameter('caseId', i) as string;
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'DELETE',
        endpoint: `${ENDPOINTS.CASE_BY_ID(caseId)}/inquiries/${inquiryId}`,
      });
      break;
    }

    case 'getStatus':
    case 'getTags': {
      const caseId = this.getNodeParameter('caseId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.CASE_BY_ID(caseId),
      });
      break;
    }
  }

  return responseData;
}
