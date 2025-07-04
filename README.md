Este repositorio contiene una pequeña aplicación para registrar gastos. Incluye un backend en FastAPI, un frontend estático y scripts para compilar una app móvil con Cordova.

## Estructura
- `backend/` API con FastAPI.
- `frontend/` Aplicación web.
- `.devcontainer/` configuración para VS Code.

## Primeros pasos

### VS Code Dev Container
1. Instala la extensión **Dev Containers** en VS Code.
2. Abre el repositorio con `Dev Containers: Open Folder in Container...`.
3. El contenedor inicia el backend en `http://localhost:8000` y el frontend en `http://localhost:8001`.
4. Crea la base de datos antes de usar la aplicación:
   ```bash
   sqlite3 expenses.db < backend/schema.sql
   ```
5. `.devcontainer/android_env.sh` configura `ANDROID_HOME` automáticamente para poder compilar la app móvil.

### Compilación para móviles
Con las dependencias instaladas en el contenedor ejecuta:
```bash
./build_mobile.sh android  # Android
./build_mobile.sh ios      # iOS
```
Los proyectos generados quedan en `mobile/`.

