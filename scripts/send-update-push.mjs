import fs from 'fs';
import admin from 'firebase-admin';

const appJson = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
const targetVersion = appJson.expo.version;
const serviceAccount = JSON.parse(fs.readFileSync('./firebase-admin.json', 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

function compareVersions(v1 = '0.0.0', v2 = '0.0.0') {
  const p1 = String(v1).split('.').map((value) => parseInt(value.replace(/[^0-9]/g, ''), 10) || 0);
  const p2 = String(v2).split('.').map((value) => parseInt(value.replace(/[^0-9]/g, ''), 10) || 0);

  for (let i = 0; i < Math.max(p1.length, p2.length); i += 1) {
    const n1 = p1[i] || 0;
    const n2 = p2[i] || 0;
    if (n1 > n2) return 1;
    if (n1 < n2) return -1;
  }

  return 0;
}

async function enviarBatch(messages) {
  if (messages.length === 0) return;

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Expo Push API ${response.status}: ${text}`);
  }
}

async function main() {
  const snap = await db.collection('usuarios').get();
  const recipients = snap.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
    .filter((user) => typeof user.pushToken === 'string' && user.pushToken.startsWith('ExponentPushToken'))
    .filter((user) => !user.appVersion || compareVersions(user.appVersion, targetVersion) === -1);

  const messages = recipients.map((user) => ({
    to: user.pushToken,
    sound: 'default',
    title: 'Nueva actualización disponible',
    body: `VeoVeo ${targetVersion} ya está lista. Descárgala para disfrutar de las mejoras nuevas.`,
    data: {
      type: 'app_update',
      minVersion: targetVersion,
      url: 'https://veoveo.dripdev.dev/descargar',
    },
  }));

  for (let i = 0; i < messages.length; i += 100) {
    await enviarBatch(messages.slice(i, i + 100));
  }

  console.log(
    JSON.stringify(
      {
        targetVersion,
        notifiedUsers: recipients.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error.message || String(error));
  process.exit(1);
});
