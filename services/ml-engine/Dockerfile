FROM python:3.10-slim

WORKDIR /app

# Install system dependencies required by Confluent Kafka and Scikit-Learn
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    librdkafka-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy ML application code
COPY . .

# Start the Kafka consumer event loop
CMD ["python", "app.py"]
