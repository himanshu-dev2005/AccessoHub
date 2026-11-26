const { initializeApp, getApps, getApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

let mockDbInstance = null;
let configured = false;
const cacheClearListeners = new Set();

function onCacheClear(fn) {
  cacheClearListeners.add(fn);
}

function normalizePrivateKey(key) {
  if (!key || typeof key !== 'string') return key;
  let cleaned = key.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.replace(/\\n/g, '\n');
}

function parseServiceAccountFromEnv() {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (rawJson) {
    const trimmed = rawJson.trim();
    const jsonText = trimmed.startsWith('{')
      ? trimmed
      : Buffer.from(trimmed, 'base64').toString('utf8');
    const parsed = JSON.parse(jsonText);
    if (parsed.private_key && typeof parsed.private_key === 'string') {
      parsed.private_key = normalizePrivateKey(parsed.private_key);
    }
    return parsed;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    return {
      project_id: projectId.trim(),
      client_email: clientEmail.trim(),
      private_key: normalizePrivateKey(privateKey),
    };
  }

  const candidatePaths = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    path.resolve(__dirname, '../../firebase-service-account.json'),
    path.resolve(process.cwd(), 'firebase-service-account.json'),
  ].filter(Boolean);

  for (const filePath of candidatePaths) {
    if (fs.existsSync(filePath)) {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (parsed.private_key && typeof parsed.private_key === 'string') {
        parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
      }
      return parsed;
    }
  }

  return null;
}

function initializeFirebase() {
  if (mockDbInstance) return mockDbInstance;

  let firebaseApp;
  const apps = getApps();
  if (!apps.length) {
    const serviceAccount = parseServiceAccountFromEnv();
    if (!serviceAccount) {
      throw new Error(
        'Firebase credentials are missing. Set FIREBASE_SERVICE_ACCOUNT (JSON) or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your environment variables.'
      );
    }

    firebaseApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID,
    });
  } else {
    firebaseApp = getApp();
  }

  const db = getFirestore(firebaseApp);
  if (!configured && typeof db.settings === 'function') {
    try {
      db.settings({ ignoreUndefinedProperties: true });
    } catch {
      // Ignore if Firestore settings were already locked in a warm serverless container
    }
    configured = true;
  }

  return db;
}

function getDb() {
  if (mockDbInstance) return mockDbInstance;
  return initializeFirebase();
}

function setMockDb(mockDb) {
  mockDbInstance = mockDb;
  for (const fn of cacheClearListeners) fn();
}

module.exports = {
  getDb,
  initializeFirebase,
  setMockDb,
  onCacheClear,
};
