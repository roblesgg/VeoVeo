# Guía de Lanzamiento de Versión (Release Workflow)

Esta guía explica los pasos exactos para sacar una nueva versión de VeoVeo, diferenciando entre el desarrollo (Test) y el lanzamiento estable (Producción).

## 1. Regla de Oro: Desarrollo vs Producción

*   **Debugging/Desarrollo:** SIEMPRE se debe usar `npm run android:test`. Esto genera la app con el ID `com.roblesgg.veoveo.test`, permitiendo que conviva con la app real en el móvil sin pisar datos.
*   **Producción:** Solo se genera la versión estable (`npm run android`) cuando los cambios han sido validados en la versión de Test.

## 2. Preparar el Lanzamiento

1.  Incrementa la versión en `app.json` (ej: de `1.5.0` a `1.6.0`).
2.  Sube el `versionCode` (debe ser siempre mayor al anterior, ej: de `25` a `26`).
3.  Actualiza el texto de la versión en `index.html` para que los usuarios sepan qué están descargando.

## 3. Generar la APK Estable

Compilamos localmente para evitar colas:

1.  Asegúrate de estar en la rama `main` y tener los cambios limpios.
2.  Ejecuta: `npx eas build --platform android --local --profile production`
3.  Al finalizar, el archivo APK generado debe renombrarse a `veoveo-latest.apk` y colocarse en la raíz del proyecto para que la web lo sirva correctamente.

## 4. Control de Versiones y Despliegue Web

1.  Haz **Push** a GitHub:
    ```bash
    git add .
    git commit -m "Release v1.6.0: Stable production build"
    git push origin main
    ```
2.  Vercel detectará el cambio y actualizará la landing page automáticamente.

## 5. Activar el Aviso de Actualización (Firestore)

Para obligar a los usuarios a actualizar (Mandatory Update):

1.  Ejecuta el script de sincronización: `npm run release`
2.  Este script leerá el `app.json` y actualizará el campo `min_version` en la colección `configuracion/app` de Firestore.
3.  Los usuarios con versiones inferiores verán inmediatamente el bloqueo de "Nueva versión disponible".

---

> [!IMPORTANT]
> Nunca lances a producción sin haber probado antes en `android:test`. La estabilidad de los usuarios reales es la prioridad número uno.
