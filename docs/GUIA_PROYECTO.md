# 📂 Informe Maestro de Infraestructura y Proyecto: Drip Dev

## 1. Identidad Corporativa y Contacto

- **Marca Profesional:** Drip Dev
- **Dominio Oficial:** `dripdev.dev`
- **Correo de Contacto Profesional:** `Alvaro@dripdev.dev` (Gestionado vía Porkbun Email Forwarding).
- **Cuenta de Administración Raíz:** `dripdev.dev@gmail.com` (Acceso a Vercel, Firebase, Google Console).

## 2. Ecosistema de Plataformas (Migración Completada)

- **Control de Versiones:** GitHub (Organización DripDev). Todos los repositorios de "VeoVeo" han sido transferidos aquí.
- **Firma de Código (Git Config):**
  - **User:** Alvaro DripDev
  - **Email:** Alvaro@dripdev.dev
- **Hosting de Identidad (Landing/Docs):** Vercel (Plan Hobby). Vinculado a la cuenta raíz de Gmail.
- **Infraestructura Backend:** Firebase (Google Cloud). Propiedad transferida exitosamente a `dripdev.dev@gmail.com`.

## 3. Ficha Técnica de la App: VeoVeo (v1.3.0)

**Definición:**  
Plataforma híbrida de tracking cinematográfico y red social inmersiva. Resuelve la fragmentación de catálogos mediante la centralización de datos y el filtrado social nativo.

**Stack Tecnológico:**

- **Frontend:** React Native (Expo SDK 54) + React Navigation v7.
- **Lógica de UI:** Reanimated & Gesture Handler (Animaciones Glassmorphism).
- **Base de Datos y Auth:** Firebase Firestore (NoSQL en tiempo real) + Firebase Auth (Google/Email).
- **Fuentes de Datos:** TMDB API (The Movie Database) para metadata global.
- **DevOps:** Expo Updates (OTA) para parches en caliente sin pasar por tiendas.

## 4. Flujo de Datos y Operativa

- **Validación:** UpdateGuard + Expo Updates aseguran que el cliente móvil esté sincronizado.
- **Consumo de API:** Requests directas a TMDB para visualización rápida (Cero latencia de servidor intermedio).
- **Persistencia:** Modelo de documentos en `/usuarios/{uid}/peliculas/` con renderizado optimista.
- **Social Graph:** Gestión de relaciones simétricas en `/solicitudes_amistad/` para lecturas cruzadas de bibliotecas.

## 🚀 Plan de Ataque: El "Corte de Cinta"

Acciones inminentes para darle vida al dominio:

1. **La Web de Drip Dev:** Conectaremos `dripdev.dev` a un proyecto en Vercel (Landing sencilla que presente VeoVeo o el portfolio).
2. **Configuración DNS:** Apuntar los registros A y CNAME hacia Vercel en la consola de Porkbun.
3. **Seguridad SSL:** Activar el certificado gratuito en Vercel.
