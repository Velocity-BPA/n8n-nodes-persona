/**
 * Persona Node
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
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
} from 'n8n-workflow';

import { inquiryOperations, inquiryFields, executeInquiryOperation } from './actions/inquiry';
import { verificationOperations, verificationFields, executeVerificationOperation } from './actions/verification';
import { accountOperations, accountFields, executeAccountOperation } from './actions/account';
import { documentOperations, documentFields, executeDocumentOperation } from './actions/document';
import { selfieOperations, selfieFields, executeSelfieOperation } from './actions/selfie';
import { governmentIdOperations, governmentIdFields, executeGovernmentIdOperation } from './actions/governmentId';
import { databaseVerificationOperations, databaseVerificationFields, executeDatabaseVerificationOperation } from './actions/databaseVerification';
import { reportOperations, reportFields, executeReportOperation } from './actions/report';
import { watchlistOperations, watchlistFields, executeWatchlistOperation } from './actions/watchlist';
import { transactionOperations, transactionFields, executeTransactionOperation } from './actions/transaction';
import { caseOperations, caseFields, executeCaseOperation } from './actions/case';
import { templateOperations, templateFields, executeTemplateOperation } from './actions/template';
import { workflowOperations, workflowFields, executeWorkflowOperation } from './actions/workflow';
import { eventOperations, eventFields, executeEventOperation } from './actions/event';
import { webhookResourceOperations, webhookResourceFields, executeWebhookResourceOperation } from './actions/webhook';
import { listOperations, listFields, executeListOperation } from './actions/list';
import { apiLogOperations, apiLogFields, executeApiLogOperation } from './actions/apiLog';
import { sessionOperations, sessionFields, executeSessionOperation } from './actions/session';
import { embeddedFlowOperations, embeddedFlowFields, executeEmbeddedFlowOperation } from './actions/embeddedFlow';
import { analyticsOperations, analyticsFields, executeAnalyticsOperation } from './actions/analytics';
import { complianceOperations, complianceFields, executeComplianceOperation } from './actions/compliance';
import { utilityOperations, utilityFields, executeUtilityOperation } from './actions/utility';

let hasLoggedLicenseNotice = false;

export class Persona implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Persona',
    name: 'persona',
    icon: 'file:persona.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with Persona identity verification platform',
    defaults: { name: 'Persona' },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [{ name: 'personaApi', required: true }],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Account', value: 'account' },
          { name: 'Analytics', value: 'analytics' },
          { name: 'API Log', value: 'apiLog' },
          { name: 'Case', value: 'case' },
          { name: 'Compliance', value: 'compliance' },
          { name: 'Database Verification', value: 'databaseVerification' },
          { name: 'Document', value: 'document' },
          { name: 'Embedded Flow', value: 'embeddedFlow' },
          { name: 'Event', value: 'event' },
          { name: 'Government ID', value: 'governmentId' },
          { name: 'Inquiry', value: 'inquiry' },
          { name: 'List', value: 'list' },
          { name: 'Report', value: 'report' },
          { name: 'Selfie', value: 'selfie' },
          { name: 'Session', value: 'session' },
          { name: 'Template', value: 'template' },
          { name: 'Transaction', value: 'transaction' },
          { name: 'Utility', value: 'utility' },
          { name: 'Verification', value: 'verification' },
          { name: 'Watchlist', value: 'watchlist' },
          { name: 'Webhook', value: 'webhookResource' },
          { name: 'Workflow', value: 'workflow' },
        ],
        default: 'inquiry',
      },
      ...inquiryOperations, ...inquiryFields,
      ...verificationOperations, ...verificationFields,
      ...accountOperations, ...accountFields,
      ...documentOperations, ...documentFields,
      ...selfieOperations, ...selfieFields,
      ...governmentIdOperations, ...governmentIdFields,
      ...databaseVerificationOperations, ...databaseVerificationFields,
      ...reportOperations, ...reportFields,
      ...watchlistOperations, ...watchlistFields,
      ...transactionOperations, ...transactionFields,
      ...caseOperations, ...caseFields,
      ...templateOperations, ...templateFields,
      ...workflowOperations, ...workflowFields,
      ...eventOperations, ...eventFields,
      ...webhookResourceOperations, ...webhookResourceFields,
      ...listOperations, ...listFields,
      ...apiLogOperations, ...apiLogFields,
      ...sessionOperations, ...sessionFields,
      ...embeddedFlowOperations, ...embeddedFlowFields,
      ...analyticsOperations, ...analyticsFields,
      ...complianceOperations, ...complianceFields,
      ...utilityOperations, ...utilityFields,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    if (!hasLoggedLicenseNotice) {
      console.warn('[Velocity BPA] n8n-nodes-persona is licensed under BSL 1.1. Commercial use requires a license from https://velobpa.com/licensing');
      hasLoggedLicenseNotice = true;
    }

    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData;

        switch (resource) {
          case 'inquiry':
            responseData = await executeInquiryOperation.call(this, operation, i);
            break;
          case 'verification':
            responseData = await executeVerificationOperation.call(this, operation, i);
            break;
          case 'account':
            responseData = await executeAccountOperation.call(this, operation, i);
            break;
          case 'document':
            responseData = await executeDocumentOperation.call(this, operation, i);
            break;
          case 'selfie':
            responseData = await executeSelfieOperation.call(this, operation, i);
            break;
          case 'governmentId':
            responseData = await executeGovernmentIdOperation.call(this, operation, i);
            break;
          case 'databaseVerification':
            responseData = await executeDatabaseVerificationOperation.call(this, operation, i);
            break;
          case 'report':
            responseData = await executeReportOperation.call(this, operation, i);
            break;
          case 'watchlist':
            responseData = await executeWatchlistOperation.call(this, operation, i);
            break;
          case 'transaction':
            responseData = await executeTransactionOperation.call(this, operation, i);
            break;
          case 'case':
            responseData = await executeCaseOperation.call(this, operation, i);
            break;
          case 'template':
            responseData = await executeTemplateOperation.call(this, operation, i);
            break;
          case 'workflow':
            responseData = await executeWorkflowOperation.call(this, operation, i);
            break;
          case 'event':
            responseData = await executeEventOperation.call(this, operation, i);
            break;
          case 'webhookResource':
            responseData = await executeWebhookResourceOperation.call(this, operation, i);
            break;
          case 'list':
            responseData = await executeListOperation.call(this, operation, i);
            break;
          case 'apiLog':
            responseData = await executeApiLogOperation.call(this, operation, i);
            break;
          case 'session':
            responseData = await executeSessionOperation.call(this, operation, i);
            break;
          case 'embeddedFlow':
            responseData = await executeEmbeddedFlowOperation.call(this, operation, i);
            break;
          case 'analytics':
            responseData = await executeAnalyticsOperation.call(this, operation, i);
            break;
          case 'compliance':
            responseData = await executeComplianceOperation.call(this, operation, i);
            break;
          case 'utility':
            responseData = await executeUtilityOperation.call(this, operation, i);
            break;
          default:
            throw new Error(`Unknown resource: ${resource}`);
        }

        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(responseData),
          { itemData: { item: i } },
        );
        returnData.push(...executionData);
      } catch (error: any) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
