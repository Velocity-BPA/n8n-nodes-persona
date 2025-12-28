/**
 * Persona Report Actions
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
import { downloadReportPdf } from '../../transport/imageHandler';
import { ENDPOINTS } from '../../constants/endpoints';

export const reportOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['report'] } },
    options: [
      { name: 'Create', value: 'create', description: 'Create a new report', action: 'Create a report' },
      { name: 'Download PDF', value: 'downloadPdf', description: 'Download report as PDF', action: 'Download PDF' },
      { name: 'Get', value: 'get', description: 'Get a report', action: 'Get a report' },
      { name: 'Get Adverse Media', value: 'getAdverseMedia', description: 'Get adverse media report', action: 'Get adverse media report' },
      { name: 'Get Background Check', value: 'getBackgroundCheck', description: 'Get background check report', action: 'Get background check report' },
      { name: 'Get by Inquiry', value: 'getByInquiry', description: 'Get reports for inquiry', action: 'Get reports by inquiry' },
      { name: 'Get Checks', value: 'getChecks', description: 'Get report checks', action: 'Get report checks' },
      { name: 'Get PEP', value: 'getPep', description: 'Get PEP report', action: 'Get PEP report' },
      { name: 'Get Social Media', value: 'getSocialMedia', description: 'Get social media report', action: 'Get social media report' },
      { name: 'Get Summary', value: 'getSummary', description: 'Get report summary', action: 'Get report summary' },
      { name: 'Get Watchlist', value: 'getWatchlist', description: 'Get watchlist report', action: 'Get watchlist report' },
      { name: 'List', value: 'list', description: 'List all reports', action: 'List reports' },
      { name: 'Refresh', value: 'refresh', description: 'Refresh a report', action: 'Refresh a report' },
    ],
    default: 'list',
  },
];

export const reportFields: INodeProperties[] = [
  {
    displayName: 'Report ID',
    name: 'reportId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'rep_...',
    displayOptions: {
      show: {
        resource: ['report'],
        operation: ['get', 'downloadPdf', 'getChecks', 'getSummary', 'refresh', 'getAdverseMedia', 'getWatchlist', 'getPep', 'getSocialMedia', 'getBackgroundCheck'],
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
    displayOptions: { show: { resource: ['report'], operation: ['getByInquiry', 'create'] } },
  },
  {
    displayName: 'Report Type',
    name: 'reportType',
    type: 'options',
    options: [
      { name: 'Adverse Media', value: 'adverse-media' },
      { name: 'Background Check', value: 'background-check' },
      { name: 'PEP', value: 'pep' },
      { name: 'Social Media', value: 'social-media' },
      { name: 'Watchlist', value: 'watchlist' },
    ],
    default: 'watchlist',
    displayOptions: { show: { resource: ['report'], operation: ['create'] } },
  },
  {
    displayName: 'Binary Property',
    name: 'binaryProperty',
    type: 'string',
    default: 'data',
    displayOptions: { show: { resource: ['report'], operation: ['downloadPdf'] } },
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: { show: { resource: ['report'], operation: ['list'] } },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    typeOptions: { minValue: 1, maxValue: 500 },
    displayOptions: { show: { resource: ['report'], operation: ['list'], returnAll: [false] } },
  },
];

export async function executeReportOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'get': {
      const reportId = this.getNodeParameter('reportId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.REPORT_BY_ID(reportId),
      });
      break;
    }

    case 'list': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      if (returnAll) {
        const items = await personaApiRequestAllItems.call(this, ENDPOINTS.REPORTS, {});
        responseData = { data: items };
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: ENDPOINTS.REPORTS,
          qs: { 'page[size]': limit },
        });
      }
      break;
    }

    case 'create': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      const reportType = this.getNodeParameter('reportType', i) as string;
      const body: IDataObject = {
        data: {
          attributes: { 'report-type': reportType },
          relationships: { inquiry: { data: { type: 'inquiry', id: inquiryId } } },
        },
      };
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.REPORTS,
        body,
      });
      break;
    }

    case 'getByInquiry': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.INQUIRY_REPORTS(inquiryId),
      });
      break;
    }

    case 'downloadPdf': {
      const reportId = this.getNodeParameter('reportId', i) as string;
      const binaryProperty = this.getNodeParameter('binaryProperty', i) as string;
      const pdf = await downloadReportPdf(this, reportId);
      responseData = { reportId, binary: { [binaryProperty]: pdf.binaryData } };
      break;
    }

    case 'getChecks': {
      const reportId = this.getNodeParameter('reportId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `${ENDPOINTS.REPORT_BY_ID(reportId)}/checks`,
      });
      break;
    }

    case 'getSummary': {
      const reportId = this.getNodeParameter('reportId', i) as string;
      const response = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.REPORT_BY_ID(reportId),
      });
      const data = response.data as IDataObject;
      const attributes = data.attributes as IDataObject;
      responseData = { reportId, summary: attributes['summary'] || attributes };
      break;
    }

    case 'refresh': {
      const reportId = this.getNodeParameter('reportId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: `${ENDPOINTS.REPORT_BY_ID(reportId)}/refresh`,
      });
      break;
    }

    case 'getAdverseMedia':
    case 'getWatchlist':
    case 'getPep':
    case 'getSocialMedia':
    case 'getBackgroundCheck': {
      const reportId = this.getNodeParameter('reportId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.REPORT_BY_ID(reportId),
      });
      break;
    }
  }

  return responseData;
}
