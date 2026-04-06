import fs from 'fs';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Leer app.json para sacar la versión actual
const appJson = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
const version = appJson.expo.version;
const isTest = appJson.expo.name.includes('Test');

// Leer la clave de administrador
let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync('./firebase-admin.json', 'utf8'));
} catch (error) {
  console.error('❌ Error: No se encontró firebase-admin.json en la raíz.');
  console.error('👉 Genera la clave en Firebase Console > Project Settings > Service Accounts');
  process.exit(1);
}

// Inicializar Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function pushVersion() {
  console.log(
    `🚀 Sincronizando versión v${version} con Firestore (${isTest ? 'MODO TEST' : 'MODO PRODUCCIÓN'})...`,
  );

  const docRef = db.collection('configuracion').doc('app');

  const updateData = {};
  const field = isTest ? 'min_version_test' : 'min_version';
  updateData[field] = version;

  // También actualizamos la URL de descarga oficial
  const downloadUrlField = isTest ? 'download_url_test' : 'download_url';
  updateData[downloadUrlField] = 'https://veoveo.dripdev.dev';

  try {
    await docRef.update(updateData);
    console.log(`✅ ¡Éxito! Campo '${field}' actualizado a '${version}' en Firestore.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al actualizar Firestore (Admin SDK):', error.message);
    process.exit(1);
  }
}

pushVersion();
