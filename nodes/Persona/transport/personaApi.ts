/**
 * Persona API Transport Layer
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
  ILoadOptionsFunctions,
  IHookFunctions,
  IDataObject,
  NodeApiError,
  IHttpRequestMethods,
} from 'n8n-workflow';
import { PERSONA_API_ENDPOINTS } from '../constants/endpoints';

export interface PersonaApiRequestOptions {
  method: IHttpRequestMethods;
  endpoint: string;
  body?: IDataObject;
  qs?: IDataObject;
  headers?: IDataObject;
  returnFullResponse?: boolean;
  encoding?: string;
}

export interface PersonaApiResponse<T = IDataObject> {
  data: T;
  included?: IDataObject[];
  links?: {
    prev?: string;
    next?: string;
  };
  meta?: IDataObject;
}

/**
 * Get the base URL for the Persona API based on credentials
 */
export function getBaseUrl(credentials: IDataObject): string {
  const environment = credentials.environment as string;

  if (environment === 'custom' && credentials.customApiUrl) {
    return credentials.customApiUrl as string;
  }

  return PERSONA_API_ENDPOINTS.PRODUCTION;
}

/**
 * Make an authenticated request to the Persona API
 */
export async function personaApiRequest<T = IDataObject>(
  this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
  options: PersonaApiRequestOptions,
): Promise<T> {
  const credentials = await this.getCredentials('personaApi');
  const baseUrl = getBaseUrl(credentials);

  const requestOptions: IDataObject = {
    method: options.method,
    url: `${baseUrl}${options.endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      'Persona-Version': credentials.apiVersion || '2023-01-05',
      ...options.headers,
    },
    json: true,
  };

  if (options.returnFullResponse) {
    requestOptions.returnFullResponse = true;
  }

  if (options.encoding) {
    requestOptions.encoding = options.encoding;
  }

  if (options.body && Object.keys(options.body).length > 0) {
    requestOptions.body = options.body;
  }

  if (options.qs && Object.keys(options.qs).length > 0) {
    requestOptions.qs = options.qs;
  }

  try {
    const response = await this.helpers.httpRequestWithAuthentication.call(
      this,
      'personaApi',
      requestOptions as any,
    );

    return response as T;
  } catch (error: any) {
    throw new NodeApiError(this.getNode(), error, {
      message: error.message,
      description: error.description || 'An error occurred while making the Persona API request',
    });
  }
}

/**
 * Make a paginated request and return all results
 */
export async function personaApiRequestAllItems<T = IDataObject>(
  this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
  endpoint: string,
  qs: IDataObject = {},
  maxResults?: number,
): Promise<T[]> {
  const allItems: T[] = [];
  let cursor: string | undefined;
  const pageSize = 100;

  do {
    const queryParams: IDataObject = {
      ...qs,
      'page[size]': pageSize,
    };

    if (cursor) {
      queryParams['page[after]'] = cursor;
    }

    const response = await personaApiRequest.call(this, {
      method: 'GET',
      endpoint,
      qs: queryParams,
    }) as PersonaApiResponse<T[]>;

    if (Array.isArray(response.data)) {
      allItems.push(...response.data);
    } else if (response.data) {
      allItems.push(response.data as T);
    }

    if (maxResults && allItems.length >= maxResults) {
      return allItems.slice(0, maxResults);
    }

    cursor = undefined;
    if (response.links?.next) {
      try {
        const url = new URL(response.links.next, 'https://withpersona.com');
        cursor = url.searchParams.get('page[after]') || undefined;
      } catch {
        cursor = undefined;
      }
    }
  } while (cursor);

  return allItems;
}

/**
 * Download a file from Persona (for documents, selfies, etc.)
 */
export async function personaApiDownload(
  this: IExecuteFunctions,
  endpoint: string,
): Promise<{ data: Buffer; contentType: string }> {
  const credentials = await this.getCredentials('personaApi');
  const baseUrl = getBaseUrl(credentials);

  const response = await this.helpers.httpRequestWithAuthentication.call(
    this,
    'personaApi',
    {
      method: 'GET',
      url: `${baseUrl}${endpoint}`,
      headers: {
        'Persona-Version': credentials.apiVersion || '2023-01-05',
      },
      encoding: 'arraybuffer',
      returnFullResponse: true,
    },
  ) as any;

  return {
    data: Buffer.from(response.body),
    contentType: response.headers['content-type'] || 'application/octet-stream',
  };
}

/**
 * Upload a file to Persona
 */
export async function personaApiUpload(
  this: IExecuteFunctions,
  endpoint: string,
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  additionalFields: IDataObject = {},
): Promise<IDataObject> {
  const credentials = await this.getCredentials('personaApi');
  const baseUrl = getBaseUrl(credentials);

  const formData: IDataObject = {
    file: {
      value: fileBuffer,
      options: {
        filename: fileName,
        contentType: mimeType,
      },
    },
    ...additionalFields,
  };

  const response = await this.helpers.httpRequestWithAuthentication.call(
    this,
    'personaApi',
    {
      method: 'POST',
      url: `${baseUrl}${endpoint}`,
      headers: {
        'Persona-Version': credentials.apiVersion || '2023-01-05',
      },
      formData,
    },
  );

  return response as IDataObject;
}
