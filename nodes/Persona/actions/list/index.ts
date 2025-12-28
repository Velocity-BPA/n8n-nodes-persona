/**
 * Persona List Actions
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

export const listOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['list'] } },
    options: [
      { name: 'Add Item', value: 'addItem', action: 'Add item to list' },
      { name: 'Clear', value: 'clear', action: 'Clear list' },
      { name: 'Create', value: 'create', action: 'Create list' },
      { name: 'Delete', value: 'delete', action: 'Delete list' },
      { name: 'Get', value: 'get', action: 'Get list' },
      { name: 'Get Items', value: 'getItems', action: 'Get list items' },
      { name: 'Get Matches', value: 'getMatches', action: 'Get list matches' },
      { name: 'List', value: 'list', action: 'List all lists' },
      { name: 'Remove Item', value: 'removeItem', action: 'Remove item from list' },
      { name: 'Search', value: 'search', action: 'Search in list' },
      { name: 'Update', value: 'update', action: 'Update list' },
    ],
    default: 'list',
  },
];

export const listFields: INodeProperties[] = [
  {
    displayName: 'List ID',
    name: 'listId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'lst_...',
    displayOptions: {
      show: {
        resource: ['list'],
        operation: ['get', 'update', 'delete', 'addItem', 'removeItem', 'getItems', 'search', 'getMatches', 'clear'],
      },
    },
  },
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['list'], operation: ['create'] } },
  },
  {
    displayName: 'List Type',
    name: 'listType',
    type: 'options',
    options: [
      { name: 'Allow List', value: 'allow' },
      { name: 'Block List', value: 'block' },
      { name: 'Watch List', value: 'watch' },
    ],
    default: 'allow',
    displayOptions: { show: { resource: ['list'], operation: ['create'] } },
  },
  {
    displayName: 'Item ID',
    name: 'itemId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['list'], operation: ['removeItem'] } },
  },
  {
    displayName: 'Item Value',
    name: 'itemValue',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['list'], operation: ['addItem'] } },
  },
  {
    displayName: 'Search Query',
    name: 'searchQuery',
    type: 'string',
    default: '',
    displayOptions: { show: { resource: ['list'], operation: ['search'] } },
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: { show: { resource: ['list'], operation: ['list', 'getItems'] } },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    typeOptions: { minValue: 1, maxValue: 500 },
    displayOptions: { show: { resource: ['list'], operation: ['list', 'getItems'], returnAll: [false] } },
  },
];

export async function executeListOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'create': {
      const name = this.getNodeParameter('name', i) as string;
      const listType = this.getNodeParameter('listType', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.LISTS,
        body: { data: { attributes: { name, 'list-type': listType } } },
      });
      break;
    }

    case 'get': {
      const listId = this.getNodeParameter('listId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.LIST_BY_ID(listId),
      });
      break;
    }

    case 'list': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      if (returnAll) {
        const items = await personaApiRequestAllItems.call(this, ENDPOINTS.LISTS, {});
        responseData = { data: items };
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: ENDPOINTS.LISTS,
          qs: { 'page[size]': limit },
        });
      }
      break;
    }

    case 'update': {
      const listId = this.getNodeParameter('listId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'PATCH',
        endpoint: ENDPOINTS.LIST_BY_ID(listId),
        body: { data: { attributes: {} } },
      });
      break;
    }

    case 'delete': {
      const listId = this.getNodeParameter('listId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'DELETE',
        endpoint: ENDPOINTS.LIST_BY_ID(listId),
      });
      break;
    }

    case 'addItem': {
      const listId = this.getNodeParameter('listId', i) as string;
      const itemValue = this.getNodeParameter('itemValue', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.LIST_ITEMS(listId),
        body: { data: { attributes: { value: itemValue } } },
      });
      break;
    }

    case 'removeItem': {
      const listId = this.getNodeParameter('listId', i) as string;
      const itemId = this.getNodeParameter('itemId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'DELETE',
        endpoint: ENDPOINTS.LIST_ITEM_BY_ID(listId, itemId),
      });
      break;
    }

    case 'getItems': {
      const listId = this.getNodeParameter('listId', i) as string;
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      if (returnAll) {
        const items = await personaApiRequestAllItems.call(this, ENDPOINTS.LIST_ITEMS(listId), {});
        responseData = { data: items };
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: ENDPOINTS.LIST_ITEMS(listId),
          qs: { 'page[size]': limit },
        });
      }
      break;
    }

    case 'search': {
      const listId = this.getNodeParameter('listId', i) as string;
      const searchQuery = this.getNodeParameter('searchQuery', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.LIST_ITEMS(listId),
        qs: { 'filter[search]': searchQuery },
      });
      break;
    }

    case 'getMatches': {
      const listId = this.getNodeParameter('listId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `${ENDPOINTS.LIST_BY_ID(listId)}/matches`,
      });
      break;
    }

    case 'clear': {
      const listId = this.getNodeParameter('listId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: `${ENDPOINTS.LIST_BY_ID(listId)}/clear`,
      });
      break;
    }
  }

  return responseData;
}
