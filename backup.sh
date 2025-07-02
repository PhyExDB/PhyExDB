#!/bin/bash

# Usage: ./backup_postgres.sh <postgres_container> <backend_container> [host_backup_path]

if [ "$#" -lt 2 ] || [ "$#" -gt 3 ]; then
    echo "Usage: $0 <postgres_container> <backend_container> [host_backup_path]"
    exit 1
fi

POSTGRES_CONTAINER=$1
BACKEND_CONTAINER=$2
HOST_BACKUP_PATH=${3:-./backups}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="pgbackup_${TIMESTAMP}.sqlc"
UPLOADS_FOLDER="uploads"
CONTAINER_BACKUP_PATH="/tmp/$BACKUP_FILE"
TEMP_BACKUP_DIR="$HOST_BACKUP_PATH/backup_${TIMESTAMP}"

# Ensure the backup directory exists
mkdir -p "$TEMP_BACKUP_DIR"

# Load environment variables from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "Error: .env file not found."
    exit 1
fi

USERNAME=$POSTGRES_USER
DB_NAME=$POSTGRES_DB

# Check if the PostgreSQL container is running
if ! docker ps --format '{{.Names}}' | grep -q "^$POSTGRES_CONTAINER$"; then
    echo "Error: Container $POSTGRES_CONTAINER is not running."
    exit 1
fi

# Dump the database
echo "Dumping database from container: $POSTGRES_CONTAINER"
docker exec -it "$POSTGRES_CONTAINER" mkdir -p /tmp
docker exec -it "$POSTGRES_CONTAINER" pg_dump -U "$USERNAME" -F c -b -v -f "$CONTAINER_BACKUP_PATH" "$DB_NAME"

# Copy the backup file from the container to the host
echo "Copying database backup file to host..."
docker cp --archive "$POSTGRES_CONTAINER":"$CONTAINER_BACKUP_PATH" "$TEMP_BACKUP_DIR/$BACKUP_FILE"

# Remove the backup file from the container
echo "Removing database backup file from container..."
docker exec -it "$POSTGRES_CONTAINER" rm "$CONTAINER_BACKUP_PATH"

# Check if the backend container is running
if ! docker ps --format '{{.Names}}' | grep -q "^$BACKEND_CONTAINER$"; then
    echo "Error: Container $BACKEND_CONTAINER is not running."
    exit 1
fi

# Copy the uploads folder from the backend container
echo "Copying uploads folder from backend container..."
docker cp --archive "$BACKEND_CONTAINER:/app/public/uploads" "$TEMP_BACKUP_DIR/$UPLOADS_FOLDER"

# Create a compressed archive of the backup
echo "Compressing backup folder..."
tar -czf "$HOST_BACKUP_PATH/backup_${TIMESTAMP}.tar.gz" -C "$TEMP_BACKUP_DIR" .

# Cleanup temporary backup directory
rm -rf "$TEMP_BACKUP_DIR"

echo "Backup process completed successfully. The backup archive is located at $HOST_BACKUP_PATH/backup_${TIMESTAMP}.tar.gz"