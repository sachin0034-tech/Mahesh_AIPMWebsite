import { BlobServiceClient } from '@azure/storage-blob';

function getClient(): BlobServiceClient {
  const cs = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!cs) throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');
  return BlobServiceClient.fromConnectionString(cs);
}

export async function uploadBlob(
  container: string,
  blobName: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const containerClient = getClient().getContainerClient(container);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.upload(buffer, buffer.length, {
    blobHTTPHeaders: { blobContentType: contentType },
  });
  return blockBlobClient.url;
}

export async function deleteBlob(container: string, blobName: string): Promise<void> {
  const containerClient = getClient().getContainerClient(container);
  await containerClient.getBlockBlobClient(blobName).deleteIfExists();
}
