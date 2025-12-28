/**
 * Persona Selfie Actions
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
import { downloadSelfieImage, downloadAllSelfiePoses } from '../../transport/imageHandler';
import { ENDPOINTS } from '../../constants/endpoints';

export const selfieOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['selfie'],
      },
    },
    options: [
      { name: 'Compare', value: 'compare', description: 'Compare two selfies', action: 'Compare selfies' },
      { name: 'Download', value: 'download', description: 'Download a selfie image', action: 'Download a selfie' },
      { name: 'Get', value: 'get', description: 'Get a selfie by ID', action: 'Get a selfie' },
      { name: 'Get by Inquiry', value: 'getByInquiry', description: 'Get selfies for an inquiry', action: 'Get selfies by inquiry' },
      { name: 'Get Checks', value: 'getChecks', description: 'Get checks for a selfie', action: 'Get selfie checks' },
      { name: 'Get Face Match Score', value: 'getFaceMatchScore', description: 'Get face match score for a selfie', action: 'Get face match score' },
      { name: 'Get Liveness Check', value: 'getLivenessCheck', description: 'Get liveness check result', action: 'Get liveness check' },
      { name: 'List', value: 'list', description: 'List all selfies', action: 'List selfies' },
    ],
    default: 'list',
  },
];

export const selfieFields: INodeProperties[] = [
  {
    displayName: 'Selfie ID',
    name: 'selfieId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'sel_...',
    description: 'The ID of the selfie',
    displayOptions: {
      show: {
        resource: ['selfie'],
        operation: ['get', 'download', 'getChecks', 'getLivenessCheck', 'getFaceMatchScore'],
      },
    },
  },
  {
    displayName: 'Inquiry ID',
    name: 'inquiryId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'inq_...',
    description: 'The ID of the inquiry',
    displayOptions: {
      show: {
        resource: ['selfie'],
        operation: ['getByInquiry'],
      },
    },
  },
  {
    displayName: 'First Selfie ID',
    name: 'firstSelfieId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'sel_...',
    description: 'The ID of the first selfie to compare',
    displayOptions: {
      show: {
        resource: ['selfie'],
        operation: ['compare'],
      },
    },
  },
  {
    displayName: 'Second Selfie ID',
    name: 'secondSelfieId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'sel_...',
    description: 'The ID of the second selfie to compare',
    displayOptions: {
      show: {
        resource: ['selfie'],
        operation: ['compare'],
      },
    },
  },
  {
    displayName: 'Pose',
    name: 'pose',
    type: 'options',
    options: [
      { name: 'Center', value: 'center' },
      { name: 'Left', value: 'left' },
      { name: 'Right', value: 'right' },
      { name: 'All Poses', value: 'all' },
    ],
    default: 'center',
    description: 'Which pose to download',
    displayOptions: {
      show: {
        resource: ['selfie'],
        operation: ['download'],
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
      show: {
        resource: ['selfie'],
        operation: ['download'],
      },
    },
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
    displayOptions: {
      show: {
        resource: ['selfie'],
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
        resource: ['selfie'],
        operation: ['list'],
        returnAll: [false],
      },
    },
  },
];

export async function executeSelfieOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'get': {
      const selfieId = this.getNodeParameter('selfieId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.SELFIE_BY_ID(selfieId),
      });
      break;
    }

    case 'getByInquiry': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.INQUIRY_SELFIES(inquiryId),
      });
      break;
    }

    case 'list': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;

      if (returnAll) {
        const items = await personaApiRequestAllItems.call(this, ENDPOINTS.SELFIES, {});
        responseData = { data: items };
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: ENDPOINTS.SELFIES,
          qs: { 'page[size]': limit },
        });
      }
      break;
    }

    case 'download': {
      const selfieId = this.getNodeParameter('selfieId', i) as string;
      const pose = this.getNodeParameter('pose', i) as string;
      const binaryProperty = this.getNodeParameter('binaryProperty', i) as string;

      const binaryData: IDataObject = {};

      if (pose === 'all') {
        const poses = await downloadAllSelfiePoses(this, selfieId);
        if (poses.center) binaryData[`${binaryProperty}_center`] = poses.center.binaryData;
        if (poses.left) binaryData[`${binaryProperty}_left`] = poses.left.binaryData;
        if (poses.right) binaryData[`${binaryProperty}_right`] = poses.right.binaryData;
      } else {
        const image = await downloadSelfieImage(this, selfieId, pose as 'center' | 'left' | 'right');
        binaryData[binaryProperty] = image.binaryData;
      }

      responseData = {
        selfieId,
        pose,
        binary: binaryData,
      };
      break;
    }

    case 'getChecks': {
      const selfieId = this.getNodeParameter('selfieId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `${ENDPOINTS.SELFIE_BY_ID(selfieId)}/checks`,
      });
      break;
    }

    case 'getLivenessCheck': {
      const selfieId = this.getNodeParameter('selfieId', i) as string;
      const response = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.SELFIE_BY_ID(selfieId),
        qs: { include: 'checks' },
      });

      const data = response.data as IDataObject;
      const attributes = data.attributes as IDataObject;
      responseData = {
        selfieId,
        livenessCheck: attributes['liveness-check'] || null,
        livenessScore: attributes['liveness-score'] || null,
      };
      break;
    }

    case 'getFaceMatchScore': {
      const selfieId = this.getNodeParameter('selfieId', i) as string;
      const response = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.SELFIE_BY_ID(selfieId),
      });

      const data = response.data as IDataObject;
      const attributes = data.attributes as IDataObject;
      responseData = {
        selfieId,
        faceMatchScore: attributes['face-match-score'] || null,
        faceMatchResult: attributes['face-match-result'] || null,
      };
      break;
    }

    case 'compare': {
      const firstSelfieId = this.getNodeParameter('firstSelfieId', i) as string;
      const secondSelfieId = this.getNodeParameter('secondSelfieId', i) as string;

      const body: IDataObject = {
        data: {
          attributes: {
            'selfie-id-1': firstSelfieId,
            'selfie-id-2': secondSelfieId,
          },
        },
      };

      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: `${ENDPOINTS.SELFIES}/compare`,
        body,
      });
      break;
    }
  }

  return responseData;
}
