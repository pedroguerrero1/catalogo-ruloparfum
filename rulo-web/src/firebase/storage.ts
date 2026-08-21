import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './config';

const urlCache = new Map<string, string>();

// Inline placeholder so the catalog never depends on a missing static asset.
const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#f3f3f3"/>
      <path d="M85 40h30v18l10 12v10H75V70l10-12V40z" fill="#c8922e" opacity="0.35"/>
      <rect x="70" y="80" width="60" height="80" rx="8" fill="#c8922e" opacity="0.25"/>
    </svg>`,
  );

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

export async function getImageUrl(path?: string | null): Promise<string> {
  if (!path) return PLACEHOLDER;
  if (path.startsWith('http')) return path;

  const cached = urlCache.get(path);
  if (cached) return cached;

  try {
    const url = await withTimeout(getDownloadURL(ref(storage, path)), 4000);
    urlCache.set(path, url);
    return url;
  } catch {
    return path.startsWith('/') ? path : `/${path}`;
  }
}

export async function uploadProductImage(
  collectionName: string,
  file: File,
): Promise<string> {
  const ext = file.name.split('.').pop() || 'webp';
  const key = `img/${collectionName}/${Date.now()}.${ext}`;
  const storageRef = ref(storage, key);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  urlCache.set(key, url);
  return url;
}
