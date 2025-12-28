/**
 * Persona Webhook Actions
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

export const webhookResourceOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['webhookResource'] } },
    options: [
      { name: 'Create', value: 'create', action: 'Create webhook' },
      { name: 'Delete', value: 'delete', action: 'Delete webhook' },
      { name: 'Disable', value: 'disable', action: 'Disable webhook' },
      { name: 'Enable', value: 'enable', action: 'Enable webhook' },
      { name: 'Get', value: 'get', action: 'Get webhook' },
      { name: 'Get Deliveries', value: 'getDeliveries', action: 'Get webhook deliveries' },
      { name: 'Get Events', value: 'getEvents', action: 'Get webhook events' },
      { name: 'List', value: 'list', action: 'List webhooks' },
      { name: 'Retry Delivery', value: 'retryDelivery', action: 'Retry delivery' },
      { name: 'Test', value: 'test', action: 'Test webhook' },
      { name: 'Update', value: 'update', action: 'Update webhook' },
    ],
    default: 'list',
  },
];

export const webhookResourceFields: INodeProperties[] = [
  {
    displayName: 'Webhook ID',
    name: 'webhookId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'wbh_...',
    displayOptions: {
      show: {
        resource: ['webhookResource'],
        operation: ['get', 'update', 'delete', 'test', 'getEvents', 'getDeliveries', 'retryDelivery', 'enable', 'disable'],
      },
    },
  },
  {
    displayName: 'URL',
    name: 'url',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['webhookResource'], operation: ['create'] } },
  },
  {
    displayName: 'Enabled Events',
    name: 'enabledEvents',
    type: 'multiOptions',
    options: [
      { name: 'All Events', value: '*' },
      { name: 'Inquiry Created', value: 'inquiry.created' },
      { name: 'Inquiry Completed', value: 'inquiry.completed' },
      { name: 'Inquiry Approved', value: 'inquiry.approved' },
      { name: 'Inquiry Declined', value: 'inquiry.declined' },
      { name: 'Verification Passed', value: 'verification.passed' },
      { name: 'Verification Failed', value: 'verification.failed' },
    ],
    default: ['*'],
    displayOptions: { show: { resource: ['webhookResource'], operation: ['create', 'update'] } },
  },
  {
    displayName: 'Delivery ID',
    name: 'deliveryId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['webhookResource'], operation: ['retryDelivery'] } },
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: { show: { resource: ['webhookResource'], operation: ['list'] } },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    typeOptions: { minValue: 1, maxValue: 500 },
    displayOptions: { show: { resource: ['webhookResource'], operation: ['list'], returnAll: [false] } },
  },
];

export async function executeWebhookResourceOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'create': {
      const url = this.getNodeParameter('url', i) as string;
      const enabledEvents = this.getNodeParameter('enabledEvents', i) as string[];
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.WEBHOOKS,
        body: {
          data: {
            attributes: {
              url,
              'enabled-events': enabledEvents,
            },
          },
        },
      });
      break;
    }

    case 'get': {
      const webhookId = this.getNodeParameter('webhookId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.WEBHOOK_BY_ID(webhookId),
      });
      break;
    }

    case 'list': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      if (returnAll) {
        const items = await personaApiRequestAllItems.call(this, ENDPOINTS.WEBHOOKS, {});
        responseData = { data: items };
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: ENDPOINTS.WEBHOOKS,
          qs: { 'page[size]': limit },
        });
      }
      break;
    }

    case 'update': {
      const webhookId = this.getNodeParameter('webhookId', i) as string;
      const enabledEvents = this.getNodeParameter('enabledEvents', i) as string[];
      responseData = await personaApiRequest.call(this, {
        method: 'PATCH',
        endpoint: ENDPOINTS.WEBHOOK_BY_ID(webhookId),
        body: {
          data: {
            attributes: { 'enabled-events': enabledEvents },
          },
        },
      });
      break;
    }

    case 'delete': {
      const webhookId = this.getNodeParameter('webhookId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'DELETE',
        endpoint: ENDPOINTS.WEBHOOK_BY_ID(webhookId),
      });
      break;
    }

    case 'test': {
      const webhookId = this.getNodeParameter('webhookId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.WEBHOOK_TEST(webhookId),
      });
      break;
    }

    case 'getEvents': {
      const webhookId = this.getNodeParameter('webhookId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.WEBHOOK_EVENTS(webhookId),
      });
      break;
    }

    case 'getDeliveries': {
      const webhookId = this.getNodeParameter('webhookId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.WEBHOOK_DELIVERIES(webhookId),
      });
      break;
    }

    case 'retryDelivery': {
      const webhookId = this.getNodeParameter('webhookId', i) as string;
      const deliveryId = this.getNodeParameter('deliveryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: `${ENDPOINTS.WEBHOOK_DELIVERIES(webhookId)}/${deliveryId}/retry`,
      });
      break;
    }

    case 'enable': {
      const webhookId = this.getNodeParameter('webhookId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: `${ENDPOINTS.WEBHOOK_BY_ID(webhookId)}/enable`,
      });
      break;
    }

    case 'disable': {
      const webhookId = this.getNodeParameter('webhookId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: `${ENDPOINTS.WEBHOOK_BY_ID(webhookId)}/disable`,
      });
      break;
    }
  }

  return responseData;
}
