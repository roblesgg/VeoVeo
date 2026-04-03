# 💎 Drip Dev: Source of Truth - VeoVeo

Este documento actúa como el **Informe Maestro de Activos** tras la migración técnica progesiva al ecosistema de **Drip Dev**. Representa el estado final y saludable de la infraestructura para la entrega a producción.

## 👤 1. Identidad y Propiedad

- **Marca:** Drip Dev
- **Dominio Principal:** `dripdev.dev`
- **Owner Maestro (Cuentas Raíz):** `dripdev.dev@gmail.com` (Control total de Firebase, Vercel, Expo y Google Cloud).
- **Contacto Profesional:** `Alvaro@dripdev.dev`
- **GitHub Org:** `DripDev`

## 🏗️ 2. Infraestructura Cloud

| Plataforma     | ID de Proyecto / Slug                  | Propósito                                 |
| :------------- | :------------------------------------- | :---------------------------------------- |
| **Firebase**   | `veoveo-48667`                         | Auth, Firestore, Storage, Cloud Messaging |
| **Expo (EAS)** | `db438c91-21eb-4020-a3ad-efec69cef405` | Builds nativos y actualizaciones OTA      |
| **Vercel**     | `VeoVeo landing`                       | Hosting de la web y distribución de APKs  |

## 🛠️ 3. Stack Tecnológico Final (Auditoría OK)

- **Framework:** React Native (Expo SDK 54)
- **Motor JS:** Hermes
- **Arquitectura:** New Architecture Enabled
- **Versiones Core:**
  - `react`: 19.1.0 (Auditado: Clean/Deduped)
  - `react-native`: 0.81.5
  - `firebase`: 12.11.0
  - `TMDB API`: v3 (Metadata de cine)
- **Navigation:** React Navigation v7 (Stack/Native)

## 🔐 4. Seguridad y Configuración (.env)

Para el correcto despliegue del entorno local y de CI/CD, se requieren las siguientes variables (solo nombres):

- `EXPO_PUBLIC_TMDB_API_KEY`
- `EXPO_PUBLIC_TMDB_READ_TOKEN`
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

## 🛣️ 5. Rutas Críticas de Producción

Se confirma el mapeo en el dominio `dripdev.dev`:

- **Deep Linking:** `/share` (Gestión de invitaciones y perfiles) -> **ESTADO: OPERATIVO**
- **Distribución Directa:** `/veoveo-latest.apk` (Enlace de descarga oficial) -> **ESTADO: MAPEADO**
- **Assets de Android:** `/.well-known/assetlinks.json` -> **ESTADO: CONFIGURADO**

---

> [!NOTE]
> **Estado de Limpieza:** Se han eliminado residuos de Netlify (`netlify.toml`, `_redirects`), carpetas de caché de desarrollo (`.expo`, `.gradle`) y código nativo 'boilerplate' no utilizado (módulo `app/` raíz). El ecosistema está **100% sano**.

**Firmado:** Auditor Senior de Software - Drip Dev
**Fecha:** 2 de abril de 2026
