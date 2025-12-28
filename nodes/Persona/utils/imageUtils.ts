/**
 * Persona Image Utilities
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

import { IExecuteFunctions, IBinaryData } from 'n8n-workflow';

export interface ImageDownloadOptions {
  url: string;
  fileName?: string;
  mimeType?: string;
}

/**
 * Download an image from Persona and return as binary data
 */
export async function downloadImage(
  context: IExecuteFunctions,
  options: ImageDownloadOptions,
): Promise<IBinaryData> {
  const response = await context.helpers.httpRequestWithAuthentication.call(
    context,
    'personaApi',
    {
      method: 'GET',
      url: options.url,
      encoding: 'arraybuffer',
      returnFullResponse: true,
    },
  );

  const contentType =
    (response.headers['content-type'] as string) || options.mimeType || 'image/jpeg';
  const buffer = Buffer.from(response.body as ArrayBuffer);

  const fileName = options.fileName || `image_${Date.now()}.${getExtensionFromMimeType(contentType)}`;

  return context.helpers.prepareBinaryData(buffer, fileName, contentType);
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'application/pdf': 'pdf',
  };

  return mimeMap[mimeType.toLowerCase()] || 'bin';
}

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromExtension(extension: string): string {
  const extMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
  };

  return extMap[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * Convert base64 image to buffer
 */
export function base64ToBuffer(base64String: string): Buffer {
  // Remove data URL prefix if present
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

/**
 * Convert buffer to base64 string
 */
export function bufferToBase64(buffer: Buffer, mimeType = 'image/jpeg'): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

/**
 * Validate image size (in bytes)
 */
export function validateImageSize(
  sizeBytes: number,
  maxSizeMB = 10,
): { valid: boolean; message?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (sizeBytes > maxSizeBytes) {
    return {
      valid: false,
      message: `Image size (${(sizeBytes / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
    };
  }

  return { valid: true };
}

/**
 * Get image dimensions from a buffer (basic check for JPEG/PNG)
 */
export function getImageDimensions(
  buffer: Buffer,
): { width: number; height: number } | null {
  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) return null;
      const marker = buffer[offset + 1];
      if (marker === 0xc0 || marker === 0xc2) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }
      const length = buffer.readUInt16BE(offset + 2);
      offset += 2 + length;
    }
  }

  // PNG
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  return null;
}
