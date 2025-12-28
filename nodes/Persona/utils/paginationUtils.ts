/**
 * Persona Pagination Utilities
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

import { IExecuteFunctions, ILoadOptionsFunctions, IHookFunctions } from 'n8n-workflow';

export interface PaginationParams {
  pageSize?: number;
  pageAfter?: string;
  pageBefore?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  links?: {
    prev?: string;
    next?: string;
  };
  meta?: {
    total?: number;
    page?: number;
  };
}

/**
 * Build query string parameters for pagination
 */
export function buildPaginationParams(params: PaginationParams): Record<string, string | number> {
  const qs: Record<string, string | number> = {};

  if (params.pageSize) {
    qs['page[size]'] = params.pageSize;
  }
  if (params.pageAfter) {
    qs['page[after]'] = params.pageAfter;
  }
  if (params.pageBefore) {
    qs['page[before]'] = params.pageBefore;
  }

  return qs;
}

/**
 * Extract cursor from a pagination link URL
 */
export function extractCursorFromLink(link: string): string | null {
  try {
    const url = new URL(link, 'https://withpersona.com');
    return url.searchParams.get('page[after]') || url.searchParams.get('page[before]');
  } catch {
    return null;
  }
}

/**
 * Paginate through all results
 */
export async function paginateAll<T>(
  context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
  endpoint: string,
  pageSize = 100,
  maxResults?: number,
): Promise<T[]> {
  const allResults: T[] = [];
  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const qs = buildPaginationParams({ pageSize, pageAfter: cursor });

    const response = (await (context as IExecuteFunctions).helpers.httpRequestWithAuthentication.call(
      context,
      'personaApi',
      {
        method: 'GET',
        url: endpoint,
        qs,
        json: true,
      },
    )) as PaginatedResponse<T>;

    allResults.push(...response.data);

    if (maxResults && allResults.length >= maxResults) {
      return allResults.slice(0, maxResults);
    }

    if (response.links?.next) {
      cursor = extractCursorFromLink(response.links.next) || undefined;
      hasMore = !!cursor;
    } else {
      hasMore = false;
    }
  }

  return allResults;
}

/**
 * Create pagination display options for n8n
 */
export function getPaginationDescription() {
  return [
    {
      displayName: 'Return All',
      name: 'returnAll',
      type: 'boolean' as const,
      default: false,
      description: 'Whether to return all results or only up to a given limit',
    },
    {
      displayName: 'Limit',
      name: 'limit',
      type: 'number' as const,
      default: 50,
      description: 'Max number of results to return',
      typeOptions: {
        minValue: 1,
        maxValue: 500,
      },
      displayOptions: {
        show: {
          returnAll: [false],
        },
      },
    },
  ];
}
