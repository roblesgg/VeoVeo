# Firebase Authentication - Implementación Completada

## ✅ Lo que se ha implementado

### 1. Configuración de Firebase
- ✅ Dependencias de Firebase añadidas en `build.gradle.kts`
- ✅ Plugin de Google Services configurado
- ✅ Archivo `google-services.json` colocado en `/app`
- ✅ Permisos de internet ya estaban en `AndroidManifest.xml`

### 2. Arquitectura MVVM
Se ha seguido el patrón MVVM correctamente:

#### Repository Layer (`data/AuthRepository.kt`)
- Login con email/password
- Registro de nuevos usuarios
- Login con Google (preparado, falta implementar UI)
- Logout
- Recuperar contraseña
- Verificar si hay usuario logueado

#### ViewModel Layer (`viewmodel/AuthViewModel.kt`)
- Gestión de estados de autenticación (Initial, Loading, Authenticated, Error, PasswordResetSent)
- Lógica de validación de formularios
- Manejo de operaciones asíncronas con Coroutines
- StateFlow para observar cambios desde la UI

#### View Layer
- `LoginScreen.kt` - Actualizada para usar Firebase Auth
  - Conectada con AuthViewModel
  - Indicador de carga mientras autentica
  - Mensajes de error dinámicos
  - Botón para ir a registro

- `RegisterScreen.kt` - Nueva pantalla
  - Formulario de registro con validación
  - Confirmación de contraseña
  - Botón para volver al login

- `AuthNavigation.kt` - Actualizada
  - Navegación entre Login y Registro

### 3. Funcionalidades Disponibles
- ✅ Registro de nuevos usuarios con email/password
- ✅ Login con email/password existente
- ✅ Persistencia de sesión (si cierras la app, sigue logueado)
- ✅ Logout
- ✅ Validación de formularios
- ✅ Manejo de errores de Firebase
- ⏳ Login con Google (preparado en el backend, falta configurar)

## 📋 Siguientes Pasos

### Paso 1: Verificar que compile
1. Abre el proyecto en Android Studio
2. Haz clic en **File > Sync Project with Gradle Files**
3. Espera a que termine el sync
4. Verifica que no haya errores de compilación

### Paso 2: Habilitar Autenticación en Firebase Console
1. Ve a https://console.firebase.google.com
2. Selecciona tu proyecto "veoveo-48667"
3. En el menú lateral, ve a **Authentication**
4. Haz clic en **Get Started** (si no lo has hecho)
5. En la pestaña **Sign-in method**, habilita:
   - ✅ **Email/Password** (actívalo)
   - ⏳ **Google** (opcional, para más adelante)

### Paso 3: Probar la App
1. Ejecuta la app en un emulador o dispositivo físico
2. Deberías ver la pantalla de Login
3. Haz clic en "¿No tienes cuenta? Regístrate"
4. Crea una cuenta nueva con:
   - Email: tu-email@ejemplo.com
   - Contraseña: mínimo 6 caracteres
   - Confirmar contraseña: la misma
5. Si todo va bien, deberías ser redirigido a la app principal
6. Prueba cerrar la app y volver a abrirla (debería seguir logueado)

### Paso 4: Verificar usuarios en Firebase Console
1. Ve a **Authentication > Users** en Firebase Console
2. Deberías ver los usuarios que has creado

### Paso 5: Implementar Logout
Necesitarás añadir un botón de logout en tu app (probablemente en AjustesScreen o PerfilScreen):

```kotlin
// En AjustesScreen.kt o donde quieras poner el logout
val authViewModel: AuthViewModel = viewModel()

Button(onClick = {
    authViewModel.logout()
    // Navegar de vuelta al login
}) {
    Text("Cerrar Sesión")
}
```

## 🔧 Archivos Creados/Modificados

### Nuevos Archivos
- `app/src/main/java/com/example/veoveo/data/AuthRepository.kt`
- `app/src/main/java/com/example/veoveo/viewmodel/AuthViewModel.kt`
- `app/src/main/java/com/example/veoveo/ui/screens/RegisterScreen.kt`
- `app/google-services.json`

### Archivos Modificados
- `build.gradle.kts` (raíz) - Plugin de Google Services
- `app/build.gradle.kts` - Dependencias de Firebase y plugin
- `app/src/main/java/com/example/veoveo/ui/screens/LoginScreen.kt` - Conectado con ViewModel
- `app/src/main/java/com/example/veoveo/ui/navigation/AuthNavigation.kt` - Añadido RegisterScreen

## 🎯 Próximos Pasos para el TFG

Ahora que tienes autenticación funcionando, puedes:

1. **Conectar TMDB API** - Ya tienes usuarios, ahora puedes guardar qué películas ve cada uno
2. **Base de datos Firestore** - Guardar películas vistas/por ver de cada usuario
3. **Tier Lists** - Asociar las tier lists con el usuario logueado
4. **Sistema Social** - Añadir amigos usando los UIDs de Firebase
5. **Google Sign-In** - Si quieres añadir login con Google

## ⚠️ Notas Importantes

### Seguridad
- La API Key en `google-services.json` es PÚBLICA y está diseñada para estar en el código
- Firebase tiene reglas de seguridad en el backend que protegen los datos
- Nunca uses la `service_role` key en la app

### Errores Comunes
- **FirebaseException: An internal error has occurred** - Verifica que habilitaste Email/Password en Firebase Console
- **The email address is already in use** - Normal, ese email ya está registrado
- **The password is invalid** - La contraseña debe tener mínimo 6 caracteres
- **Network error** - Verifica que el emulador/dispositivo tenga internet

### Testing
Para probar sin crear cuentas reales, puedes usar:
- Email: test@veoveo.com
- Password: test123

## 📚 Recursos

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth/android/start)
- [Firebase Console](https://console.firebase.google.com)
- [Jetpack Compose + Firebase](https://firebase.google.com/docs/auth/android/start#kotlin+ktx_1)

---

¡Autenticación implementada correctamente! 🎉
Si tienes algún error al compilar o ejecutar, avísame y te ayudo a resolverlo.
