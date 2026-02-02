FROM python:3.11-alpine

# Install dependencies
RUN pip install --no-cache-dir pycryptodome

# Create app directory
WORKDIR /app

# Copy application
COPY src/app.py /app/app.py

# Set entrypoint
ENTRYPOINT ["python", "/app/app.py"]
