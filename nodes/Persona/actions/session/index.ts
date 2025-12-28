/**
 * Persona Session Actions
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

export const sessionOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['session'] } },
    options: [
      { name: 'Get', value: 'get', action: 'Get session' },
      { name: 'Get Browser', value: 'getBrowser', action: 'Get session browser' },
      { name: 'Get by Inquiry', value: 'getByInquiry', action: 'Get sessions by inquiry' },
      { name: 'Get Completion Rate', value: 'getCompletionRate', action: 'Get completion rate' },
      { name: 'Get Device Info', value: 'getDeviceInfo', action: 'Get device info' },
      { name: 'Get Drop-Off Point', value: 'getDropOffPoint', action: 'Get drop-off point' },
      { name: 'Get Duration', value: 'getDuration', action: 'Get session duration' },
      { name: 'Get Events', value: 'getEvents', action: 'Get session events' },
      { name: 'Get Location', value: 'getLocation', action: 'Get session location' },
      { name: 'List', value: 'list', action: 'List sessions' },
    ],
    default: 'list',
  },
];

export const sessionFields: INodeProperties[] = [
  {
    displayName: 'Session ID',
    name: 'sessionId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'ses_...',
    displayOptions: {
      show: {
        resource: ['session'],
        operation: ['get', 'getEvents', 'getDuration', 'getDeviceInfo', 'getLocation', 'getBrowser', 'getDropOffPoint', 'getCompletionRate'],
      },
    },
  },
  {
    displayName: 'Inquiry ID',
    name: 'inquiryId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['session'], operation: ['getByInquiry'] } },
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: { show: { resource: ['session'], operation: ['list'] } },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    typeOptions: { minValue: 1, maxValue: 500 },
    displayOptions: { show: { resource: ['session'], operation: ['list'], returnAll: [false] } },
  },
];

export async function executeSessionOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'get': {
      const sessionId = this.getNodeParameter('sessionId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.SESSION_BY_ID(sessionId),
      });
      break;
    }

    case 'list': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      if (returnAll) {
        const items = await personaApiRequestAllItems.call(this, ENDPOINTS.SESSIONS, {});
        responseData = { data: items };
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: ENDPOINTS.SESSIONS,
          qs: { 'page[size]': limit },
        });
      }
      break;
    }

    case 'getByInquiry': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.INQUIRY_SESSIONS(inquiryId),
      });
      break;
    }

    case 'getEvents':
    case 'getDuration':
    case 'getDeviceInfo':
    case 'getLocation':
    case 'getBrowser':
    case 'getDropOffPoint':
    case 'getCompletionRate': {
      const sessionId = this.getNodeParameter('sessionId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.SESSION_BY_ID(sessionId),
      });
      break;
    }
  }

  return responseData;
}
