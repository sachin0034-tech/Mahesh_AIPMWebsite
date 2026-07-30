import { BlobServiceClient } from '@azure/storage-blob';

const KNOWN_CONTAINERS = ['project-thumbnails', 'project-assets'];

function getClient(): BlobServiceClient {
  const cs = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!cs) throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');
  return BlobServiceClient.fromConnectionString(cs);
}

// Track which containers have been verified as publicly readable this process lifetime
const publicContainers = new Set<string>();

async function ensurePublic(container: string): Promise<void> {
  if (publicContainers.has(container)) return;
  const containerClient = getClient().getContainerClient(container);
  await containerClient.createIfNotExists();
  await containerClient.setAccessPolicy('blob'); // anonymous read for blobs
  publicContainers.add(container);
}

// Call at server startup to make all existing blobs publicly accessible
export async function initStorage(): Promise<void> {
  await Promise.all(KNOWN_CONTAINERS.map((c) => ensurePublic(c).catch((err) => {
    console.warn(`[azureStorage] Could not set public access on "${c}":`, err?.message ?? err);
  })));
}

export async function uploadBlob(
  container: string,
  blobName: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  await ensurePublic(container);
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
