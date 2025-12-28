/**
 * Persona Webhook Handler
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

import { IDataObject, IWebhookFunctions, INodeExecutionData } from 'n8n-workflow';
import { verifyWebhookSignature } from '../utils/signatureUtils';

export interface PersonaWebhookPayload {
  data: {
    type: string;
    id: string;
    attributes: IDataObject;
    relationships?: IDataObject;
  };
  included?: IDataObject[];
}

export interface WebhookVerificationResult {
  valid: boolean;
  error?: string;
}

/**
 * Verify incoming webhook request from Persona
 */
export async function verifyWebhookRequest(
  webhookFunctions: IWebhookFunctions,
): Promise<WebhookVerificationResult> {
  const credentials = await webhookFunctions.getCredentials('personaApi');
  const webhookSecret = credentials.webhookSecret as string;

  if (!webhookSecret) {
    // If no webhook secret is configured, skip verification
    return { valid: true };
  }

  const req = webhookFunctions.getRequestObject();
  const signatureHeader = req.headers['persona-signature'] as string;

  if (!signatureHeader) {
    return {
      valid: false,
      error: 'Missing Persona-Signature header',
    };
  }

  const rawBody = req.body;
  const bodyString = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);

  const isValid = verifyWebhookSignature(signatureHeader, bodyString, webhookSecret);

  if (!isValid) {
    return {
      valid: false,
      error: 'Invalid webhook signature',
    };
  }

  return { valid: true };
}

/**
 * Parse webhook payload from Persona
 */
export function parseWebhookPayload(body: IDataObject): PersonaWebhookPayload {
  return {
    data: body.data as PersonaWebhookPayload['data'],
    included: body.included as IDataObject[] | undefined,
  };
}

/**
 * Extract event type from webhook payload
 */
export function getEventType(payload: PersonaWebhookPayload): string {
  return payload.data.type || 'unknown';
}

/**
 * Get resource ID from webhook payload
 */
export function getResourceId(payload: PersonaWebhookPayload): string {
  return payload.data.id;
}

/**
 * Get resource attributes from webhook payload
 */
export function getResourceAttributes(payload: PersonaWebhookPayload): IDataObject {
  return payload.data.attributes || {};
}

/**
 * Transform webhook payload to n8n execution data
 */
export function transformWebhookPayload(
  payload: PersonaWebhookPayload,
  eventType: string,
): INodeExecutionData[] {
  const attributes = getResourceAttributes(payload);
  const resourceId = getResourceId(payload);

  return [
    {
      json: {
        eventType,
        resourceId,
        resourceType: payload.data.type,
        attributes,
        relationships: payload.data.relationships || {},
        included: payload.included || [],
        receivedAt: new Date().toISOString(),
      },
    },
  ];
}

/**
 * Filter webhook events based on configured event types
 */
export function shouldProcessEvent(
  eventType: string,
  configuredEvents: string[],
): boolean {
  if (configuredEvents.length === 0 || configuredEvents.includes('*')) {
    return true;
  }

  return configuredEvents.includes(eventType);
}

/**
 * Extract related resources from included array
 */
export function extractRelatedResources(
  included: IDataObject[] | undefined,
  resourceType: string,
): IDataObject[] {
  if (!included || !Array.isArray(included)) {
    return [];
  }

  return included.filter((item) => item.type === resourceType);
}

/**
 * Get inquiry from webhook payload if present
 */
export function getRelatedInquiry(payload: PersonaWebhookPayload): IDataObject | null {
  const relationships = payload.data.relationships as IDataObject;
  if (!relationships?.inquiry) {
    return null;
  }

  const inquiryRef = relationships.inquiry as IDataObject;
  const inquiryData = inquiryRef.data as IDataObject;

  if (!inquiryData?.id) {
    return null;
  }

  // Look for inquiry in included
  const inquiry = extractRelatedResources(payload.included, 'inquiry').find(
    (i) => i.id === inquiryData.id,
  );

  return inquiry || { id: inquiryData.id };
}

/**
 * Get account from webhook payload if present
 */
export function getRelatedAccount(payload: PersonaWebhookPayload): IDataObject | null {
  const relationships = payload.data.relationships as IDataObject;
  if (!relationships?.account) {
    return null;
  }

  const accountRef = relationships.account as IDataObject;
  const accountData = accountRef.data as IDataObject;

  if (!accountData?.id) {
    return null;
  }

  const account = extractRelatedResources(payload.included, 'account').find(
    (a) => a.id === accountData.id,
  );

  return account || { id: accountData.id };
}
