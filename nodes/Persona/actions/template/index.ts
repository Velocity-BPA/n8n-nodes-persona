/**
 * Persona Template Actions
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

export const templateOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['template'] } },
    options: [
      { name: 'Archive', value: 'archive', action: 'Archive template' },
      { name: 'Clone', value: 'clone', action: 'Clone template' },
      { name: 'Get', value: 'get', action: 'Get template' },
      { name: 'Get Active', value: 'getActive', action: 'Get active templates' },
      { name: 'Get Fields', value: 'getFields', action: 'Get template fields' },
      { name: 'Get Stats', value: 'getStats', action: 'Get template stats' },
      { name: 'Get Steps', value: 'getSteps', action: 'Get template steps' },
      { name: 'Get Versions', value: 'getVersions', action: 'Get template versions' },
      { name: 'List', value: 'list', action: 'List templates' },
      { name: 'Restore', value: 'restore', action: 'Restore template' },
      { name: 'Update', value: 'update', action: 'Update template' },
    ],
    default: 'list',
  },
];

export const templateFields: INodeProperties[] = [
  {
    displayName: 'Template ID',
    name: 'templateId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'itmpl_...',
    displayOptions: {
      show: {
        resource: ['template'],
        operation: ['get', 'update', 'clone', 'archive', 'restore', 'getVersions', 'getSteps', 'getFields', 'getStats'],
      },
    },
  },
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: { show: { resource: ['template'], operation: ['update'] } },
    options: [
      { displayName: 'Name', name: 'name', type: 'string', default: '' },
      { displayName: 'Description', name: 'description', type: 'string', default: '' },
    ],
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: { show: { resource: ['template'], operation: ['list', 'getActive'] } },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    typeOptions: { minValue: 1, maxValue: 500 },
    displayOptions: { show: { resource: ['template'], operation: ['list', 'getActive'], returnAll: [false] } },
  },
];

export async function executeTemplateOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'get': {
      const templateId = this.getNodeParameter('templateId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.TEMPLATE_BY_ID(templateId),
      });
      break;
    }

    case 'list': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      if (returnAll) {
        const items = await personaApiRequestAllItems.call(this, ENDPOINTS.TEMPLATES, {});
        responseData = { data: items };
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: ENDPOINTS.TEMPLATES,
          qs: { 'page[size]': limit },
        });
      }
      break;
    }

    case 'update': {
      const templateId = this.getNodeParameter('templateId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
      const attributes: IDataObject = {};
      if (updateFields.name) attributes['name'] = updateFields.name;
      if (updateFields.description) attributes['description'] = updateFields.description;

      responseData = await personaApiRequest.call(this, {
        method: 'PATCH',
        endpoint: ENDPOINTS.TEMPLATE_BY_ID(templateId),
        body: { data: { attributes } },
      });
      break;
    }

    case 'clone': {
      const templateId = this.getNodeParameter('templateId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.TEMPLATE_CLONE(templateId),
      });
      break;
    }

    case 'archive': {
      const templateId = this.getNodeParameter('templateId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.TEMPLATE_ARCHIVE(templateId),
      });
      break;
    }

    case 'restore': {
      const templateId = this.getNodeParameter('templateId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.TEMPLATE_RESTORE(templateId),
      });
      break;
    }

    case 'getVersions': {
      const templateId = this.getNodeParameter('templateId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `${ENDPOINTS.TEMPLATE_BY_ID(templateId)}/versions`,
      });
      break;
    }

    case 'getSteps': {
      const templateId = this.getNodeParameter('templateId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `${ENDPOINTS.TEMPLATE_BY_ID(templateId)}/steps`,
      });
      break;
    }

    case 'getFields': {
      const templateId = this.getNodeParameter('templateId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `${ENDPOINTS.TEMPLATE_BY_ID(templateId)}/fields`,
      });
      break;
    }

    case 'getStats': {
      const templateId = this.getNodeParameter('templateId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: `${ENDPOINTS.TEMPLATE_BY_ID(templateId)}/stats`,
      });
      break;
    }

    case 'getActive': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const qs: IDataObject = { 'filter[status]': 'active' };
      if (returnAll) {
        const items = await personaApiRequestAllItems.call(this, ENDPOINTS.TEMPLATES, qs);
        responseData = { data: items };
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        qs['page[size]'] = limit;
        responseData = await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: ENDPOINTS.TEMPLATES,
          qs,
        });
      }
      break;
    }
  }

  return responseData;
}
