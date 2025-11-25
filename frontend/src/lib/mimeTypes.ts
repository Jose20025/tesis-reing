export const MIME_TYPES: Readonly<Record<string, string>> = {
  // Images
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',

  // Documents
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

  // Text
  txt: 'text/plain',
  csv: 'text/csv',
  html: 'text/html',
  css: 'text/css',
  js: 'text/javascript',

  // Other
  zip: 'application/zip',
  rar: 'application/x-rar-compressed',
  json: 'application/json',
  xml: 'application/xml',
};

export function getContentType(ext: string): string {
  const key = ext.trim().toLowerCase().replace(/^\./, '');
  return MIME_TYPES[key] ?? 'application/octet-stream';
}
