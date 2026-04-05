# Resumen de la Arquitectura (Architecture Overview)

VeoVeo es una aplicación de React Native construida sobre **Expo (SDK 54)**. Aquí tienes una visión general de cómo está organizada.

## 1. Estructura de Carpetas (`src/`)

- `components/`: Piezas reutilizables de UI (botones, modales, etc.).
  - `UpdateGuard.tsx`: El vigilante de las versiones (bloquea la app si hay que actualizar).
- `screens/`: Pantallas principales (PeliculaScreen, BibliotecaTab, AjustesScreen, etc.).
- `services/`: Conexiones externas (Firebase, APIs).
- `navigation/`: Configura el enrutamiento. Las pestañas principales usan un Bottom Tab Navigator, mientras que pantallas como `SolicitudesScreen` y `BibliotecaAmigoScreen` se gestionan en el `RootStack` para una navegación nativa y manejo de back-stack.
- `theme/`: Colores y estilos globales.

## 2. Tecnologías Clave

- **React Native & Expo**: El núcleo multiplataforma.
- **Firebase**:
  - **Auth**: Gestión de usuarios (incluye fix de timeout en procesos de autenticación).
  - **Firestore**: Base de datos para películas, amigos y configuración.
- **TMDB API**: De donde sacamos toda la información de las películas y series.
- **Expo linear gradient & Blur**: Para ese diseño "glassmorphism" elegante.

### 🛠️ Nueva Arquitectura (Fabric)
- **Estado actual:** 🔴 **Desactivada**.
- **Razón:** Inestabilidades detectadas con librerías nativas como `react-native-skia` y `expo-blur`. Se recomienda usar la arquitectura clásica para garantizar fluidez y evitar crasheos de C++.

### ☕ Entorno Requerido
- **Java:** JDK 17.
- **Variable de Sistema:** `JAVA_HOME` apuntando a la ruta del JDK 17 (ej. `C:\Program Files\Java\jdk-17`).

## 3. Estado de la Aplicación

Usamos **Context API** para gestionar el estado global (ej: si el usuario está logueado o no). Para el almacenamiento local (caché), usamos `@react-native-async-storage/async-storage`.

## 4. Despliegue de la Landing Page

La carpeta `/landing` es un sitio web estático e independiente que sirve para que los usuarios descarguen la APK. Está conectado a Netlify directamente desde GitHub.
