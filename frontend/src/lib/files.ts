import { getContentType } from './mimeTypes';

export function sanitizeFilename(fileName: string): string {
  return fileName.trim().replace(/\s+/g, '_').replace(/\.+$/, '').toLowerCase();
}

function createBlobUrl(data: BlobPart, type: string) {
  const blob = new Blob([data], { type });
  return URL.createObjectURL(blob);
}

export function openFile(data: BlobPart, fileExtension: string) {
  const mime = getContentType(fileExtension);
  const url = createBlobUrl(data, mime);

  window.open(url, '_blank');
}

export function downloadFile(
  data: BlobPart,
  filename: string,
  fileExtension: string
) {
  const mime = getContentType(fileExtension);
  const url = createBlobUrl(data, mime);

  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.download = `${sanitizeFilename(filename)}.${fileExtension}`;

  document.body.append(link);
  link.click();
  link.remove();

  // Damos un margen para que la descarga inicie
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
