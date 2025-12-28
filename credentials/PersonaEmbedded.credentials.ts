/**
 * Persona Embedded Credentials
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

import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class PersonaEmbedded implements ICredentialType {
  name = 'personaEmbedded';
  displayName = 'Persona Embedded';
  documentationUrl = 'https://docs.withpersona.com/docs/embedded-flow';

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
      ],
      default: 'sandbox',
      description: 'The Persona environment for embedded flows',
    },
    {
      displayName: 'Client ID',
      name: 'clientId',
      type: 'string',
      default: '',
      required: true,
      description:
        'Your Persona client ID for embedded flows. Found in Dashboard → Settings → Embedded.',
    },
    {
      displayName: 'Theme ID',
      name: 'themeId',
      type: 'string',
      default: '',
      placeholder: 'the_...',
      description: 'Optional theme ID to apply custom branding to the embedded flow',
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
      description: 'Your Persona API key for generating embedded flow tokens',
    },
    {
      displayName: 'API Version',
      name: 'apiVersion',
      type: 'string',
      default: '2023-01-05',
      description: 'Persona API version to use',
    },
  ];
}
