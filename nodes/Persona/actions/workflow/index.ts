/**
 * Persona Workflow Actions
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

export const workflowOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['workflow'] } },
    options: [
      { name: 'Get', value: 'get', action: 'Get workflow' },
      { name: 'Get Runs', value: 'getRuns', action: 'Get workflow runs' },
      { name: 'Get Steps', value: 'getSteps', action: 'Get workflow steps' },
      { name: 'Get Actions', value: 'getActions', action: 'Get workflow actions' },
      { name: 'Get Decision Points', value: 'getDecisionPoints', action: 'Get decision points' },
      { name: 'Get Stats', value: 'getStats', action: 'Get workflow stats' },
      { name: 'Get History', value: 'getHistory', action: 'Get workflow history' },
      { name: 'List', value: 'list', action: 'List workflows' },
      { name: 'Trigger', value: 'trigger', action: 'Trigger workflow' },
    ],
    default: 'list',
  },
];

export const workflowFields: INodeProperties[] = [
  {
    displayName: 'Workflow ID',
    name: 'workflowId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'wfl_...',
    displayOptions: {
      show: {
        resource: ['workflow'],
        operation: ['get', 'getRuns', 'getSteps', 'getActions', 'getDecisionPoints', 'getStats', 'trigger', 'getHistory'],
      },
    },
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: { show: { resource: ['workflow'], operation: ['list'] } },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    typeOptions: { minValue: 1, maxValue: 500 },
    displayOptions: { show: { resource: ['workflow'], operation: ['list'], returnAll: [false] } },
  },
];

export async function executeWorkflowOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'get': {
      const workflowId = this.getNodeParameter('workflowId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.WORKFLOW_BY_ID(workflowId),
      });
      break;
    }

    case 'list': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      if (returnAll) {
        const items = await personaApiRequestAllItems.call(this, ENDPOINTS.WORKFLOWS, {});
        responseData = { data: items };
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: ENDPOINTS.WORKFLOWS,
          qs: { 'page[size]': limit },
        });
      }
      break;
    }

    case 'getRuns': {
      const workflowId = this.getNodeParameter('workflowId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.WORKFLOW_RUNS(workflowId),
      });
      break;
    }

    case 'getSteps':
    case 'getActions':
    case 'getDecisionPoints':
    case 'getStats':
    case 'getHistory': {
      const workflowId = this.getNodeParameter('workflowId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.WORKFLOW_BY_ID(workflowId),
      });
      break;
    }

    case 'trigger': {
      const workflowId = this.getNodeParameter('workflowId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: `${ENDPOINTS.WORKFLOW_BY_ID(workflowId)}/trigger`,
      });
      break;
    }
  }

  return responseData;
}
