const DB_NAME = 'rang_e_rosh_media_db_v1';
const STORE_NAME = 'media_blobs';

const objectUrlCache = new Map<string, string>();

function openMediaDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not available'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Failed to open IndexedDB'));
  });
}

/**
 * Stores any video or image File/Blob (of any length or file size) in IndexedDB
 * so it never exceeds localStorage's 5MB limit.
 */
export async function saveFileToMediaStore(file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const key = `idb://media/${Date.now()}-${Math.round(Math.random() * 1e6)}-${safeName}`;

  try {
    const db = await openMediaDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const putReq = store.put(file, key);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    });
    const blobUrl = URL.createObjectURL(file);
    objectUrlCache.set(key, blobUrl);
    return key;
  } catch {
    // Fallback to Data URL if IndexedDB is blocked in private mode
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Resolves an `idb://media/...` key into a playable browser `blob:` URL,
 * or returns standard URLs (`/uploads/...`, `https://...`, `data:...`) as-is.
 */
export async function resolveMediaUrl(url: string | null | undefined): Promise<string> {
  if (!url) return '';
  if (!url.startsWith('idb://media/')) {
    return url;
  }

  const cached = objectUrlCache.get(url);
  if (cached) return cached;

  try {
    const db = await openMediaDb();
    const blob = await new Promise<Blob | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(url);
      getReq.onsuccess = () => resolve(getReq.result as Blob | undefined);
      getReq.onerror = () => reject(getReq.error);
    });
    if (blob instanceof Blob) {
      const blobUrl = URL.createObjectURL(blob);
      objectUrlCache.set(url, blobUrl);
      return blobUrl;
    }
  } catch {
    // ignore
  }
  return '';
}

/**
 * Checks if a video URL is a YouTube, Vimeo, or Google Drive link that should render via iframe.
 */
export function getEmbedVideoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // YouTube watch / shorts / youtu.be
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/i
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`;
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Google Drive shared video link
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }

  return null;
}
