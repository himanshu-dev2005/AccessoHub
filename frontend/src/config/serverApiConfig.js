const REMOTE_SERVER = import.meta.env.VITE_BACKEND_SERVER
  ? import.meta.env.VITE_BACKEND_SERVER.replace(/\/?$/, '/')
  : '/';

const IS_REMOTE = import.meta.env.PROD || import.meta.env.VITE_DEV_REMOTE == 'remote';

export const API_BASE_URL = IS_REMOTE
  ? `${REMOTE_SERVER}api/`
  : 'http://localhost:8888/api/';

export const BASE_URL = IS_REMOTE ? REMOTE_SERVER : 'http://localhost:8888/';

export const WEBSITE_URL = import.meta.env.PROD
  ? typeof window !== 'undefined'
    ? `${window.location.origin}/`
    : '/'
  : 'http://localhost:3000/';

export const DOWNLOAD_BASE_URL = IS_REMOTE
  ? `${REMOTE_SERVER}download/`
  : 'http://localhost:8888/download/';

export const ACCESS_TOKEN_NAME = 'x-auth-token';

export const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL ?? '';

export const resolveFileUrl = (filePath) => {
  if (!filePath) return undefined;
  if (
    filePath.startsWith('data:') ||
    filePath.startsWith('http://') ||
    filePath.startsWith('https://')
  ) {
    return filePath;
  }
  return (FILE_BASE_URL || BASE_URL) + filePath;
};
