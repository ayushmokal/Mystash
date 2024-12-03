// Firebase configuration constants and validation
export const REQUIRED_ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

export function validateFirebaseConfig(): void {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    return; // Skip validation in development when using emulator
  }

  const missingVars = REQUIRED_ENV_VARS.filter(key => !import.meta.env[key]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Firebase environment variables:\n` +
      `${missingVars.join(', ')}\n\n` +
      `Please create a .env file based on .env.example and add your Firebase project credentials.\n\n` +
      `For development, you can set VITE_USE_FIREBASE_EMULATOR=true to use the Firebase emulator.`
    );
  }
}

export function getFirebaseConfig() {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    return {
      apiKey: 'fake-api-key',
      authDomain: 'localhost',
      projectId: 'demo-project',
      storageBucket: 'demo-project.appspot.com',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:abcdef',
    };
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}