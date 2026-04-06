# Guías de Desarrollo (Development Guidelines)

Este documento establece las reglas para trabajar en el código de VeoVeo.

## 1. Reglas de Ejecución

### Entorno de Test (Recomendado)
Para cualquier cambio, bugfix o nueva funcionalidad, usa:
```bash
npm run android:test
```
**Por qué:** 
- Genera un `packageName` separado (`com.roblesgg.veoveo.test`).
- No sobreescribe la app "real" que tengas en tu móvil.
- Permite probar el Login de Google y Firebase en un entorno aislado.

### Entorno de Producción (Solo para Validación Final)
Usa:
```bash
npm run android
```
**Cuándo:**
- Para verificar que el build de producción no tiene errores de compilación.
- Para probar el sistema de actualizaciones obligatorias antes de publicar.

## 2. Flujo de Git

1. Crea ramas descriptivas para nuevas features.
2. Antes de fusionar a `main`, asegúrate de que el código pasa el `npm run typecheck`.
3. Todo commit en `main` debe ser código funcional que pueda ir a producción.

---

> [!IMPORTANT]
> Recuerda que si modificas el esquema de Firestore, debes actualizar tanto la lógica de la app como los mocks de test si existen.
