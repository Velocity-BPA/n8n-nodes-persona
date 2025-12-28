/**
 * Persona Embedded Flow Actions
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

export const embeddedFlowOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['embeddedFlow'] } },
    options: [
      { name: 'Create Theme', value: 'createTheme', action: 'Create theme' },
      { name: 'Generate Inquiry URL', value: 'generateInquiryUrl', action: 'Generate inquiry URL' },
      { name: 'Generate Resume URL', value: 'generateResumeUrl', action: 'Generate resume URL' },
      { name: 'Get Client Token', value: 'getClientToken', action: 'Get client token' },
      { name: 'Get Configuration', value: 'getConfiguration', action: 'Get embedded configuration' },
      { name: 'Get Localization', value: 'getLocalization', action: 'Get localization' },
      { name: 'Get Supported Languages', value: 'getSupportedLanguages', action: 'Get supported languages' },
      { name: 'Get Theme', value: 'getTheme', action: 'Get theme' },
      { name: 'List Themes', value: 'listThemes', action: 'List themes' },
      { name: 'Update Theme', value: 'updateTheme', action: 'Update theme' },
    ],
    default: 'generateInquiryUrl',
  },
];

export const embeddedFlowFields: INodeProperties[] = [
  {
    displayName: 'Template ID',
    name: 'templateId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'itmpl_...',
    displayOptions: { show: { resource: ['embeddedFlow'], operation: ['generateInquiryUrl', 'getClientToken'] } },
  },
  {
    displayName: 'Inquiry ID',
    name: 'inquiryId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'inq_...',
    displayOptions: { show: { resource: ['embeddedFlow'], operation: ['generateResumeUrl'] } },
  },
  {
    displayName: 'Theme ID',
    name: 'themeId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'the_...',
    displayOptions: { show: { resource: ['embeddedFlow'], operation: ['getTheme', 'updateTheme'] } },
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: { show: { resource: ['embeddedFlow'], operation: ['generateInquiryUrl', 'getClientToken'] } },
    options: [
      { displayName: 'Reference ID', name: 'referenceId', type: 'string', default: '' },
      { displayName: 'Redirect URI', name: 'redirectUri', type: 'string', default: '' },
      { displayName: 'Theme ID', name: 'themeId', type: 'string', default: '' },
      { displayName: 'Environment', name: 'environment', type: 'options', options: [{ name: 'Production', value: 'production' }, { name: 'Sandbox', value: 'sandbox' }], default: 'sandbox' },
    ],
  },
  {
    displayName: 'Theme Name',
    name: 'themeName',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['embeddedFlow'], operation: ['createTheme'] } },
  },
  {
    displayName: 'Theme Settings',
    name: 'themeSettings',
    type: 'json',
    default: '{}',
    displayOptions: { show: { resource: ['embeddedFlow'], operation: ['createTheme', 'updateTheme'] } },
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: { show: { resource: ['embeddedFlow'], operation: ['listThemes'] } },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    typeOptions: { minValue: 1, maxValue: 500 },
    displayOptions: { show: { resource: ['embeddedFlow'], operation: ['listThemes'], returnAll: [false] } },
  },
];

export async function executeEmbeddedFlowOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'generateInquiryUrl': {
      const templateId = this.getNodeParameter('templateId', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const attributes: IDataObject = { 'inquiry-template-id': templateId };
      if (additionalFields.referenceId) attributes['reference-id'] = additionalFields.referenceId;
      if (additionalFields.redirectUri) attributes['redirect-uri'] = additionalFields.redirectUri;

      const response = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.INQUIRIES,
        body: { data: { attributes } },
      });

      const data = response.data as IDataObject;
      const inquiryId = data.id;

      const linkResponse = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.INQUIRY_ONE_TIME_LINK(inquiryId as string),
      });

      responseData = { inquiryId, ...linkResponse };
      break;
    }

    case 'generateResumeUrl': {
      const inquiryId = this.getNodeParameter('inquiryId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.INQUIRY_ONE_TIME_LINK(inquiryId),
      });
      break;
    }

    case 'getClientToken': {
      const templateId = this.getNodeParameter('templateId', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const attributes: IDataObject = { 'inquiry-template-id': templateId };
      if (additionalFields.referenceId) attributes['reference-id'] = additionalFields.referenceId;

      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: '/inquiries/token',
        body: { data: { attributes } },
      });
      break;
    }

    case 'getConfiguration': {
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: '/embedded/configuration',
      });
      break;
    }

    case 'getTheme': {
      const themeId = this.getNodeParameter('themeId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.THEME_BY_ID(themeId),
      });
      break;
    }

    case 'listThemes': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      if (returnAll) {
        const items = await personaApiRequestAllItems.call(this, ENDPOINTS.THEMES, {});
        responseData = { data: items };
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: ENDPOINTS.THEMES,
          qs: { 'page[size]': limit },
        });
      }
      break;
    }

    case 'createTheme': {
      const themeName = this.getNodeParameter('themeName', i) as string;
      const themeSettings = this.getNodeParameter('themeSettings', i) as string;
      const settings = typeof themeSettings === 'string' ? JSON.parse(themeSettings) : themeSettings;

      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.THEMES,
        body: { data: { attributes: { name: themeName, ...settings } } },
      });
      break;
    }

    case 'updateTheme': {
      const themeId = this.getNodeParameter('themeId', i) as string;
      const themeSettings = this.getNodeParameter('themeSettings', i) as string;
      const settings = typeof themeSettings === 'string' ? JSON.parse(themeSettings) : themeSettings;

      responseData = await personaApiRequest.call(this, {
        method: 'PATCH',
        endpoint: ENDPOINTS.THEME_BY_ID(themeId),
        body: { data: { attributes: settings } },
      });
      break;
    }

    case 'getLocalization': {
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: '/localization',
      });
      break;
    }

    case 'getSupportedLanguages': {
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: '/languages',
      });
      break;
    }
  }

  return responseData;
}
