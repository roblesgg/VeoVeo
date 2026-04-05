# Guía de Errores y Soluciones (Troubleshooting)

Aquí guardamos los fallos típicos que nos han pasado y cómo se arreglan.

## 1. El APK descargado es de la versión vieja (Caché)

- **Síntoma**: Después de subir la v1.3.1, los usuarios siguen bajando la v1.3.0.
- **Causa**: El navegador tiene el archivo cacheado o Netlify está respondiendo con el ETag antiguo.
- **Solución**:
  1. **Renombrar**: Cambia el nombre del archivo APK en `landing/` (ej: usa `veoveo-test.apk`).
  2. **Link**: Actualiza el link en `index.html`.
  3. **Push**: Haz push a GitHub. Esto rompe la caché sí o sí.

## 2. La app se queda bloqueada cargando al inicio

### ⚪ Pantalla Blanca o Gris al Arrancar
1.  **Causa:** Casi siempre se debe a un error de sintaxis en `index.js` o un cuelgue en la inicialización de Firebase.
2.  **Solución:** 
    - Hemos implementado un **Auth Timeout** de 5 segundos que fuerza la navegación al Login si Firebase no responde.
    - Asegúrate de que `newArchEnabled` esté en `false` en `app.json`.
    - Limpia la caché con `npm start -- --clear`.

26. Asegúrate de que el documento `config/app_meta` en Firestore exista.

## 3. Error PERMISSION_DENIED al ejecutar scripts

- **Síntoma**: `npm run release` falla con error de permisos.
- **Causa**: El script de Node no tiene una "Service Account" de administrador. Por seguridad, Firestore solo deja escribir a usuarios autenticados.
- **Solución**: Realizar el cambio de versión manualmente en la consola de Firebase o configurar una clave de servicio en el servidor.

## 4. Fallo al compilar el APK localmente

- **Síntoma**: `eas build` da error de Java o SDK.
- **Solución**:
  1. Ejecuta `npx expo doctor` para ver si faltan dependencias.
  2. Asegúrate de que `JAVA_HOME` apunte a Java 17.
