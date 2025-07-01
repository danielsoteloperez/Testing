
Este repositorio contiene la base de una aplicación pensada para registrar gastos
de forma privada. Incluye un pequeño backend en Python y una interfaz web
sencilla a modo de demostración. En el futuro podría integrarse reconocimiento
de voz e IA para capturar gastos con frases como "mete 10 euros en gastos de bar".

## Estructura
- `backend/` API con FastAPI y SQLite.
- `frontend/` Aplicación web simple en JavaScript.

## Primeros pasos

### Ejecución local
1. Instalar dependencias de Python:
   ```bash
   pip install -r backend/requirements.txt
   ```
2. Iniciar el backend:
   ```bash
   uvicorn backend.main:app --reload
   ```
3. Abrir `frontend/index.html` en el navegador y probar la entrada de datos.

### Uso con Docker
También puedes levantar la API en un contenedor Docker:
1. Construir la imagen:
   ```bash
   docker build -t gastos-app .
   ```
2. Ejecutarla exponiendo el puerto 8000:
   ```bash
   docker run --rm -p 8000:8000 gastos-app
   ```
3. Acceder al frontend abriendo `frontend/index.html` y apuntando la API a `http://localhost:8000`.

Si utilizas Visual Studio Code, puedes abrir la carpeta en modo *dev container* para que la imagen se genere automáticamente.

Este proyecto es solo un punto de partida y se espera ampliarlo con
funciones de voz, IA y una interfaz más trabajada.