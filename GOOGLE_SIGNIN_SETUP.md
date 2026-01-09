# Configuración de Google Sign-In

Para que el login con Google funcione correctamente, necesitas configurarlo en Firebase:

## Pasos:

1. **Ve a la Consola de Firebase**: https://console.firebase.google.com/
2. **Selecciona tu proyecto**: VeoVeo
3. **Ve a Authentication** (Autenticación)
4. **Click en "Sign-in method"** (Método de inicio de sesión)
5. **Habilita "Google"** como proveedor
6. **Descarga el nuevo `google-services.json`**
7. **Reemplaza** el archivo `app/google-services.json` con el nuevo
8. **Sincroniza** el proyecto en Android Studio

## Alternativa si no quieres configurarlo ahora:

El código ya está preparado. Si no configuras Google Sign-In, el botón simplemente mostrará un error cuando el usuario intente usarlo, pero el resto de la app funcionará normal (login con email/password).

## Después de configurar:

Una vez configurado, el archivo `google-services.json` tendrá un campo `oauth_client` con el `client_id` de Google, y el `default_web_client_id` se generará automáticamente en los recursos de la app.
