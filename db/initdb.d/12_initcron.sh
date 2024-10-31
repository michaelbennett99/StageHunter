customconf=/var/lib/postgresql/data/conf.d/cron.conf
mainconf=/var/lib/postgresql/data/postgresql.conf

dbname=stagehunter

echo "shared_preload_libraries = 'pg_cron'" >> ${customconf}
echo "cron.database_name = '${dbname}'" >> ${customconf}

chown postgres $customconf
chgrp postgres $customconf

echo "Setup cron conf file"

# Restart the postgres service

pg_ctl restart
