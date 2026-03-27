# Integración con Firebase

Firebase es el motor que mueve VeoVeo. Aquí se explica cómo está configurado.

## 1. Autenticación (Auth)
Usamos **Email y Contraseña**.
*   Configuración: `src/services/firebase.ts`.
*   Persistencia: Usamos `ReactNativeAsyncStorage` para que la sesión no se cierre al salir de la app.

## 2. Base de Datos (Firestore)
La estructura principal es:
*   `usuarios/{uid}`: Perfil, nombre, imagen y lista de amigos.
*   `usuarios/{uid}/biblioteca/{idPeli}`: Películas guardadas por el usuario, con su nota, estado (Pendiente/Vista) y plataforma.
*   `solicitudes/{id}`: Peticiones de amistad pendientes.
*   `configuracion/app`: **Documento Crítico**. Contiene `min_version` y `download_url` para el sistema de actualizaciones obligatorias.

## 3. Almacenamiento (Storage)
Lo usamos principalmente para las fotos de perfil de los usuarios.
*   Ruta: `perfiles/{uid}.jpg`.

## 4. Reglas de Seguridad (Security Rules)
Importante revisar en la consola de Firebase que las reglas permitan:
*   Lectura de `configuracion/app` para todos (público).
*   Escritura en `usuarios/{uid}` solo para el dueño del UID.
*   Gestión de amigos y solicitudes cruzadas.

---
> [!WARNING]
> Nunca compartas el archivo `google-services.json` ni las claves del `.env` en repositorios públicos.
