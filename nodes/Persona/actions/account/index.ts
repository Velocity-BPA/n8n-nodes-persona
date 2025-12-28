/**
 * Persona Account Actions
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

export const accountOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['account'],
      },
    },
    options: [
      { name: 'Add Tag', value: 'addTag', description: 'Add a tag to an account', action: 'Add tag to account' },
      { name: 'Consolidate', value: 'consolidate', description: 'Consolidate an account', action: 'Consolidate an account' },
      { name: 'Create', value: 'create', description: 'Create a new account', action: 'Create an account' },
      { name: 'Get', value: 'get', description: 'Get an account by ID', action: 'Get an account' },
      { name: 'Get by Reference ID', value: 'getByReferenceId', description: 'Get an account by reference ID', action: 'Get account by reference ID' },
      { name: 'Get History', value: 'getHistory', description: 'Get history for an account', action: 'Get account history' },
      { name: 'Get Inquiries', value: 'getInquiries', description: 'Get inquiries for an account', action: 'Get account inquiries' },
      { name: 'Get Lists', value: 'getLists', description: 'Get lists for an account', action: 'Get account lists' },
      { name: 'Get Transactions', value: 'getTransactions', description: 'Get transactions for an account', action: 'Get account transactions' },
      { name: 'List', value: 'list', description: 'List all accounts', action: 'List accounts' },
      { name: 'Merge', value: 'merge', description: 'Merge two accounts', action: 'Merge accounts' },
      { name: 'Redact', value: 'redact', description: 'Redact an account', action: 'Redact an account' },
      { name: 'Remove Tag', value: 'removeTag', description: 'Remove a tag from an account', action: 'Remove tag from account' },
      { name: 'Update', value: 'update', description: 'Update an account', action: 'Update an account' },
    ],
    default: 'list',
  },
];

export const accountFields: INodeProperties[] = [
  {
    displayName: 'Account ID',
    name: 'accountId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'act_...',
    description: 'The ID of the account',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['get', 'update', 'redact', 'addTag', 'removeTag', 'merge', 'getInquiries', 'getTransactions', 'getLists', 'consolidate', 'getHistory'],
      },
    },
  },
  {
    displayName: 'Reference ID',
    name: 'referenceId',
    type: 'string',
    required: true,
    default: '',
    description: 'The external reference ID of the account',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['getByReferenceId', 'create'],
      },
    },
  },
  {
    displayName: 'Target Account ID',
    name: 'targetAccountId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'act_...',
    description: 'The ID of the account to merge into this account',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['merge'],
      },
    },
  },
  {
    displayName: 'Tag Name',
    name: 'tagName',
    type: 'string',
    required: true,
    default: '',
    description: 'The name of the tag to add or remove',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['addTag', 'removeTag'],
      },
    },
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Name First',
        name: 'nameFirst',
        type: 'string',
        default: '',
        description: 'First name',
      },
      {
        displayName: 'Name Last',
        name: 'nameLast',
        type: 'string',
        default: '',
        description: 'Last name',
      },
      {
        displayName: 'Name Middle',
        name: 'nameMiddle',
        type: 'string',
        default: '',
        description: 'Middle name',
      },
      {
        displayName: 'Email Address',
        name: 'emailAddress',
        type: 'string',
        default: '',
        description: 'Email address',
      },
      {
        displayName: 'Phone Number',
        name: 'phoneNumber',
        type: 'string',
        default: '',
        description: 'Phone number in E.164 format',
      },
      {
        displayName: 'Birthdate',
        name: 'birthdate',
        type: 'string',
        default: '',
        description: 'Date of birth (YYYY-MM-DD)',
      },
      {
        displayName: 'Address Street 1',
        name: 'addressStreet1',
        type: 'string',
        default: '',
        description: 'Street address line 1',
      },
      {
        displayName: 'Address Street 2',
        name: 'addressStreet2',
        type: 'string',
        default: '',
        description: 'Street address line 2',
      },
      {
        displayName: 'Address City',
        name: 'addressCity',
        type: 'string',
        default: '',
        description: 'City',
      },
      {
        displayName: 'Address Subdivision',
        name: 'addressSubdivision',
        type: 'string',
        default: '',
        description: 'State/Province',
      },
      {
        displayName: 'Address Postal Code',
        name: 'addressPostalCode',
        type: 'string',
        default: '',
        description: 'Postal/ZIP code',
      },
      {
        displayName: 'Country Code',
        name: 'countryCode',
        type: 'string',
        default: '',
        description: 'Country code (ISO 3166-1 alpha-2)',
      },
    ],
  },
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Reference ID',
        name: 'referenceId',
        type: 'string',
        default: '',
        description: 'Update the external reference ID',
      },
      {
        displayName: 'Name First',
        name: 'nameFirst',
        type: 'string',
        default: '',
        description: 'First name',
      },
      {
        displayName: 'Name Last',
        name: 'nameLast',
        type: 'string',
        default: '',
        description: 'Last name',
      },
      {
        displayName: 'Email Address',
        name: 'emailAddress',
        type: 'string',
        default: '',
        description: 'Email address',
      },
      {
        displayName: 'Phone Number',
        name: 'phoneNumber',
        type: 'string',
        default: '',
        description: 'Phone number',
      },
    ],
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
    displayOptions: {
      show: {
        resource: ['account'],
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
        resource: ['account'],
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
        resource: ['account'],
        operation: ['list'],
      },
    },
    options: [
      {
        displayName: 'Reference ID',
        name: 'referenceId',
        type: 'string',
        default: '',
        description: 'Filter by reference ID',
      },
      {
        displayName: 'Email Address',
        name: 'emailAddress',
        type: 'string',
        default: '',
        description: 'Filter by email address',
      },
      {
        displayName: 'Phone Number',
        name: 'phoneNumber',
        type: 'string',
        default: '',
        description: 'Filter by phone number',
      },
      {
        displayName: 'Created After',
        name: 'createdAfter',
        type: 'dateTime',
        default: '',
        description: 'Filter accounts created after this date',
      },
      {
        displayName: 'Created Before',
        name: 'createdBefore',
        type: 'dateTime',
        default: '',
        description: 'Filter accounts created before this date',
      },
    ],
  },
];

export async function executeAccountOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'create': {
      const referenceId = this.getNodeParameter('referenceId', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const attributes: IDataObject = {
        'reference-id': referenceId,
      };

      const fieldMapping: Record<string, string> = {
        nameFirst: 'name-first',
        nameLast: 'name-last',
        nameMiddle: 'name-middle',
        emailAddress: 'email-address',
        phoneNumber: 'phone-number',
        birthdate: 'birthdate',
        addressStreet1: 'address-street-1',
        addressStreet2: 'address-street-2',
        addressCity: 'address-city',
        addressSubdivision: 'address-subdivision',
        addressPostalCode: 'address-postal-code',
        countryCode: 'country-code',
      };

      for (const [key, apiKey] of Object.entries(fieldMapping)) {
        if (additionalFields[key]) {
          attributes[apiKey] = additionalFields[key];
        }
      }

      const body: IDataObject = {
        data: {
          attributes,
        },
      };

      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.ACCOUNTS,
        body,
      });
      break;
    }

    case 'get': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.ACCOUNT_BY_ID(accountId),
      });
      break;
    }

    case 'getByReferenceId': {
      const referenceId = this.getNodeParameter('referenceId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.ACCOUNTS,
        qs: { 'filter[reference-id]': referenceId },
      });
      break;
    }

    case 'list': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const qs: IDataObject = {};

      if (filters.referenceId) qs['filter[reference-id]'] = filters.referenceId;
      if (filters.emailAddress) qs['filter[email-address]'] = filters.emailAddress;
      if (filters.phoneNumber) qs['filter[phone-number]'] = filters.phoneNumber;
      if (filters.createdAfter) qs['filter[created-at-after]'] = filters.createdAfter;
      if (filters.createdBefore) qs['filter[created-at-before]'] = filters.createdBefore;

      if (returnAll) {
        const items = await personaApiRequestAllItems.call(this, ENDPOINTS.ACCOUNTS, qs);
        responseData = { data: items };
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        qs['page[size]'] = limit;
        responseData = await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: ENDPOINTS.ACCOUNTS,
          qs,
        });
      }
      break;
    }

    case 'update': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      const attributes: IDataObject = {};
      const fieldMapping: Record<string, string> = {
        referenceId: 'reference-id',
        nameFirst: 'name-first',
        nameLast: 'name-last',
        emailAddress: 'email-address',
        phoneNumber: 'phone-number',
      };

      for (const [key, apiKey] of Object.entries(fieldMapping)) {
        if (updateFields[key]) {
          attributes[apiKey] = updateFields[key];
        }
      }

      const body: IDataObject = {
        data: { attributes },
      };

      responseData = await personaApiRequest.call(this, {
        method: 'PATCH',
        endpoint: ENDPOINTS.ACCOUNT_BY_ID(accountId),
        body,
      });
      break;
    }

    case 'redact': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.ACCOUNT_REDACT(accountId),
      });
      break;
    }

    case 'addTag': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      const tagName = this.getNodeParameter('tagName', i) as string;

      const body: IDataObject = {
        meta: { 'tag-name': tagName },
      };

      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.ACCOUNT_ADD_TAG(accountId),
        body,
      });
      break;
    }

    case 'removeTag': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      const tagName = this.getNodeParameter('tagName', i) as string;

      const body: IDataObject = {
        meta: { 'tag-name': tagName },
      };

      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.ACCOUNT_REMOVE_TAG(accountId),
        body,
      });
      break;
    }

    case 'merge': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      const targetAccountId = this.getNodeParameter('targetAccountId', i) as string;

      const body: IDataObject = {
        meta: {
          'source-account-id': targetAccountId,
        },
      };

      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.ACCOUNT_MERGE(accountId),
        body,
      });
      break;
    }

    case 'getInquiries': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.ACCOUNT_INQUIRIES(accountId),
      });
      break;
    }

    case 'getTransactions': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.ACCOUNT_TRANSACTIONS(accountId),
      });
      break;
    }

    case 'getLists': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `${ENDPOINTS.ACCOUNT_BY_ID(accountId)}/lists`,
      });
      break;
    }

    case 'consolidate': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.ACCOUNT_CONSOLIDATE(accountId),
      });
      break;
    }

    case 'getHistory': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `${ENDPOINTS.ACCOUNT_BY_ID(accountId)}/history`,
      });
      break;
    }
  }

  return responseData;
}
