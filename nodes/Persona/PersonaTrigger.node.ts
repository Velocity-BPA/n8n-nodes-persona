/**
 * Persona Trigger Node
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
  IHookFunctions,
  IWebhookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
  NodeConnectionType,
} from 'n8n-workflow';

import { personaApiRequest } from './transport/personaApi';
import {
  verifyWebhookRequest,
  parseWebhookPayload,
  getEventType,
  transformWebhookPayload,
  shouldProcessEvent,
} from './transport/webhookHandler';
import { ALL_EVENT_TYPES } from './constants/eventTypes';

export class PersonaTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Persona Trigger',
    name: 'personaTrigger',
    icon: 'file:persona.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["events"].join(", ")}}',
    description: 'Starts workflow when Persona events occur',
    defaults: { name: 'Persona Trigger' },
    inputs: [],
    outputs: [NodeConnectionType.Main],
    credentials: [{ name: 'personaApi', required: true }],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    properties: [
      {
        displayName: 'Events',
        name: 'events',
        type: 'multiOptions',
        options: [
          { name: 'All Events', value: '*' },
          { name: '--- Inquiry Events ---', value: 'separator_inquiry', disabled: true },
          { name: 'Inquiry Created', value: 'inquiry.created' },
          { name: 'Inquiry Started', value: 'inquiry.started' },
          { name: 'Inquiry Completed', value: 'inquiry.completed' },
          { name: 'Inquiry Approved', value: 'inquiry.approved' },
          { name: 'Inquiry Declined', value: 'inquiry.declined' },
          { name: 'Inquiry Expired', value: 'inquiry.expired' },
          { name: 'Inquiry Failed', value: 'inquiry.failed' },
          { name: 'Inquiry Pending', value: 'inquiry.pending' },
          { name: 'Inquiry Needs Review', value: 'inquiry.needs-review' },
          { name: 'Inquiry Transitioned', value: 'inquiry.transitioned' },
          { name: '--- Verification Events ---', value: 'separator_verification', disabled: true },
          { name: 'Verification Passed', value: 'verification.passed' },
          { name: 'Verification Failed', value: 'verification.failed' },
          { name: 'Verification Requires Review', value: 'verification.requires-review' },
          { name: 'Document Verified', value: 'verification.document.passed' },
          { name: 'Selfie Verified', value: 'verification.selfie.passed' },
          { name: 'Database Match Found', value: 'verification.database.passed' },
          { name: 'Phone Verified', value: 'verification.phone-number.passed' },
          { name: 'Email Verified', value: 'verification.email-address.passed' },
          { name: '--- Account Events ---', value: 'separator_account', disabled: true },
          { name: 'Account Created', value: 'account.created' },
          { name: 'Account Updated', value: 'account.updated' },
          { name: 'Account Redacted', value: 'account.redacted' },
          { name: 'Account Merged', value: 'account.merged' },
          { name: 'Account Tagged', value: 'account.tag.added' },
          { name: '--- Watchlist Events ---', value: 'separator_watchlist', disabled: true },
          { name: 'Watchlist Hit Detected', value: 'watchlist.hit.detected' },
          { name: 'Watchlist Hit Cleared', value: 'watchlist.hit.cleared' },
          { name: 'True Match Confirmed', value: 'watchlist.hit.confirmed' },
          { name: 'False Positive Marked', value: 'watchlist.hit.false-positive' },
          { name: 'Ongoing Monitoring Alert', value: 'watchlist.ongoing-monitoring.alert' },
          { name: '--- Transaction Events ---', value: 'separator_transaction', disabled: true },
          { name: 'Transaction Created', value: 'transaction.created' },
          { name: 'Transaction Approved', value: 'transaction.approved' },
          { name: 'Transaction Declined', value: 'transaction.declined' },
          { name: 'Transaction Flagged', value: 'transaction.flagged' },
          { name: 'High Risk Transaction', value: 'transaction.high-risk' },
          { name: '--- Case Events ---', value: 'separator_case', disabled: true },
          { name: 'Case Created', value: 'case.created' },
          { name: 'Case Assigned', value: 'case.assigned' },
          { name: 'Case Updated', value: 'case.updated' },
          { name: 'Case Closed', value: 'case.closed' },
          { name: 'Case Comment Added', value: 'case.comment.added' },
          { name: '--- Document Events ---', value: 'separator_document', disabled: true },
          { name: 'Document Submitted', value: 'document.submitted' },
          { name: 'Document Processed', value: 'document.processed' },
          { name: 'Document Rejected', value: 'document.rejected' },
          { name: 'Document Expired', value: 'document.expired' },
          { name: '--- Session Events ---', value: 'separator_session', disabled: true },
          { name: 'Session Started', value: 'session.started' },
          { name: 'Session Completed', value: 'session.completed' },
          { name: 'Session Abandoned', value: 'session.abandoned' },
          { name: 'Session Timeout', value: 'session.timeout' },
          { name: '--- Report Events ---', value: 'separator_report', disabled: true },
          { name: 'Report Generated', value: 'report.generated' },
          { name: 'Report Updated', value: 'report.updated' },
          { name: 'Adverse Media Found', value: 'report.adverse-media.found' },
          { name: 'PEP Match Found', value: 'report.pep.match' },
        ],
        default: ['*'],
        required: true,
        description: 'The events to listen for',
      },
      {
        displayName: 'Verify Signature',
        name: 'verifySignature',
        type: 'boolean',
        default: true,
        description: 'Whether to verify the webhook signature using the webhook secret',
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl('default');
        const webhookData = this.getWorkflowStaticData('node');

        if (webhookData.webhookId) {
          try {
            await personaApiRequest.call(this, {
              method: 'GET',
              endpoint: `/webhooks/${webhookData.webhookId}`,
            });
            return true;
          } catch {
            delete webhookData.webhookId;
            return false;
          }
        }

        // Check if webhook with this URL exists
        try {
          const response = await personaApiRequest.call(this, {
            method: 'GET',
            endpoint: '/webhooks',
          });

          const webhooks = (response.data as any[]) || [];
          const existingWebhook = webhooks.find(
            (w: any) => w.attributes?.url === webhookUrl
          );

          if (existingWebhook) {
            webhookData.webhookId = existingWebhook.id;
            return true;
          }
        } catch {
          // Webhook check failed
        }

        return false;
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl('default');
        const events = this.getNodeParameter('events') as string[];
        const webhookData = this.getWorkflowStaticData('node');

        const enabledEvents = events.includes('*') ? ALL_EVENT_TYPES : events.filter(e => !e.startsWith('separator_'));

        try {
          const response = await personaApiRequest.call(this, {
            method: 'POST',
            endpoint: '/webhooks',
            body: {
              data: {
                attributes: {
                  url: webhookUrl,
                  'enabled-events': enabledEvents,
                  enabled: true,
                },
              },
            },
          });

          const data = response.data as any;
          webhookData.webhookId = data.id;
          return true;
        } catch (error) {
          console.error('Failed to create Persona webhook:', error);
          return false;
        }
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');

        if (!webhookData.webhookId) {
          return true;
        }

        try {
          await personaApiRequest.call(this, {
            method: 'DELETE',
            endpoint: `/webhooks/${webhookData.webhookId}`,
          });
        } catch (error) {
          console.error('Failed to delete Persona webhook:', error);
          return false;
        }

        delete webhookData.webhookId;
        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const verifySignature = this.getNodeParameter('verifySignature') as boolean;
    const events = this.getNodeParameter('events') as string[];
    const req = this.getRequestObject();
    const body = this.getBodyData();

    // Verify signature if enabled
    if (verifySignature) {
      const verificationResult = await verifyWebhookRequest(this);
      if (!verificationResult.valid) {
        return {
          webhookResponse: { status: 401, body: { error: verificationResult.error } },
        };
      }
    }

    // Parse the webhook payload
    const payload = parseWebhookPayload(body);
    const eventType = getEventType(payload);

    // Filter events
    const configuredEvents = events.includes('*') ? [] : events.filter(e => !e.startsWith('separator_'));
    if (!shouldProcessEvent(eventType, configuredEvents)) {
      return {
        webhookResponse: { status: 200, body: { received: true, processed: false } },
      };
    }

    // Transform and return the data
    const outputData = transformWebhookPayload(payload, eventType);

    return {
      workflowData: [outputData],
      webhookResponse: { status: 200, body: { received: true, processed: true } },
    };
  }
}
