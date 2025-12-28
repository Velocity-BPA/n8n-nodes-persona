/**
 * Persona Image Handler
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

import { IExecuteFunctions, IBinaryData, IDataObject } from 'n8n-workflow';
import { personaApiDownload } from './personaApi';
import { ENDPOINTS } from '../constants/endpoints';

export interface DownloadedImage {
  binaryData: IBinaryData;
  fileName: string;
  mimeType: string;
}

/**
 * Download document image (front or back)
 */
export async function downloadDocumentImage(
  context: IExecuteFunctions,
  documentId: string,
  side: 'front' | 'back',
): Promise<DownloadedImage> {
  const endpoint = ENDPOINTS.DOCUMENT_DOWNLOAD(documentId, side);
  const { data, contentType } = await personaApiDownload.call(context, endpoint);

  const extension = contentType.includes('png') ? 'png' : 'jpg';
  const fileName = `document_${documentId}_${side}.${extension}`;

  const binaryData = await context.helpers.prepareBinaryData(data, fileName, contentType);

  return {
    binaryData,
    fileName,
    mimeType: contentType,
  };
}

/**
 * Download government ID image
 */
export async function downloadGovernmentIdImage(
  context: IExecuteFunctions,
  govIdId: string,
  side: 'front' | 'back',
): Promise<DownloadedImage> {
  const endpoint =
    side === 'front'
      ? ENDPOINTS.GOVERNMENT_ID_FRONT(govIdId)
      : ENDPOINTS.GOVERNMENT_ID_BACK(govIdId);

  const { data, contentType } = await personaApiDownload.call(context, endpoint);

  const extension = contentType.includes('png') ? 'png' : 'jpg';
  const fileName = `government_id_${govIdId}_${side}.${extension}`;

  const binaryData = await context.helpers.prepareBinaryData(data, fileName, contentType);

  return {
    binaryData,
    fileName,
    mimeType: contentType,
  };
}

/**
 * Download selfie image
 */
export async function downloadSelfieImage(
  context: IExecuteFunctions,
  selfieId: string,
  pose: 'center' | 'left' | 'right' = 'center',
): Promise<DownloadedImage> {
  const endpoint = ENDPOINTS.SELFIE_DOWNLOAD(selfieId, pose);
  const { data, contentType } = await personaApiDownload.call(context, endpoint);

  const extension = contentType.includes('png') ? 'png' : 'jpg';
  const fileName = `selfie_${selfieId}_${pose}.${extension}`;

  const binaryData = await context.helpers.prepareBinaryData(data, fileName, contentType);

  return {
    binaryData,
    fileName,
    mimeType: contentType,
  };
}

/**
 * Download report PDF
 */
export async function downloadReportPdf(
  context: IExecuteFunctions,
  reportId: string,
): Promise<DownloadedImage> {
  const endpoint = `${ENDPOINTS.REPORT_BY_ID(reportId)}/pdf`;
  const { data, contentType } = await personaApiDownload.call(context, endpoint);

  const fileName = `report_${reportId}.pdf`;

  const binaryData = await context.helpers.prepareBinaryData(data, fileName, 'application/pdf');

  return {
    binaryData,
    fileName,
    mimeType: contentType,
  };
}

/**
 * Prepare image output for n8n
 */
export function prepareImageOutput(
  downloadedImage: DownloadedImage,
  additionalData: IDataObject = {},
): IDataObject {
  return {
    ...additionalData,
    fileName: downloadedImage.fileName,
    mimeType: downloadedImage.mimeType,
    binary: {
      data: downloadedImage.binaryData,
    },
  };
}

/**
 * Get all selfie poses for an inquiry
 */
export async function downloadAllSelfiePoses(
  context: IExecuteFunctions,
  selfieId: string,
): Promise<{ center?: DownloadedImage; left?: DownloadedImage; right?: DownloadedImage }> {
  const poses: { center?: DownloadedImage; left?: DownloadedImage; right?: DownloadedImage } = {};

  try {
    poses.center = await downloadSelfieImage(context, selfieId, 'center');
  } catch {
    // Center pose might not exist
  }

  try {
    poses.left = await downloadSelfieImage(context, selfieId, 'left');
  } catch {
    // Left pose might not exist
  }

  try {
    poses.right = await downloadSelfieImage(context, selfieId, 'right');
  } catch {
    // Right pose might not exist
  }

  return poses;
}

/**
 * Get both sides of a document
 */
export async function downloadBothDocumentSides(
  context: IExecuteFunctions,
  documentId: string,
): Promise<{ front?: DownloadedImage; back?: DownloadedImage }> {
  const sides: { front?: DownloadedImage; back?: DownloadedImage } = {};

  try {
    sides.front = await downloadDocumentImage(context, documentId, 'front');
  } catch {
    // Front might not exist
  }

  try {
    sides.back = await downloadDocumentImage(context, documentId, 'back');
  } catch {
    // Back might not exist
  }

  return sides;
}
