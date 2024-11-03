set -e

export PGUSER=${POSTGRES_USER}
export dump_file=/docker-entrypoint-dumps/dump.sql

if [ -f "$dump_file" ]; then
    echo "Restoring from $dump_file and ignoring all errors"
    psql -f "$dump_file"

    # Vacuum the database cluster to analyze and reclaim disk space
    vacuumdb -a -z
else
    echo "No dump file found"
    exit 1
fi
