type EnvKey =
  | 'EXPO_PUBLIC_TMDB_API_KEY'
  | 'EXPO_PUBLIC_TMDB_READ_TOKEN'
  | 'EXPO_PUBLIC_FIREBASE_API_KEY'
  | 'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'
  | 'EXPO_PUBLIC_FIREBASE_PROJECT_ID'
  | 'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'
  | 'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'
  | 'EXPO_PUBLIC_FIREBASE_APP_ID'
  | 'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID'
  | 'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID'
  | 'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID';

function readRequiredEnv(key: EnvKey): string {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`Falta la variable de entorno requerida: ${key}`);
  }
  return value;
}

function readOptionalEnv(key: EnvKey): string | null {
  const value = process.env[key]?.trim();
  return value || null;
}

export const env = {
  tmdbApiKey: readOptionalEnv('EXPO_PUBLIC_TMDB_API_KEY'),
  tmdbReadToken: readRequiredEnv('EXPO_PUBLIC_TMDB_READ_TOKEN'),
  firebaseApiKey: readRequiredEnv('EXPO_PUBLIC_FIREBASE_API_KEY'),
  firebaseAuthDomain: readRequiredEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  firebaseProjectId: readRequiredEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  firebaseStorageBucket: readRequiredEnv('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  firebaseMessagingSenderId: readRequiredEnv('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  firebaseAppId: readRequiredEnv('EXPO_PUBLIC_FIREBASE_APP_ID'),
  googleAndroidClientId: readOptionalEnv('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID'),
  googleIosClientId: readOptionalEnv('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID'),
  googleWebClientId: readRequiredEnv('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'),
} as const;
