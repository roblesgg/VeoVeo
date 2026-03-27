import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

// Leer app.json para sacar la versión actual
const appJson = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
const version = appJson.expo.version;
const isTest = appJson.expo.name === 'VeoVeoTest';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Validar config básica
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Error: Faltan variables de entorno EXPO_PUBLIC_FIREBASE_* en el .env');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function pushVersion() {
  console.log(`🚀 Sincronizando versión v${version} con Firestore (${isTest ? 'MODO TEST' : 'MODO PRODUCCIÓN'})...`);
  
  const docRef = doc(db, 'configuracion', 'app');
  
  const updateData = {};
  const field = isTest ? 'min_version_test' : 'min_version';
  updateData[field] = version;
  
  // También actualizamos la URL de descarga por si acaso
  const downloadUrlField = isTest ? 'download_url_test' : 'download_url';
  updateData[downloadUrlField] = 'https://veoveo-app-install.netlify.app';

  try {
    await updateDoc(docRef, updateData);
    console.log(`✅ ¡Éxito! Campo '${field}' actualizado a '${version}' en Firestore.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al actualizar Firestore:', error.message);
    if (error.code === 'permission-denied') {
      console.error('👉 Asegúrate de tener permisos de escritura en la colección "configuracion".');
    }
    process.exit(1);
  }
}

pushVersion();
