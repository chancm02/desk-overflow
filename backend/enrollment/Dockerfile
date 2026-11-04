FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=8080
WORKDIR /app
COPY backend/enrollment/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt && useradd --uid 10001 --create-home deskoverflow
COPY backend/enrollment /app/backend/enrollment
COPY legal/versions /app/legal/versions
RUN mkdir /data && chown deskoverflow:deskoverflow /data
USER deskoverflow
EXPOSE 8080
CMD ["python", "-m", "backend.enrollment.serve"]
