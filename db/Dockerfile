FROM postgis/postgis:17-3.5

# Get pg_cron
RUN apt-get update && \
    apt-get install -y postgresql-17-cron && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy the dump file to the docker container
COPY ./dump.sql /docker-entrypoint-dumps/dump.sql
# Ensure correct permissions and that the file is owned by postgres
RUN chown postgres:postgres /docker-entrypoint-dumps/dump.sql
RUN chmod 600 /docker-entrypoint-dumps/dump.sql

# Copy the init scripts to the docker container
# Init scripts assumes that the dump file is present in the docker container
# They initialize the database and then install pg_cron if needed
COPY ./initdb.d /docker-entrypoint-initdb.d

# Ensure correct permissions and that the files are owned by postgres
RUN chown -R postgres:postgres /docker-entrypoint-initdb.d
RUN chmod -R 755 /docker-entrypoint-initdb.d
