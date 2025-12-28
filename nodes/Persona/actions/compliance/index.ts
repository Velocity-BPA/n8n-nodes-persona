/**
 * Persona Compliance Actions
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

export const complianceOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['compliance'] } },
    options: [
      { name: 'Get AML Check', value: 'getAmlCheck', action: 'Get AML check' },
      { name: 'Get Audit Trail', value: 'getAuditTrail', action: 'Get audit trail' },
      { name: 'Get CCPA Status', value: 'getCcpaStatus', action: 'Get CCPA status' },
      { name: 'Get Compliance Report', value: 'getComplianceReport', action: 'Get compliance report' },
      { name: 'Get Compliance Status', value: 'getComplianceStatus', action: 'Get compliance status' },
      { name: 'Get Data Retention Status', value: 'getDataRetentionStatus', action: 'Get data retention status' },
      { name: 'Get GDPR Status', value: 'getGdprStatus', action: 'Get GDPR status' },
      { name: 'Get KYC Status', value: 'getKycStatus', action: 'Get KYC status' },
      { name: 'Get Risk Score', value: 'getRiskScore', action: 'Get risk score' },
      { name: 'Request Data Deletion', value: 'requestDataDeletion', action: 'Request data deletion' },
      { name: 'Request Data Export', value: 'requestDataExport', action: 'Request data export' },
    ],
    default: 'getComplianceStatus',
  },
];

export const complianceFields: INodeProperties[] = [
  {
    displayName: 'Account ID',
    name: 'accountId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'act_...',
    displayOptions: {
      show: {
        resource: ['compliance'],
        operation: ['getComplianceStatus', 'getKycStatus', 'getRiskScore', 'getAuditTrail', 'requestDataDeletion', 'requestDataExport', 'getGdprStatus', 'getCcpaStatus', 'getDataRetentionStatus'],
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
    displayOptions: {
      show: {
        resource: ['compliance'],
        operation: ['getAmlCheck', 'getComplianceReport'],
      },
    },
  },
  {
    displayName: 'Deletion Reason',
    name: 'deletionReason',
    type: 'string',
    default: '',
    description: 'Reason for data deletion request',
    displayOptions: {
      show: {
        resource: ['compliance'],
        operation: ['requestDataDeletion'],
      },
    },
  },
  {
    displayName: 'Export Format',
    name: 'exportFormat',
    type: 'options',
    options: [
      { name: 'JSON', value: 'json' },
      { name: 'CSV', value: 'csv' },
    ],
    default: 'json',
    displayOptions: {
      show: {
        resource: ['compliance'],
        operation: ['requestDataExport'],
      },
    },
  },
];

export async function executeComplianceOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'getComplianceStatus': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `/accounts/${accountId}/compliance-status`,
      });
      break;
    }

    case 'getKycStatus': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `/accounts/${accountId}/kyc-status`,
      });
      break;
    }

    case 'getRiskScore': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `/accounts/${accountId}/risk-score`,
      });
      break;
    }

    case 'getAmlCheck': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `/inquiries/${inquiryId}/aml-check`,
      });
      break;
    }

    case 'getComplianceReport': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `/inquiries/${inquiryId}/compliance-report`,
      });
      break;
    }

    case 'getAuditTrail': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `/accounts/${accountId}/audit-trail`,
      });
      break;
    }

    case 'getGdprStatus': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `/accounts/${accountId}/gdpr-status`,
      });
      break;
    }

    case 'getCcpaStatus': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `/accounts/${accountId}/ccpa-status`,
      });
      break;
    }

    case 'getDataRetentionStatus': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `/accounts/${accountId}/data-retention`,
      });
      break;
    }

    case 'requestDataDeletion': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      const deletionReason = this.getNodeParameter('deletionReason', i, '') as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: `/accounts/${accountId}/request-deletion`,
        body: { meta: { reason: deletionReason } },
      });
      break;
    }

    case 'requestDataExport': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      const exportFormat = this.getNodeParameter('exportFormat', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: `/accounts/${accountId}/request-export`,
        body: { meta: { format: exportFormat } },
      });
      break;
    }
  }

  return responseData;
}
