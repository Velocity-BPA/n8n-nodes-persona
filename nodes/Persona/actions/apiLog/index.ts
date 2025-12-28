/**
 * Persona API Log Actions
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

export const apiLogOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['apiLog'] } },
    options: [
      { name: 'Get', value: 'get', action: 'Get API log' },
      { name: 'Get by Date', value: 'getByDate', action: 'Get logs by date' },
      { name: 'Get by Endpoint', value: 'getByEndpoint', action: 'Get logs by endpoint' },
      { name: 'Get by Status', value: 'getByStatus', action: 'Get logs by status' },
      { name: 'Get Error Logs', value: 'getErrorLogs', action: 'Get error logs' },
      { name: 'List', value: 'list', action: 'List API logs' },
      { name: 'Search', value: 'search', action: 'Search logs' },
    ],
    default: 'list',
  },
];

export const apiLogFields: INodeProperties[] = [
  {
    displayName: 'Log ID',
    name: 'logId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['apiLog'], operation: ['get'] } },
  },
  {
    displayName: 'Date',
    name: 'date',
    type: 'dateTime',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['apiLog'], operation: ['getByDate'] } },
  },
  {
    displayName: 'Endpoint',
    name: 'endpoint',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['apiLog'], operation: ['getByEndpoint'] } },
  },
  {
    displayName: 'Status Code',
    name: 'statusCode',
    type: 'number',
    required: true,
    default: 200,
    displayOptions: { show: { resource: ['apiLog'], operation: ['getByStatus'] } },
  },
  {
    displayName: 'Search Query',
    name: 'searchQuery',
    type: 'string',
    default: '',
    displayOptions: { show: { resource: ['apiLog'], operation: ['search'] } },
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: { show: { resource: ['apiLog'], operation: ['list', 'getErrorLogs'] } },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    typeOptions: { minValue: 1, maxValue: 500 },
    displayOptions: { show: { resource: ['apiLog'], operation: ['list', 'getErrorLogs'], returnAll: [false] } },
  },
];

export async function executeApiLogOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'get': {
      const logId = this.getNodeParameter('logId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.API_LOG_BY_ID(logId),
      });
      break;
    }

    case 'list': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      if (returnAll) {
        const items = await personaApiRequestAllItems.call(this, ENDPOINTS.API_LOGS, {});
        responseData = { data: items };
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: ENDPOINTS.API_LOGS,
          qs: { 'page[size]': limit },
        });
      }
      break;
    }

    case 'getByDate': {
      const date = this.getNodeParameter('date', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.API_LOGS,
        qs: { 'filter[created-at]': date },
      });
      break;
    }

    case 'getByEndpoint': {
      const endpoint = this.getNodeParameter('endpoint', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.API_LOGS,
        qs: { 'filter[endpoint]': endpoint },
      });
      break;
    }

    case 'getByStatus': {
      const statusCode = this.getNodeParameter('statusCode', i) as number;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.API_LOGS,
        qs: { 'filter[status-code]': statusCode },
      });
      break;
    }

    case 'getErrorLogs': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const qs: IDataObject = { 'filter[status-code-gte]': 400 };
      if (returnAll) {
        const items = await personaApiRequestAllItems.call(this, ENDPOINTS.API_LOGS, qs);
        responseData = { data: items };
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        qs['page[size]'] = limit;
        responseData = await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: ENDPOINTS.API_LOGS,
          qs,
        });
      }
      break;
    }

    case 'search': {
      const searchQuery = this.getNodeParameter('searchQuery', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.API_LOGS,
        qs: { 'filter[search]': searchQuery },
      });
      break;
    }
  }

  return responseData;
}
