/**
 * Persona Database Verification Actions
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

export const databaseVerificationOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['databaseVerification'] } },
    options: [
      { name: 'Get', value: 'get', description: 'Get a database verification', action: 'Get database verification' },
      { name: 'Get Checks', value: 'getChecks', description: 'Get verification checks', action: 'Get verification checks' },
      { name: 'Get Data Sources', value: 'getDataSources', description: 'Get data sources used', action: 'Get data sources' },
      { name: 'Get Discrepancies', value: 'getDiscrepancies', description: 'Get discrepancies found', action: 'Get discrepancies' },
      { name: 'Get Input Data', value: 'getInputData', description: 'Get input data', action: 'Get input data' },
      { name: 'Get Match Reasons', value: 'getMatchReasons', description: 'Get match reasons', action: 'Get match reasons' },
      { name: 'Get Matched Records', value: 'getMatchedRecords', description: 'Get matched records', action: 'Get matched records' },
      { name: 'Get Output Data', value: 'getOutputData', description: 'Get output data', action: 'Get output data' },
      { name: 'Get Source Details', value: 'getSourceDetails', description: 'Get source details', action: 'Get source details' },
      { name: 'Get Verification Score', value: 'getVerificationScore', description: 'Get verification score', action: 'Get verification score' },
      { name: 'List', value: 'list', description: 'List database verifications', action: 'List database verifications' },
    ],
    default: 'get',
  },
];

export const databaseVerificationFields: INodeProperties[] = [
  {
    displayName: 'Database Verification ID',
    name: 'databaseVerificationId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'ver_...',
    description: 'The ID of the database verification',
    displayOptions: {
      show: {
        resource: ['databaseVerification'],
        operation: ['get', 'getChecks', 'getDataSources', 'getDiscrepancies', 'getInputData', 'getMatchReasons', 'getMatchedRecords', 'getOutputData', 'getSourceDetails', 'getVerificationScore'],
      },
    },
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: { show: { resource: ['databaseVerification'], operation: ['list'] } },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    typeOptions: { minValue: 1, maxValue: 500 },
    displayOptions: { show: { resource: ['databaseVerification'], operation: ['list'], returnAll: [false] } },
  },
];

export async function executeDatabaseVerificationOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'get': {
      const id = this.getNodeParameter('databaseVerificationId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.VERIFICATION_DATABASE_BY_ID(id),
      });
      break;
    }

    case 'list': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      if (returnAll) {
        const items = await personaApiRequestAllItems.call(this, ENDPOINTS.VERIFICATION_DATABASES, {});
        responseData = { data: items };
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: ENDPOINTS.VERIFICATION_DATABASES,
          qs: { 'page[size]': limit },
        });
      }
      break;
    }

    case 'getChecks': {
      const id = this.getNodeParameter('databaseVerificationId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `${ENDPOINTS.VERIFICATION_DATABASE_BY_ID(id)}/checks`,
      });
      break;
    }

    case 'getMatchedRecords':
    case 'getDataSources':
    case 'getInputData':
    case 'getOutputData':
    case 'getSourceDetails':
    case 'getMatchReasons':
    case 'getDiscrepancies':
    case 'getVerificationScore': {
      const id = this.getNodeParameter('databaseVerificationId', i) as string;
      const response = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.VERIFICATION_DATABASE_BY_ID(id),
      });
      const data = response.data as IDataObject;
      const attributes = data.attributes as IDataObject;

      const fieldMap: Record<string, string> = {
        getMatchedRecords: 'matched-records',
        getDataSources: 'data-sources',
        getInputData: 'input-data',
        getOutputData: 'output-data',
        getSourceDetails: 'source-details',
        getMatchReasons: 'match-reasons',
        getDiscrepancies: 'discrepancies',
        getVerificationScore: 'verification-score',
      };

      responseData = {
        databaseVerificationId: id,
        [operation.replace('get', '').toLowerCase()]: attributes[fieldMap[operation]] || null,
      };
      break;
    }
  }

  return responseData;
}
