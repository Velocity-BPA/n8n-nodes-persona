/**
 * Persona Government ID Actions
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
import { downloadGovernmentIdImage } from '../../transport/imageHandler';
import { ENDPOINTS } from '../../constants/endpoints';

export const governmentIdOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['governmentId'] } },
    options: [
      { name: 'Get', value: 'get', description: 'Get a government ID by ID', action: 'Get a government ID' },
      { name: 'Get Back Image', value: 'getBackImage', description: 'Get the back image', action: 'Get back image' },
      { name: 'Get Barcode Data', value: 'getBarcodeData', description: 'Get barcode data', action: 'Get barcode data' },
      { name: 'Get Checks', value: 'getChecks', description: 'Get ID checks', action: 'Get ID checks' },
      { name: 'Get Extracted Data', value: 'getExtractedData', description: 'Get extracted data', action: 'Get extracted data' },
      { name: 'Get Front Image', value: 'getFrontImage', description: 'Get the front image', action: 'Get front image' },
      { name: 'Get MRZ Data', value: 'getMrzData', description: 'Get MRZ data', action: 'Get MRZ data' },
      { name: 'Get NFC Data', value: 'getNfcData', description: 'Get NFC data', action: 'Get NFC data' },
      { name: 'List', value: 'list', description: 'List all government IDs', action: 'List government IDs' },
      { name: 'Verify', value: 'verify', description: 'Verify a government ID', action: 'Verify government ID' },
    ],
    default: 'list',
  },
];

export const governmentIdFields: INodeProperties[] = [
  {
    displayName: 'Government ID',
    name: 'governmentIdId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'gid_...',
    description: 'The ID of the government ID',
    displayOptions: {
      show: {
        resource: ['governmentId'],
        operation: ['get', 'getFrontImage', 'getBackImage', 'getExtractedData', 'getBarcodeData', 'getMrzData', 'getNfcData', 'getChecks', 'verify'],
      },
    },
  },
  {
    displayName: 'Binary Property',
    name: 'binaryProperty',
    type: 'string',
    default: 'data',
    description: 'Name of the binary property to store the image',
    displayOptions: {
      show: { resource: ['governmentId'], operation: ['getFrontImage', 'getBackImage'] },
    },
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: { show: { resource: ['governmentId'], operation: ['list'] } },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    typeOptions: { minValue: 1, maxValue: 500 },
    displayOptions: { show: { resource: ['governmentId'], operation: ['list'], returnAll: [false] } },
  },
];

export async function executeGovernmentIdOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'get': {
      const governmentIdId = this.getNodeParameter('governmentIdId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.GOVERNMENT_ID_BY_ID(governmentIdId),
      });
      break;
    }

    case 'list': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      if (returnAll) {
        const items = await personaApiRequestAllItems.call(this, ENDPOINTS.GOVERNMENT_IDS, {});
        responseData = { data: items };
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: ENDPOINTS.GOVERNMENT_IDS,
          qs: { 'page[size]': limit },
        });
      }
      break;
    }

    case 'getFrontImage': {
      const governmentIdId = this.getNodeParameter('governmentIdId', i) as string;
      const binaryProperty = this.getNodeParameter('binaryProperty', i) as string;
      const image = await downloadGovernmentIdImage(this, governmentIdId, 'front');
      responseData = { governmentIdId, binary: { [binaryProperty]: image.binaryData } };
      break;
    }

    case 'getBackImage': {
      const governmentIdId = this.getNodeParameter('governmentIdId', i) as string;
      const binaryProperty = this.getNodeParameter('binaryProperty', i) as string;
      const image = await downloadGovernmentIdImage(this, governmentIdId, 'back');
      responseData = { governmentIdId, binary: { [binaryProperty]: image.binaryData } };
      break;
    }

    case 'getExtractedData': {
      const governmentIdId = this.getNodeParameter('governmentIdId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.GOVERNMENT_ID_BY_ID(governmentIdId),
        qs: { include: 'extracted-fields' },
      });
      break;
    }

    case 'getBarcodeData': {
      const governmentIdId = this.getNodeParameter('governmentIdId', i) as string;
      const response = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.GOVERNMENT_ID_BY_ID(governmentIdId),
      });
      const data = response.data as IDataObject;
      const attributes = data.attributes as IDataObject;
      responseData = { governmentIdId, barcodeData: attributes['barcode'] || null };
      break;
    }

    case 'getMrzData': {
      const governmentIdId = this.getNodeParameter('governmentIdId', i) as string;
      const response = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.GOVERNMENT_ID_BY_ID(governmentIdId),
      });
      const data = response.data as IDataObject;
      const attributes = data.attributes as IDataObject;
      responseData = { governmentIdId, mrzData: attributes['mrz'] || null };
      break;
    }

    case 'getNfcData': {
      const governmentIdId = this.getNodeParameter('governmentIdId', i) as string;
      const response = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.GOVERNMENT_ID_BY_ID(governmentIdId),
      });
      const data = response.data as IDataObject;
      const attributes = data.attributes as IDataObject;
      responseData = { governmentIdId, nfcData: attributes['nfc'] || null };
      break;
    }

    case 'getChecks': {
      const governmentIdId = this.getNodeParameter('governmentIdId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `${ENDPOINTS.GOVERNMENT_ID_BY_ID(governmentIdId)}/checks`,
      });
      break;
    }

    case 'verify': {
      const governmentIdId = this.getNodeParameter('governmentIdId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: `${ENDPOINTS.GOVERNMENT_ID_BY_ID(governmentIdId)}/verify`,
      });
      break;
    }
  }

  return responseData;
}
