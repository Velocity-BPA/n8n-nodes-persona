/**
 * Persona Analytics Actions
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

export const analyticsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['analytics'] } },
    options: [
      { name: 'Get Approval Rate', value: 'getApprovalRate', action: 'Get approval rate' },
      { name: 'Get Average Duration', value: 'getAverageDuration', action: 'Get average duration' },
      { name: 'Get Completion Rate', value: 'getCompletionRate', action: 'Get completion rate' },
      { name: 'Get Conversion Funnel', value: 'getConversionFunnel', action: 'Get conversion funnel' },
      { name: 'Get Daily Stats', value: 'getDailyStats', action: 'Get daily stats' },
      { name: 'Get Decline Rate', value: 'getDeclineRate', action: 'Get decline rate' },
      { name: 'Get Drop-Off Analysis', value: 'getDropOffAnalysis', action: 'Get drop-off analysis' },
      { name: 'Get Error Rate', value: 'getErrorRate', action: 'Get error rate' },
      { name: 'Get Monthly Stats', value: 'getMonthlyStats', action: 'Get monthly stats' },
      { name: 'Get Performance Metrics', value: 'getPerformanceMetrics', action: 'Get performance metrics' },
      { name: 'Get Retry Rate', value: 'getRetryRate', action: 'Get retry rate' },
      { name: 'Get Verification Stats', value: 'getVerificationStats', action: 'Get verification stats' },
    ],
    default: 'getVerificationStats',
  },
];

export const analyticsFields: INodeProperties[] = [
  {
    displayName: 'Date Range',
    name: 'dateRange',
    type: 'options',
    options: [
      { name: 'Last 7 Days', value: '7d' },
      { name: 'Last 30 Days', value: '30d' },
      { name: 'Last 90 Days', value: '90d' },
      { name: 'Custom', value: 'custom' },
    ],
    default: '30d',
    displayOptions: { show: { resource: ['analytics'] } },
  },
  {
    displayName: 'Start Date',
    name: 'startDate',
    type: 'dateTime',
    default: '',
    displayOptions: { show: { resource: ['analytics'], dateRange: ['custom'] } },
  },
  {
    displayName: 'End Date',
    name: 'endDate',
    type: 'dateTime',
    default: '',
    displayOptions: { show: { resource: ['analytics'], dateRange: ['custom'] } },
  },
  {
    displayName: 'Template ID',
    name: 'templateId',
    type: 'string',
    default: '',
    description: 'Filter by template (optional)',
    displayOptions: { show: { resource: ['analytics'] } },
  },
];

export async function executeAnalyticsOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  const dateRange = this.getNodeParameter('dateRange', i) as string;
  const templateId = this.getNodeParameter('templateId', i, '') as string;

  const qs: IDataObject = {};

  if (dateRange === 'custom') {
    const startDate = this.getNodeParameter('startDate', i) as string;
    const endDate = this.getNodeParameter('endDate', i) as string;
    qs['filter[created-at-after]'] = startDate;
    qs['filter[created-at-before]'] = endDate;
  } else {
    const days = parseInt(dateRange.replace('d', ''), 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    qs['filter[created-at-after]'] = startDate.toISOString();
  }

  if (templateId) {
    qs['filter[inquiry-template-id]'] = templateId;
  }

  let responseData: IDataObject = {};

  switch (operation) {
    case 'getVerificationStats': {
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: '/analytics/verifications',
        qs,
      });
      break;
    }

    case 'getApprovalRate':
    case 'getDeclineRate':
    case 'getCompletionRate':
    case 'getAverageDuration':
    case 'getDropOffAnalysis':
    case 'getConversionFunnel':
    case 'getErrorRate':
    case 'getRetryRate':
    case 'getPerformanceMetrics': {
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: '/analytics/inquiries',
        qs,
      });
      break;
    }

    case 'getDailyStats': {
      qs['group-by'] = 'day';
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: '/analytics/inquiries',
        qs,
      });
      break;
    }

    case 'getMonthlyStats': {
      qs['group-by'] = 'month';
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: '/analytics/inquiries',
        qs,
      });
      break;
    }
  }

  return responseData;
}
