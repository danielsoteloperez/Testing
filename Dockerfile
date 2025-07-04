FROM python:3.11-slim
RUN apt-get update \
    && apt-get install -y git nodejs npm openjdk-11-jdk \
    && npm install -g cordova \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend ./backend

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
