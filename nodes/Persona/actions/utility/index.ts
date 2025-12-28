/**
 * Persona Utility Actions
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
import { personaApiRequest } from '../../transport/personaApi';
import { generateIdempotencyKey } from '../../utils/validationUtils';

export const utilityOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['utility'] } },
    options: [
      { name: 'Check Service Status', value: 'checkServiceStatus', action: 'Check service status' },
      { name: 'Generate Reference ID', value: 'generateReferenceId', action: 'Generate reference ID' },
      { name: 'Get API Version', value: 'getApiVersion', action: 'Get API version' },
      { name: 'Get Document Requirements', value: 'getDocumentRequirements', action: 'Get document requirements' },
      { name: 'Get Rate Limits', value: 'getRateLimits', action: 'Get rate limits' },
      { name: 'Get Supported Countries', value: 'getSupportedCountries', action: 'Get supported countries' },
      { name: 'Get Supported Documents', value: 'getSupportedDocuments', action: 'Get supported documents' },
      { name: 'Test Connection', value: 'testConnection', action: 'Test connection' },
      { name: 'Validate API Key', value: 'validateApiKey', action: 'Validate API key' },
      { name: 'Validate Reference ID', value: 'validateReferenceId', action: 'Validate reference ID' },
    ],
    default: 'testConnection',
  },
];

export const utilityFields: INodeProperties[] = [
  {
    displayName: 'Reference ID',
    name: 'referenceId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['utility'],
        operation: ['validateReferenceId'],
      },
    },
  },
  {
    displayName: 'Country Code',
    name: 'countryCode',
    type: 'string',
    default: '',
    placeholder: 'US',
    description: 'ISO 3166-1 alpha-2 country code',
    displayOptions: {
      show: {
        resource: ['utility'],
        operation: ['getDocumentRequirements', 'getSupportedDocuments'],
      },
    },
  },
  {
    displayName: 'Prefix',
    name: 'prefix',
    type: 'string',
    default: '',
    description: 'Optional prefix for the generated reference ID',
    displayOptions: {
      show: {
        resource: ['utility'],
        operation: ['generateReferenceId'],
      },
    },
  },
];

export async function executeUtilityOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'testConnection': {
      try {
        await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: '/inquiries',
          qs: { 'page[size]': 1 },
        });
        responseData = {
          success: true,
          message: 'Connection successful',
          timestamp: new Date().toISOString(),
        };
      } catch (error: any) {
        responseData = {
          success: false,
          message: 'Connection failed',
          error: error.message,
          timestamp: new Date().toISOString(),
        };
      }
      break;
    }

    case 'validateApiKey': {
      try {
        await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: '/inquiries',
          qs: { 'page[size]': 1 },
        });
        responseData = {
          valid: true,
          message: 'API key is valid',
        };
      } catch (error: any) {
        responseData = {
          valid: false,
          message: 'API key is invalid',
          error: error.message,
        };
      }
      break;
    }

    case 'getApiVersion': {
      const credentials = await this.getCredentials('personaApi');
      responseData = {
        apiVersion: credentials.apiVersion || '2023-01-05',
        environment: credentials.environment,
      };
      break;
    }

    case 'getRateLimits': {
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: '/rate-limits',
      });
      break;
    }

    case 'checkServiceStatus': {
      try {
        const start = Date.now();
        await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: '/inquiries',
          qs: { 'page[size]': 1 },
        });
        const latency = Date.now() - start;

        responseData = {
          status: 'operational',
          latency: `${latency}ms`,
          timestamp: new Date().toISOString(),
        };
      } catch {
        responseData = {
          status: 'degraded',
          timestamp: new Date().toISOString(),
        };
      }
      break;
    }

    case 'getSupportedCountries': {
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: '/countries',
      });
      break;
    }

    case 'getSupportedDocuments': {
      const countryCode = this.getNodeParameter('countryCode', i, '') as string;
      const qs: IDataObject = {};
      if (countryCode) qs['filter[country-code]'] = countryCode;

      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: '/document-types',
        qs,
      });
      break;
    }

    case 'getDocumentRequirements': {
      const countryCode = this.getNodeParameter('countryCode', i, '') as string;
      const qs: IDataObject = {};
      if (countryCode) qs['filter[country-code]'] = countryCode;

      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: '/document-requirements',
        qs,
      });
      break;
    }

    case 'validateReferenceId': {
      const referenceId = this.getNodeParameter('referenceId', i) as string;

      // Check format
      const isValidFormat = /^[a-zA-Z0-9_-]+$/.test(referenceId);
      const isValidLength = referenceId.length <= 255;

      // Check if it exists
      let exists = false;
      try {
        const response = await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: '/inquiries',
          qs: { 'filter[reference-id]': referenceId },
        });
        const data = response.data as IDataObject[];
        exists = Array.isArray(data) && data.length > 0;
      } catch {
        exists = false;
      }

      responseData = {
        referenceId,
        validFormat: isValidFormat,
        validLength: isValidLength,
        exists,
        message: !isValidFormat
          ? 'Reference ID contains invalid characters'
          : !isValidLength
            ? 'Reference ID exceeds maximum length'
            : exists
              ? 'Reference ID already in use'
              : 'Reference ID is valid and available',
      };
      break;
    }

    case 'generateReferenceId': {
      const prefix = this.getNodeParameter('prefix', i, '') as string;
      const id = generateIdempotencyKey();
      const referenceId = prefix ? `${prefix}_${id}` : id;

      responseData = {
        referenceId,
        timestamp: new Date().toISOString(),
      };
      break;
    }
  }

  return responseData;
}
