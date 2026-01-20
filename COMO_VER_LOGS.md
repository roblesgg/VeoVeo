# Cómo ver los logs en Android Studio

He agregado logs detallados en toda la app para que puedas ver exactamente dónde se está atascando la conexión con Firebase.

## Pasos para ver los logs:

### 1. Abre Logcat en Android Studio
- En la parte inferior de Android Studio, busca la pestaña **"Logcat"**
- Si no la ves, ve al menú: `View > Tool Windows > Logcat`

### 2. Filtra los logs relevantes
En la barra de búsqueda de Logcat, escribe uno de estos filtros:

**Para ver todos los logs importantes:**
```
tag:RepositorioUsuarios|ViewModelPerfil
```

**O simplemente:**
```
RepositorioUsuarios
```

**O:**
```
ViewModelPerfil
```

### 3. Ejecuta la app
1. Ejecuta la app en tu dispositivo o emulador
2. Ve a la pantalla de Perfil
3. Observa Logcat mientras la app intenta cargar

### 4. Qué logs deberías ver:

#### Al cargar el perfil:
```
ViewModelPerfil: === INICIANDO cargarPerfil ===
ViewModelPerfil: Intentando cargar perfil con timeout de 10s
ViewModelPerfil: Llamando a repositorio.obtenerPerfilUsuario()
RepositorioUsuarios: === obtenerPerfilUsuario ===
RepositorioUsuarios: UID del usuario: ABC123...
RepositorioUsuarios: Consultando Firestore: usuarios/ABC123
RepositorioUsuarios: Documento existe: true
RepositorioUsuarios: Usuario obtenido: Usuario_ABC123
ViewModelPerfil: Perfil cargado exitosamente: Usuario_ABC123
ViewModelPerfil: === FIN cargarPerfil ===
```

#### Al actualizar el nombre:
```
ViewModelPerfil: === INICIANDO actualizarUsername: NuevoNombre ===
ViewModelPerfil: Intentando actualizar con timeout de 15s
ViewModelPerfil: Llamando a repositorio.actualizarUsername()
RepositorioUsuarios: Actualizando username a: NuevoNombre para UID: ABC123
RepositorioUsuarios: Username actualizado exitosamente
ViewModelPerfil: Actualización exitosa en Firebase
ViewModelPerfil: Estado local actualizado
ViewModelPerfil: === FIN actualizarUsername ===
```

### 5. Posibles errores que verás:

#### Si Firebase no está conectado:
```
RepositorioUsuarios: Error al obtener perfil
com.google.firebase.FirebaseException: Firebase not initialized
```

#### Si hay timeout:
```
ViewModelPerfil: TIMEOUT al cargar perfil
```

#### Si no hay internet:
```
RepositorioUsuarios: Error al obtener perfil
java.net.UnknownHostException: Unable to resolve host
```

#### Si el usuario no está autenticado:
```
RepositorioUsuarios: Usuario no autenticado
```

### 6. Comparte los logs
Cuando veas el error en Logcat:
1. Haz click derecho en el log
2. Selecciona "Copy" o copia manualmente el mensaje de error
3. Compártelo conmigo para que pueda ver exactamente qué está pasando

## Verificación rápida de Firebase

También puedes verificar que Firebase esté funcionando:

1. Ve a la consola de Firebase: https://console.firebase.google.com/
2. Selecciona tu proyecto "VeoVeo"
3. Ve a "Firestore Database"
4. Verifica que exista la colección "usuarios"
5. Verifica que tu usuario tenga un documento con tu UID

## Si no ves ningún log

Si Logcat no muestra ningún log de `RepositorioUsuarios` o `ViewModelPerfil`:
1. Asegúrate de que el filtro esté bien escrito
2. Verifica que la app esté corriendo en modo Debug (no Release)
3. Limpia y recompila el proyecto: `Build > Clean Project` y luego `Build > Rebuild Project`
