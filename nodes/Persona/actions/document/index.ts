/**
 * Persona Document Actions
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
import { downloadDocumentImage } from '../../transport/imageHandler';
import { ENDPOINTS } from '../../constants/endpoints';

export const documentOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['document'],
      },
    },
    options: [
      { name: 'Download', value: 'download', description: 'Download a document image', action: 'Download a document' },
      { name: 'Get', value: 'get', description: 'Get a document by ID', action: 'Get a document' },
      { name: 'Get by Inquiry', value: 'getByInquiry', description: 'Get documents for an inquiry', action: 'Get documents by inquiry' },
      { name: 'Get Checks', value: 'getChecks', description: 'Get checks for a document', action: 'Get document checks' },
      { name: 'Get Data', value: 'getData', description: 'Get extracted data from a document', action: 'Get document data' },
      { name: 'Get Image (Back)', value: 'getImageBack', description: 'Get the back image of a document', action: 'Get document back image' },
      { name: 'Get Image (Front)', value: 'getImageFront', description: 'Get the front image of a document', action: 'Get document front image' },
      { name: 'List', value: 'list', description: 'List all documents', action: 'List documents' },
      { name: 'Submit', value: 'submit', description: 'Submit a document for verification', action: 'Submit a document' },
    ],
    default: 'list',
  },
];

export const documentFields: INodeProperties[] = [
  {
    displayName: 'Document ID',
    name: 'documentId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'doc_...',
    description: 'The ID of the document',
    displayOptions: {
      show: {
        resource: ['document'],
        operation: ['get', 'download', 'getImageFront', 'getImageBack', 'getData', 'getChecks'],
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
        resource: ['document'],
        operation: ['getByInquiry', 'submit'],
      },
    },
  },
  {
    displayName: 'Image Side',
    name: 'imageSide',
    type: 'options',
    options: [
      { name: 'Front', value: 'front' },
      { name: 'Back', value: 'back' },
      { name: 'Both', value: 'both' },
    ],
    default: 'front',
    description: 'Which side of the document to download',
    displayOptions: {
      show: {
        resource: ['document'],
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
        resource: ['document'],
        operation: ['download', 'getImageFront', 'getImageBack'],
      },
    },
  },
  {
    displayName: 'Document Type',
    name: 'documentType',
    type: 'options',
    options: [
      { name: 'Passport', value: 'passport' },
      { name: "Driver's License", value: 'drivers_license' },
      { name: 'National ID', value: 'national_id' },
      { name: 'Utility Bill', value: 'utility_bill' },
      { name: 'Bank Statement', value: 'bank_statement' },
      { name: 'Generic', value: 'generic' },
    ],
    default: 'generic',
    description: 'Type of document being submitted',
    displayOptions: {
      show: {
        resource: ['document'],
        operation: ['submit'],
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
        resource: ['document'],
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
        resource: ['document'],
        operation: ['list'],
        returnAll: [false],
      },
    },
  },
];

export async function executeDocumentOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'get': {
      const documentId = this.getNodeParameter('documentId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.DOCUMENT_BY_ID(documentId),
      });
      break;
    }

    case 'getByInquiry': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.INQUIRY_DOCUMENTS(inquiryId),
      });
      break;
    }

    case 'list': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;

      if (returnAll) {
        const items = await personaApiRequestAllItems.call(this, ENDPOINTS.DOCUMENTS, {});
        responseData = { data: items };
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: ENDPOINTS.DOCUMENTS,
          qs: { 'page[size]': limit },
        });
      }
      break;
    }

    case 'download': {
      const documentId = this.getNodeParameter('documentId', i) as string;
      const imageSide = this.getNodeParameter('imageSide', i) as string;
      const binaryProperty = this.getNodeParameter('binaryProperty', i) as string;

      const binaryData: IDataObject = {};

      if (imageSide === 'both' || imageSide === 'front') {
        const frontImage = await downloadDocumentImage(this, documentId, 'front');
        binaryData[`${binaryProperty}_front`] = frontImage.binaryData;
      }

      if (imageSide === 'both' || imageSide === 'back') {
        try {
          const backImage = await downloadDocumentImage(this, documentId, 'back');
          binaryData[`${binaryProperty}_back`] = backImage.binaryData;
        } catch {
          // Back image might not exist for all documents
        }
      }

      responseData = {
        documentId,
        imageSide,
        binary: binaryData,
      };
      break;
    }

    case 'getImageFront': {
      const documentId = this.getNodeParameter('documentId', i) as string;
      const binaryProperty = this.getNodeParameter('binaryProperty', i) as string;
      const frontImage = await downloadDocumentImage(this, documentId, 'front');
      responseData = {
        documentId,
        binary: { [binaryProperty]: frontImage.binaryData },
      };
      break;
    }

    case 'getImageBack': {
      const documentId = this.getNodeParameter('documentId', i) as string;
      const binaryProperty = this.getNodeParameter('binaryProperty', i) as string;
      const backImage = await downloadDocumentImage(this, documentId, 'back');
      responseData = {
        documentId,
        binary: { [binaryProperty]: backImage.binaryData },
      };
      break;
    }

    case 'getData': {
      const documentId = this.getNodeParameter('documentId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `${ENDPOINTS.DOCUMENT_BY_ID(documentId)}`,
        qs: { include: 'extracted-fields' },
      });
      break;
    }

    case 'getChecks': {
      const documentId = this.getNodeParameter('documentId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `${ENDPOINTS.DOCUMENT_BY_ID(documentId)}/checks`,
      });
      break;
    }

    case 'submit': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      const documentType = this.getNodeParameter('documentType', i) as string;

      const body: IDataObject = {
        data: {
          attributes: {
            'document-type': documentType,
          },
          relationships: {
            inquiry: {
              data: { type: 'inquiry', id: inquiryId },
            },
          },
        },
      };

      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.DOCUMENTS,
        body,
      });
      break;
    }
  }

  return responseData;
}
