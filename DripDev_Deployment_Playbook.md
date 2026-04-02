# 🚀 Playbook de Despliegue: El "Corte de Cinta" (Drip Dev)

Este documento es tu guía de ejecución manual para realizar la transición final desde la infraestructura antigua hacia el nuevo ecosistema **Drip Dev**. Sigue cada paso en orden para asegurar un "down-time" de cero segundos.

---

## 🛑 Fase 1: Apagón en Netlify
*Para evitar conflictos de "ownership" de dominio y certificados SSL duplicados.*

- [ ] **Entrar al Panel:** Accede a [app.netlify.com](https://app.netlify.com).
- [ ] **Seleccionar Sitio:** Entra en el proyecto antiguo de VeoVeo.
- [ ] **Desvincular Dominio (Opcional pero recomendado):**
    - Ve a **Domain Settings**.
    - Si `dripdev.dev` o `www.dripdev.dev` aparecen aquí, dale a **Options** > **Remove domain**.
- [ ] **Borrado Definitivo:**
    - Ve a **Site Settings** (menú lateral).
    - Pestaña **General**.
    - Baja hasta el final: **Danger Zone**.
    - Haz clic en **Delete this site**. Confirma con el nombre del sitio si te lo pide.

---

## 🌐 Fase 2: Verificación de DNS (Porkbun)
*Confirmar que el tráfico ya sabe a dónde ir.*

- [ ] **Revisión en Porkbun:** Entra en tu consola de Porkbun y confirma que:
    - Registro **A** apunta a: `76.76.21.21`
    - Registro **CNAME** (www) apunta a: `cname.vercel-dns.com`
- [ ] **Comprobación de Propagación:**
    - Abre una terminal en tu PC y escribe: `nslookup dripdev.dev`
    - **ÉXITO:** Si la respuesta incluye la IP `76.76.21.21`.
    - *Alternativa web:* Usa [whatsmydns.net](https://www.whatsmydns.net/#A/dripdev.dev).

---

## 🔒 Fase 3: Encendido y SSL en Vercel
*Activar el cifrado seguro en la nueva casa.*

- [ ] **Panel de Vercel:** Entra en el nuevo proyecto **VeoVeo landing**.
- [ ] **Estado del Dominio:** Ve a **Settings** > **Domains**.
- [ ] **Refresh SSL:**
    - Si el dominio ya tiene el check verde ✅, el SSL ya está activo.
    - Si aparece un aviso de "Invalid Configuration", dale al botón **Refresh**.
    - Si pone "Generating SSL", espera 60 segundos. Vercel lo hace automáticamente en cuanto detecta los DNS correctos.

---

## 🧪 Fase 4: Prueba de Humos (Smoke Test)
*Verifica que los 3 pilares del sistema funcionan en vivo.*

- [ ] **Enlace 1 (Home):** [https://dripdev.dev/](https://dripdev.dev/)
    - *Resultado esperado:* Carga la landing page con animaciones y el logo.
- [ ] **Enlace 2 (Descarga APK):** [https://dripdev.dev/veoveo-latest.apk](https://dripdev.dev/veoveo-latest.apk)
    - *Resultado esperado:* Salta la descarga inmediata del archivo de 86MB aproximadamente.
- [ ] **Enlace 3 (Deep Linking):** [https://dripdev.dev/share?type=movie&id=550](https://dripdev.dev/share?type=movie&id=550)
    - *Resultado esperado:* Carga la página de share (el diseño tipo movil) con el botón para abrir la app.
- [ ] **Bonus (AssetLinks):** [https://dripdev.dev/.well-known/assetlinks.json](https://dripdev.dev/.well-known/assetlinks.json)
    - *Resultado esperado:* Se muestra el JSON con el SHA256 de la firma de Android.

---

> [!IMPORTANT]
> **¿Algo no funciona?**
> Si el dominio no carga, borra la caché de tu navegador o prueba en una ventana de incógnito. A veces los navegadores guardan la ruta vieja de Netlify por unos minutos.

**¡El ecosistema está listo! Dale al interruptor. ⚡**
