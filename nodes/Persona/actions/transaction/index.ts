/**
 * Persona Transaction Actions
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

export const transactionOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['transaction'] } },
    options: [
      { name: 'Approve', value: 'approve', description: 'Approve a transaction', action: 'Approve transaction' },
      { name: 'Create', value: 'create', description: 'Create a transaction', action: 'Create transaction' },
      { name: 'Decline', value: 'decline', description: 'Decline a transaction', action: 'Decline transaction' },
      { name: 'Get', value: 'get', description: 'Get a transaction', action: 'Get transaction' },
      { name: 'Get by Reference ID', value: 'getByReferenceId', description: 'Get by reference ID', action: 'Get by reference ID' },
      { name: 'Get Events', value: 'getEvents', description: 'Get transaction events', action: 'Get transaction events' },
      { name: 'Get Labels', value: 'getLabels', description: 'Get transaction labels', action: 'Get transaction labels' },
      { name: 'Get Related', value: 'getRelated', description: 'Get related transactions', action: 'Get related transactions' },
      { name: 'Get Risk Signals', value: 'getRiskSignals', description: 'Get risk signals', action: 'Get risk signals' },
      { name: 'Get Status', value: 'getStatus', description: 'Get transaction status', action: 'Get transaction status' },
      { name: 'List', value: 'list', description: 'List transactions', action: 'List transactions' },
      { name: 'Redact', value: 'redact', description: 'Redact a transaction', action: 'Redact transaction' },
      { name: 'Update', value: 'update', description: 'Update a transaction', action: 'Update transaction' },
    ],
    default: 'list',
  },
];

export const transactionFields: INodeProperties[] = [
  {
    displayName: 'Transaction ID',
    name: 'transactionId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'txn_...',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['get', 'update', 'redact', 'approve', 'decline', 'getStatus', 'getRiskSignals', 'getLabels', 'getRelated', 'getEvents'],
      },
    },
  },
  {
    displayName: 'Reference ID',
    name: 'referenceId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['transaction'], operation: ['getByReferenceId', 'create'] } },
  },
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: { show: { resource: ['transaction'], operation: ['create'] } },
  },
  {
    displayName: 'Currency',
    name: 'currency',
    type: 'string',
    required: true,
    default: 'USD',
    displayOptions: { show: { resource: ['transaction'], operation: ['create'] } },
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: { show: { resource: ['transaction'], operation: ['create'] } },
    options: [
      { displayName: 'Account ID', name: 'accountId', type: 'string', default: '', placeholder: 'act_...' },
      { displayName: 'Transaction Type', name: 'transactionType', type: 'string', default: '' },
      { displayName: 'Description', name: 'description', type: 'string', default: '' },
      { displayName: 'External ID', name: 'externalId', type: 'string', default: '' },
    ],
  },
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: { show: { resource: ['transaction'], operation: ['update'] } },
    options: [
      { displayName: 'Status', name: 'status', type: 'string', default: '' },
      { displayName: 'Labels', name: 'labels', type: 'string', default: '', description: 'Comma-separated labels' },
    ],
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: { show: { resource: ['transaction'], operation: ['list'] } },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    typeOptions: { minValue: 1, maxValue: 500 },
    displayOptions: { show: { resource: ['transaction'], operation: ['list'], returnAll: [false] } },
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: { show: { resource: ['transaction'], operation: ['list'] } },
    options: [
      { displayName: 'Account ID', name: 'accountId', type: 'string', default: '' },
      { displayName: 'Status', name: 'status', type: 'string', default: '' },
      { displayName: 'Created After', name: 'createdAfter', type: 'dateTime', default: '' },
      { displayName: 'Created Before', name: 'createdBefore', type: 'dateTime', default: '' },
    ],
  },
];

export async function executeTransactionOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'create': {
      const referenceId = this.getNodeParameter('referenceId', i) as string;
      const amount = this.getNodeParameter('amount', i) as number;
      const currency = this.getNodeParameter('currency', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const attributes: IDataObject = {
        'reference-id': referenceId,
        amount,
        currency,
      };
      if (additionalFields.transactionType) attributes['transaction-type'] = additionalFields.transactionType;
      if (additionalFields.description) attributes['description'] = additionalFields.description;
      if (additionalFields.externalId) attributes['external-id'] = additionalFields.externalId;

      const body: IDataObject = { data: { attributes } };
      if (additionalFields.accountId) {
        (body.data as IDataObject).relationships = {
          account: { data: { type: 'account', id: additionalFields.accountId } },
        };
      }

      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.TRANSACTIONS,
        body,
      });
      break;
    }

    case 'get': {
      const transactionId = this.getNodeParameter('transactionId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.TRANSACTION_BY_ID(transactionId),
      });
      break;
    }

    case 'getByReferenceId': {
      const referenceId = this.getNodeParameter('referenceId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.TRANSACTIONS,
        qs: { 'filter[reference-id]': referenceId },
      });
      break;
    }

    case 'list': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const qs: IDataObject = {};

      if (filters.accountId) qs['filter[account-id]'] = filters.accountId;
      if (filters.status) qs['filter[status]'] = filters.status;
      if (filters.createdAfter) qs['filter[created-at-after]'] = filters.createdAfter;
      if (filters.createdBefore) qs['filter[created-at-before]'] = filters.createdBefore;

      if (returnAll) {
        const items = await personaApiRequestAllItems.call(this, ENDPOINTS.TRANSACTIONS, qs);
        responseData = { data: items };
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        qs['page[size]'] = limit;
        responseData = await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: ENDPOINTS.TRANSACTIONS,
          qs,
        });
      }
      break;
    }

    case 'update': {
      const transactionId = this.getNodeParameter('transactionId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
      const attributes: IDataObject = {};
      if (updateFields.status) attributes['status'] = updateFields.status;
      if (updateFields.labels) attributes['labels'] = (updateFields.labels as string).split(',').map((l) => l.trim());

      responseData = await personaApiRequest.call(this, {
        method: 'PATCH',
        endpoint: ENDPOINTS.TRANSACTION_BY_ID(transactionId),
        body: { data: { attributes } },
      });
      break;
    }

    case 'redact': {
      const transactionId = this.getNodeParameter('transactionId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.TRANSACTION_REDACT(transactionId),
      });
      break;
    }

    case 'approve': {
      const transactionId = this.getNodeParameter('transactionId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: `${ENDPOINTS.TRANSACTION_BY_ID(transactionId)}/approve`,
      });
      break;
    }

    case 'decline': {
      const transactionId = this.getNodeParameter('transactionId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: `${ENDPOINTS.TRANSACTION_BY_ID(transactionId)}/decline`,
      });
      break;
    }

    case 'getStatus':
    case 'getRiskSignals':
    case 'getLabels':
    case 'getRelated':
    case 'getEvents': {
      const transactionId = this.getNodeParameter('transactionId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.TRANSACTION_BY_ID(transactionId),
      });
      break;
    }
  }

  return responseData;
}
