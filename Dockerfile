FROM python:3.12-alpine

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .

ENV PORT=8000
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
