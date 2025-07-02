#!/bin/bash

# Usage: ./restore_postgres.sh <backup_archive> <postgres_container> <backend_container> [host_backup_path]

if [ "$#" -lt 3 ] || [ "$#" -gt 4 ]; then
    echo "Usage: $0 <backup_archive> <postgres_container> <backend_container> [host_backup_path]"
    echo "Example: $0 backup_20241225_143022.tar.gz postgres_container backend_container ./backups"
    exit 1
fi

BACKUP_ARCHIVE=$1
POSTGRES_CONTAINER=$2
BACKEND_CONTAINER=$3
HOST_BACKUP_PATH=${4:-./backups}

# Check if backup archive exists
if [ ! -f "$BACKUP_ARCHIVE" ]; then
    echo "Error: Backup archive $BACKUP_ARCHIVE not found."
    exit 1
fi

# Create temporary restore directory
RESTORE_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TEMP_RESTORE_DIR="/tmp/restore_${RESTORE_TIMESTAMP}"
mkdir -p "$TEMP_RESTORE_DIR"

# Load environment variables from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "Error: .env file not found."
    exit 1
fi

USERNAME=$POSTGRES_USER
DB_NAME=$POSTGRES_DB

echo "Starting restore process..."
echo "Backup archive: $BACKUP_ARCHIVE"
echo "PostgreSQL container: $POSTGRES_CONTAINER"
echo "Backend container: $BACKEND_CONTAINER"
echo "Database: $DB_NAME"
echo "Username: $USERNAME"

# Extract the backup archive
echo "Extracting backup archive..."
tar -xzf "$BACKUP_ARCHIVE" -C "$TEMP_RESTORE_DIR"

# Find the database backup file
DB_BACKUP_FILE=$(find "$TEMP_RESTORE_DIR" -name "pgbackup_*.sqlc" | head -1)
if [ -z "$DB_BACKUP_FILE" ]; then
    echo "Error: Database backup file (pgbackup_*.sqlc) not found in archive."
    rm -rf "$TEMP_RESTORE_DIR"
    exit 1
fi

# Check if the PostgreSQL container is running
if ! docker ps --format '{{.Names}}' | grep -q "^$POSTGRES_CONTAINER$"; then
    echo "Error: Container $POSTGRES_CONTAINER is not running."
    rm -rf "$TEMP_RESTORE_DIR"
    exit 1
fi

# Check if the backend container is running
if ! docker ps --format '{{.Names}}' | grep -q "^$BACKEND_CONTAINER$"; then
    echo "Error: Container $BACKEND_CONTAINER is not running."
    rm -rf "$TEMP_RESTORE_DIR"
    exit 1
fi

# Confirm before proceeding with database restore
read -p "WARNING: This will replace the existing database '$DB_NAME'. Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled."
    rm -rf "$TEMP_RESTORE_DIR"
    exit 1
fi

# Copy database backup file to container
CONTAINER_BACKUP_PATH="/tmp/$(basename "$DB_BACKUP_FILE")"
echo "Copying database backup file to container..."
docker cp "$DB_BACKUP_FILE" "$POSTGRES_CONTAINER":"$CONTAINER_BACKUP_PATH"

# Terminate all connections to the database before dropping it
echo "Terminating active connections to database '$DB_NAME'..."
docker exec -it "$POSTGRES_CONTAINER" psql -U "$USERNAME" -d postgres -c "
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = '$DB_NAME'
  AND pid <> pg_backend_pid();"

# Drop and recreate the database (connect to postgres database to manage other databases)
echo "Dropping existing database..."
docker exec -it "$POSTGRES_CONTAINER" psql -U "$USERNAME" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"

echo "Creating new database..."
docker exec -it "$POSTGRES_CONTAINER" psql -U "$USERNAME" -d postgres -c "CREATE DATABASE $DB_NAME;"

# Restore the database
echo "Restoring database from backup..."
docker exec -it "$POSTGRES_CONTAINER" pg_restore -U "$USERNAME" -d "$DB_NAME" -v "$CONTAINER_BACKUP_PATH"

if [ $? -eq 0 ]; then
    echo "Database restore completed successfully."
else
    echo "Warning: Database restore completed with some warnings/errors. Check the output above."
fi

# Remove the backup file from the container
echo "Cleaning up database backup file from container..."
docker exec -it "$POSTGRES_CONTAINER" rm "$CONTAINER_BACKUP_PATH"

# Restore uploads folder if it exists
UPLOADS_BACKUP_DIR="$TEMP_RESTORE_DIR/uploads"
if [ -d "$UPLOADS_BACKUP_DIR" ]; then
    echo "Restoring uploads folder..."

    # Backup existing uploads folder (optional safety measure)
    BACKUP_EXISTING_UPLOADS="/tmp/uploads_backup_${RESTORE_TIMESTAMP}"
    echo "Creating backup of existing uploads folder..."
    docker exec "$BACKEND_CONTAINER" sh -c "[ -d /app/public/uploads ] && cp -r /app/public/uploads $BACKUP_EXISTING_UPLOADS || echo 'No existing uploads folder found'"

    # Remove existing uploads folder with proper permissions
    echo "Removing existing uploads folder..."
    docker exec --user root "$BACKEND_CONTAINER" rm -rf /app/public/uploads

    # Copy the restored uploads folder
    docker cp "$UPLOADS_BACKUP_DIR" "$BACKEND_CONTAINER:/app/public/"

    # Fix ownership and permissions of the restored uploads folder
    echo "Fixing permissions on uploads folder..."
    docker exec --user root "$BACKEND_CONTAINER" chown -R $(docker exec "$BACKEND_CONTAINER" id -u):$(docker exec "$BACKEND_CONTAINER" id -g) /app/public/uploads
    docker exec --user root "$BACKEND_CONTAINER" chmod -R 755 /app/public/uploads

    echo "Uploads folder restored successfully."
    echo "Previous uploads backed up to: $BACKUP_EXISTING_UPLOADS (inside container)"
else
    echo "No uploads folder found in backup archive."
fi

# Cleanup temporary restore directory
rm -rf "$TEMP_RESTORE_DIR"

echo ""
echo "=============================================="
echo "Restore process completed successfully!"
echo "=============================================="
echo "Database '$DB_NAME' has been restored."
echo "Uploads folder has been restored (if present in backup)."
echo ""
echo "You may want to restart your application containers to ensure"
echo "all changes are properly loaded."
echo ""
echo "To restart containers:"
echo "  docker restart $POSTGRES_CONTAINER"
echo "  docker restart $BACKEND_CONTAINER"