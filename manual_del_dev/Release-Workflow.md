# Guía de Lanzamiento de Versión (Release Workflow)

Esta guía explica los pasos exactos para sacar una nueva versión de VeoVeo, desde el código hasta que llega a los usuarios.

## 1. Preparar el Código
1. Sube la versión en `app.json` (ej: de `1.3.1` a `1.3.2`).
2. Sube el `versionCode` (debe ser siempre mayor al anterior).

## 2. Generar la APK (Local Build)
En lugar de esperar colas en Expo, compilamos localmente en unos 12-15 minutos:
1. Asegúrate de tener Java 17 instalado.
2. Ejecuta: `npx eas build --platform android --local --profile production`
3. Cuando termine, el archivo APK estará en la raíz del proyecto.

## 3. Actualizar la Web (Landing Page)
1. Mueve la APK generada a la carpeta `/landing`. 
2. Cámbiale el nombre a algo descriptivo (ej: `veoveo-v1.3.2.apk`).
3. Actualiza el archivo `/landing/index.html`:
   - Busca la línea del botón de descarga (`href="./..."`).
   - Pon el nombre del nuevo APK.
   - Actualiza el texto visual: `Descargar Android (v1.3.2)`.

## 4. Despliegue Automático
Como vinculamos GitHub con Netlify:
1. Haz **Push** a la rama `main`:
   ```bash
   git add .
   git commit -m "Release v1.3.2"
   git push origin main
   ```
2. Netlify detectará el cambio y actualizará la web en ~1 minuto.

## 5. Activar el Aviso en la App (Firestore)
Este es el paso que "obliga" a los usuarios a actualizar:
1. Entra en **Firebase Console**.
2. Ve a **Firestore Database**.
3. En el documento `configuracion/app`, cambia `min_version` a la nueva versión (ej: `1.3.2`).
4. ¡Listo! Todos los usuarios recibirán el aviso inmediatamente.

---
> [!TIP]
> **Script de Automatización**: Tienes un comando `npm run release` que intenta subir la versión a Firestore automáticamente, pero requiere que configures una clave de administrador en el `.env`.
