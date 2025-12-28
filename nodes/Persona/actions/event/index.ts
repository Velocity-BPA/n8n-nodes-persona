/**
 * Persona Event Actions
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

export const eventOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['event'] } },
    options: [
      { name: 'Get', value: 'get', action: 'Get event' },
      { name: 'Get by Account', value: 'getByAccount', action: 'Get events by account' },
      { name: 'Get by Inquiry', value: 'getByInquiry', action: 'Get events by inquiry' },
      { name: 'Get Payload', value: 'getPayload', action: 'Get event payload' },
      { name: 'Get Types', value: 'getTypes', action: 'Get event types' },
      { name: 'List', value: 'list', action: 'List events' },
      { name: 'Search', value: 'search', action: 'Search events' },
    ],
    default: 'list',
  },
];

export const eventFields: INodeProperties[] = [
  {
    displayName: 'Event ID',
    name: 'eventId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'evt_...',
    displayOptions: { show: { resource: ['event'], operation: ['get', 'getPayload'] } },
  },
  {
    displayName: 'Inquiry ID',
    name: 'inquiryId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['event'], operation: ['getByInquiry'] } },
  },
  {
    displayName: 'Account ID',
    name: 'accountId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['event'], operation: ['getByAccount'] } },
  },
  {
    displayName: 'Search Query',
    name: 'searchQuery',
    type: 'string',
    default: '',
    displayOptions: { show: { resource: ['event'], operation: ['search'] } },
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: { show: { resource: ['event'], operation: ['list'] } },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    typeOptions: { minValue: 1, maxValue: 500 },
    displayOptions: { show: { resource: ['event'], operation: ['list'], returnAll: [false] } },
  },
];

export async function executeEventOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'get': {
      const eventId = this.getNodeParameter('eventId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.EVENT_BY_ID(eventId),
      });
      break;
    }

    case 'list': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      if (returnAll) {
        const items = await personaApiRequestAllItems.call(this, ENDPOINTS.EVENTS, {});
        responseData = { data: items };
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: ENDPOINTS.EVENTS,
          qs: { 'page[size]': limit },
        });
      }
      break;
    }

    case 'getByInquiry': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.EVENTS,
        qs: { 'filter[inquiry-id]': inquiryId },
      });
      break;
    }

    case 'getByAccount': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.EVENTS,
        qs: { 'filter[account-id]': accountId },
      });
      break;
    }

    case 'getPayload': {
      const eventId = this.getNodeParameter('eventId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.EVENT_BY_ID(eventId),
      });
      break;
    }

    case 'getTypes': {
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: '/event-types',
      });
      break;
    }

    case 'search': {
      const searchQuery = this.getNodeParameter('searchQuery', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.EVENTS,
        qs: { 'filter[search]': searchQuery },
      });
      break;
    }
  }

  return responseData;
}
