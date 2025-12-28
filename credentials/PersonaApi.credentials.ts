/**
 * Persona API Credentials
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

import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class PersonaApi implements ICredentialType {
  name = 'personaApi';
  displayName = 'Persona API';
  documentationUrl = 'https://docs.withpersona.com/reference/introduction';

  properties: INodeProperties[] = [
    {
      displayName: 'Environment',
      name: 'environment',
      type: 'options',
      options: [
        {
          name: 'Production',
          value: 'production',
        },
        {
          name: 'Sandbox',
          value: 'sandbox',
        },
        {
          name: 'Custom',
          value: 'custom',
        },
      ],
      default: 'sandbox',
      description: 'The Persona environment to connect to',
    },
    {
      displayName: 'Custom API URL',
      name: 'customApiUrl',
      type: 'string',
      default: '',
      placeholder: 'https://custom.withpersona.com/api/v1',
      description: 'Custom API endpoint URL (only used when Environment is set to Custom)',
      displayOptions: {
        show: {
          environment: ['custom'],
        },
      },
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'Your Persona API key. Found in Dashboard → Settings → API Keys.',
    },
    {
      displayName: 'API Key Secret',
      name: 'apiKeySecret',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Your Persona API key secret for webhook signature verification (optional)',
    },
    {
      displayName: 'API Version',
      name: 'apiVersion',
      type: 'string',
      default: '2023-01-05',
      description: 'Persona API version to use. Format: YYYY-MM-DD.',
    },
    {
      displayName: 'Default Template ID',
      name: 'defaultTemplateId',
      type: 'string',
      default: '',
      placeholder: 'itmpl_...',
      description: 'Default inquiry template ID to use when creating inquiries (optional)',
    },
    {
      displayName: 'Webhook Secret',
      name: 'webhookSecret',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Secret for verifying webhook signatures. Found in Dashboard → Webhooks.',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.apiKey}}',
        'Persona-Version': '={{$credentials.apiVersion}}',
        'Content-Type': 'application/json',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL:
        '={{$credentials.environment === "production" ? "https://withpersona.com/api/v1" : $credentials.environment === "sandbox" ? "https://withpersona.com/api/v1" : $credentials.customApiUrl}}',
      url: '/inquiries',
      method: 'GET',
      qs: {
        'page[size]': 1,
      },
    },
  };
}
