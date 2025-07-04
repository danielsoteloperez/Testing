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

## Comandos de voz

El botón **Agregar por Voz** permite crear gastos dictando frases que sigan
alguna de estas variantes:

- `inserta 5€ de gastos para <usuario> en los <categoria>`
- `insertar 5 euros de <usuario> en la <categoria>`
- `inserta 5 de <usuario> en el <categoria>`
- `inserta 3,5 de <usuario> en el <categoria>`

La cantidad puede expresarse con o sin el símbolo `€` y la parte `de gastos`
es opcional. El sistema reconocerá el usuario y la categoría indicados y
registrará automáticamente el gasto.

## Categorías por familia

Cada familia dispone de sus propias categorías. Al crear una familia se
generan por defecto las siguientes: **Alquiler**, **Super** (también
conocida como **Compra**), **Bares** (o **Bar**), **Farmacia** y
**Gasolina**. Se pueden añadir más categorías enviando peticiones al
endpoint `/categories/` con el `family_id` correspondiente y el nombre
deseado.

