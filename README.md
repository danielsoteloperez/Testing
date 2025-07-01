Este repositorio contiene una pequeña aplicación para registrar gastos de forma privada. Incluye un backend en FastAPI con SQLite y un frontend muy sencillo en JavaScript.

## Estructura
- `backend/` API con FastAPI.
- `frontend/` Aplicación web estática.
- `.devcontainer/` configuración para VS Code.

## Base de datos
Al iniciar el backend se crea automáticamente la base de datos `expenses.db` con una estructura pensada para manejar familias y usuarios.
Se genera una familia de ejemplo denominada *Familia root* con el usuario `root` (contraseña `test`). Este usuario dispone de una cuenta *Personal* y las categorías *Bares* y *Compra*.

## Primeros pasos

### Ejecución local
1. Instalar dependencias de Python:
   ```bash
   pip install -r backend/requirements.txt
   ```
2. Iniciar el backend manualmente:
   ```bash
   uvicorn backend.main:app --reload
   ```
3. En otra terminal servir el frontend:
   ```bash
   python -m http.server 8001 --directory frontend
   ```
4. Abrir `http://localhost:8001` en el navegador.

### Dev container (VS Code)
Para trabajar en un contenedor de desarrollo realiza los siguientes pasos:
1. Instala la extensión **Dev Containers** en VS Code.
2. Abre la paleta de comandos con `F1` o `Ctrl+Shift+P` y ejecuta
   `Dev Containers: Open Folder in Container...` seleccionando este repositorio.
3. VS Code construirá el contenedor definido en `.devcontainer` y abrirá la
   carpeta dentro de él.
4. Al iniciarse el contenedor se ejecutará `start_services.sh`, que levanta el
   backend en el puerto 8000 y un servidor estático para el frontend en el
   puerto 8001.
5. Abre `http://localhost:8001` para usar la aplicación. La base de datos se
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
```
