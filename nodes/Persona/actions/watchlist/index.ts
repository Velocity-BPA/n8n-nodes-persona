/**
 * Persona Watchlist Actions
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

export const watchlistOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['watchlist'] } },
    options: [
      { name: 'Clear Hit', value: 'clearHit', description: 'Clear a watchlist hit', action: 'Clear watchlist hit' },
      { name: 'Get Hit', value: 'getHit', description: 'Get a watchlist hit', action: 'Get watchlist hit' },
      { name: 'Get Hit Status', value: 'getHitStatus', description: 'Get hit status', action: 'Get hit status' },
      { name: 'Get Match Details', value: 'getMatchDetails', description: 'Get match details', action: 'Get match details' },
      { name: 'Get Matched Names', value: 'getMatchedNames', description: 'Get matched names', action: 'Get matched names' },
      { name: 'Get Ongoing Monitoring', value: 'getOngoingMonitoring', description: 'Get ongoing monitoring status', action: 'Get ongoing monitoring' },
      { name: 'Get Sources', value: 'getSources', description: 'Get watchlist sources', action: 'Get watchlist sources' },
      { name: 'List Hits', value: 'listHits', description: 'List all watchlist hits', action: 'List watchlist hits' },
      { name: 'Mark False Positive', value: 'markFalsePositive', description: 'Mark as false positive', action: 'Mark as false positive' },
      { name: 'Mark True Match', value: 'markTrueMatch', description: 'Mark as true match', action: 'Mark as true match' },
      { name: 'Screen', value: 'screen', description: 'Screen against watchlist', action: 'Screen against watchlist' },
      { name: 'Update Hit Status', value: 'updateHitStatus', description: 'Update hit status', action: 'Update hit status' },
    ],
    default: 'screen',
  },
];

export const watchlistFields: INodeProperties[] = [
  {
    displayName: 'Hit ID',
    name: 'hitId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'wlh_...',
    displayOptions: {
      show: {
        resource: ['watchlist'],
        operation: ['getHit', 'clearHit', 'markTrueMatch', 'markFalsePositive', 'getHitStatus', 'updateHitStatus', 'getMatchDetails', 'getMatchedNames'],
      },
    },
  },
  {
    displayName: 'Name First',
    name: 'nameFirst',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['watchlist'], operation: ['screen'] } },
  },
  {
    displayName: 'Name Last',
    name: 'nameLast',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['watchlist'], operation: ['screen'] } },
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: { show: { resource: ['watchlist'], operation: ['screen'] } },
    options: [
      { displayName: 'Birthdate', name: 'birthdate', type: 'string', default: '', description: 'Date of birth (YYYY-MM-DD)' },
      { displayName: 'Country Code', name: 'countryCode', type: 'string', default: '', description: 'Country code (ISO 3166-1 alpha-2)' },
      { displayName: 'Name Middle', name: 'nameMiddle', type: 'string', default: '' },
      { displayName: 'Reference ID', name: 'referenceId', type: 'string', default: '' },
    ],
  },
  {
    displayName: 'New Status',
    name: 'newStatus',
    type: 'options',
    options: [
      { name: 'Pending', value: 'pending' },
      { name: 'Confirmed', value: 'confirmed' },
      { name: 'False Positive', value: 'false_positive' },
      { name: 'Cleared', value: 'cleared' },
    ],
    default: 'pending',
    displayOptions: { show: { resource: ['watchlist'], operation: ['updateHitStatus'] } },
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: { show: { resource: ['watchlist'], operation: ['listHits'] } },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    typeOptions: { minValue: 1, maxValue: 500 },
    displayOptions: { show: { resource: ['watchlist'], operation: ['listHits'], returnAll: [false] } },
  },
];

export async function executeWatchlistOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject> {
  let responseData: IDataObject = {};

  switch (operation) {
    case 'screen': {
      const nameFirst = this.getNodeParameter('nameFirst', i) as string;
      const nameLast = this.getNodeParameter('nameLast', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const attributes: IDataObject = { 'name-first': nameFirst, 'name-last': nameLast };
      if (additionalFields.nameMiddle) attributes['name-middle'] = additionalFields.nameMiddle;
      if (additionalFields.birthdate) attributes['birthdate'] = additionalFields.birthdate;
      if (additionalFields.countryCode) attributes['country-code'] = additionalFields.countryCode;
      if (additionalFields.referenceId) attributes['reference-id'] = additionalFields.referenceId;

      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: ENDPOINTS.WATCHLIST_SCREEN,
        body: { data: { attributes } },
      });
      break;
    }

    case 'getHit': {
      const hitId = this.getNodeParameter('hitId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.WATCHLIST_HIT_BY_ID(hitId),
      });
      break;
    }

    case 'listHits': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      if (returnAll) {
        const items = await personaApiRequestAllItems.call(this, ENDPOINTS.WATCHLIST_HITS, {});
        responseData = { data: items };
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await personaApiRequest.call(this, {
          method: 'GET',
          endpoint: ENDPOINTS.WATCHLIST_HITS,
          qs: { 'page[size]': limit },
        });
      }
      break;
    }

    case 'clearHit': {
      const hitId = this.getNodeParameter('hitId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: `${ENDPOINTS.WATCHLIST_HIT_BY_ID(hitId)}/clear`,
      });
      break;
    }

    case 'markTrueMatch': {
      const hitId = this.getNodeParameter('hitId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: `${ENDPOINTS.WATCHLIST_HIT_BY_ID(hitId)}/confirm`,
      });
      break;
    }

    case 'markFalsePositive': {
      const hitId = this.getNodeParameter('hitId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'POST',
        endpoint: `${ENDPOINTS.WATCHLIST_HIT_BY_ID(hitId)}/dismiss`,
      });
      break;
    }

    case 'getHitStatus':
    case 'getMatchDetails':
    case 'getMatchedNames': {
      const hitId = this.getNodeParameter('hitId', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: ENDPOINTS.WATCHLIST_HIT_BY_ID(hitId),
      });
      break;
    }

    case 'updateHitStatus': {
      const hitId = this.getNodeParameter('hitId', i) as string;
      const newStatus = this.getNodeParameter('newStatus', i) as string;
      responseData = await personaApiRequest.call(this, {
        method: 'PATCH',
        endpoint: ENDPOINTS.WATCHLIST_HIT_BY_ID(hitId),
        body: { data: { attributes: { status: newStatus } } },
      });
      break;
    }

    case 'getSources': {
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: '/watchlist/sources',
      });
      break;
    }

    case 'getOngoingMonitoring': {
      responseData = await personaApiRequest.call(this, {
        method: 'GET',
        endpoint: '/watchlist/ongoing-monitoring',
      });
      break;
    }
  }

  return responseData;
}
