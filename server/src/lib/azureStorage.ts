import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
} from '@azure/storage-blob';

// Fixed expiry so the same blob always produces the same SAS URL (enables browser caching)
const SAS_EXPIRY = new Date('2076-01-01T00:00:00Z');

function getClient(): BlobServiceClient {
  const cs = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!cs) throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');
  return BlobServiceClient.fromConnectionString(cs);
}

function parseConnectionString(): { accountName: string; accountKey: string } {
  const cs = process.env.AZURE_STORAGE_CONNECTION_STRING ?? '';
  const accountName = cs.match(/AccountName=([^;]+)/)?.[1];
  const accountKey  = cs.match(/AccountKey=([^;]+)/)?.[1];
  if (!accountName || !accountKey) throw new Error('Cannot parse AccountName/AccountKey from connection string');
  return { accountName, accountKey };
}

function buildSasUrl(accountName: string, accountKey: string, container: string, blobName: string): string {
  const credential = new StorageSharedKeyCredential(accountName, accountKey);
  const token = generateBlobSASQueryParameters(
    {
      containerName: container,
      blobName,
      permissions: BlobSASPermissions.parse('r'),
      expiresOn: SAS_EXPIRY,
      protocol: SASProtocol.Https,
    },
    credential,
  ).toString();
  return `https://${accountName}.blob.core.windows.net/${container}/${blobName}?${token}`;
}

const PLAIN_BLOB_RE = /^https:\/\/[^/]+\.blob\.core\.windows\.net\/([^/?#]+)\/([^?#]+)/;

// Adds a read SAS token to any plain Azure blob URL.
// Returns the URL unchanged if it already has query params (e.g. already a SAS URL)
// or if the connection string can't be parsed.
export function addSasToUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.includes('?')) return url;
  const m = url.match(PLAIN_BLOB_RE);
  if (!m) return url;
  const [, container, blobName] = m;
  try {
    const { accountName, accountKey } = parseConnectionString();
    return buildSasUrl(accountName, accountKey, container, blobName);
  } catch {
    return url;
  }
}

export async function uploadBlob(
  container: string,
  blobName: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const containerClient = getClient().getContainerClient(container);
  await containerClient.createIfNotExists();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.upload(buffer, buffer.length, {
    blobHTTPHeaders: { blobContentType: contentType },
  });
  const { accountName, accountKey } = parseConnectionString();
  return buildSasUrl(accountName, accountKey, container, blobName);
}

export async function deleteBlob(container: string, blobName: string): Promise<void> {
  const containerClient = getClient().getContainerClient(container);
  await containerClient.getBlockBlobClient(blobName).deleteIfExists();
}