FROM postgis/postgis:17-3.5

# # Copy the dump file to the docker container
COPY ./dump.sql /docker-entrypoint-dumps/dump.sql

# # Copy the init script to the docker container
# # Init script assumes that the dump file is present in the docker container
COPY ./initdb-stagehunter.sh /docker-entrypoint-initdb.d/initdb-stagehunter.sh
