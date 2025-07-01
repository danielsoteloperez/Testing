# Registro de Gastos con IA y Voz

Este repositorio contiene la base de una aplicación pensada para registrar gastos
de forma privada. Incluye un pequeño backend en Python y una interfaz web
sencilla a modo de demostración. En el futuro podría integrarse reconocimiento
de voz e IA para capturar gastos con frases como "mete 10 euros en gastos de bar".

## Estructura
- `backend/` API con FastAPI y SQLite.
- `frontend/` Aplicación web simple en JavaScript.

## Primeros pasos
1. Instalar dependencias de Python:
   ```bash
   pip install -r backend/requirements.txt
   ```
2. Iniciar el backend:
   ```bash
   uvicorn backend.main:app --reload
   ```
3. Abrir `frontend/index.html` en el navegador y probar la entrada de datos.

Este proyecto es solo un punto de partida y se espera ampliarlo con
funciones de voz, IA y una interfaz más trabajada.
