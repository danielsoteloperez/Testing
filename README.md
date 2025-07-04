Este repositorio contiene una pequeña aplicación para registrar gastos de forma privada. Incluye un backend en FastAPI con SQLite y un frontend muy sencillo en JavaScript.

## Estructura
- `backend/` API con FastAPI.
- `frontend/` Aplicación web estática.
- `.devcontainer/` configuración para VS Code.

## Base de datos
La base de datos ya no se genera al iniciar la API. Ejecuta manualmente el script `backend/schema.sql` para crear `expenses.db`:

```bash
sqlite3 expenses.db < backend/schema.sql
```

El script crea la estructura necesaria e inserta una familia de ejemplo denominada *Familia root* con el usuario `root` (contraseña `test`). Dicho usuario dispone de una cuenta *Personal* y las categorías *Bares* y *Compra*.

## Primeros pasos

### Ejecución local
1. Instalar dependencias de Python:
   ```bash
   pip install -r backend/requirements.txt
   ```
2. Crear la base de datos ejecutando el script SQL:
   ```bash
   sqlite3 expenses.db < backend/schema.sql
   ```
3. Iniciar el backend manualmente:
   ```bash
   uvicorn backend.main:app --reload
   ```
4. En otra terminal servir el frontend:
   ```bash
   python -m http.server 8001 --directory frontend
   ```
5. Abrir `http://localhost:8001` en el navegador.

### Dev container (VS Code)
Para trabajar en un contenedor de desarrollo realiza los siguientes pasos:
1. Instala la extensión **Dev Containers** en VS Code.
2. Abre la paleta de comandos con `F1` o `Ctrl+Shift+P` y ejecuta
   `Dev Containers: Open Folder in Container...` seleccionando este repositorio.
3. VS Code construirá el contenedor definido en `.devcontainer` y abrirá la
   carpeta dentro de él.
4. Al iniciarse el contenedor se ejecutará `start_services.sh`, que levanta el
   backend en el puerto 8000 y un servidor estático para el frontend en el
   puerto 8001. Durante la construcción se instalan Node.js y Cordova para
   poder compilar la aplicación móvil.
5. Antes de usar la aplicación crea la base de datos:
   ```bash
   sqlite3 expenses.db < backend/schema.sql
   ```
6. Abre `http://localhost:8001` para usar la aplicación. La base de datos se
   almacena en la carpeta del proyecto, por lo que persiste entre sesiones.

### Uso con Docker
Tambien se puede levantar la API en un contenedor Docker:
1. Construir la imagen:
   ```bash
   docker build -t gastos-app .
   ```
2. Ejecutarla exponiendo el puerto 8000:
   ```bash
   docker run --rm -p 8000:8000 gastos-app
   ```
3. Servir el frontend por tu cuenta y apuntarlo a `http://localhost:8000`.

### Pruebas
Se incluyen tests básicos para backend y frontend.

Ejecuta:
```bash
python backend/test_backend.py
node frontend/test_frontend.js
node test_mobile.js
```

### Compilación para móviles

Se incluye el script `build_mobile.sh` para generar aplicaciones Android e iOS
utilizando Cordova. Tras crear el contenedor de desarrollo, las dependencias
necesarias ya estarán instaladas y podrás ejecutar:

```bash
./build_mobile.sh android  # compila para Android
./build_mobile.sh ios      # compila para iOS
```

Los proyectos generados en `mobile/` pueden abrirse con Android Studio o Xcode
para obtener los binarios finales.
