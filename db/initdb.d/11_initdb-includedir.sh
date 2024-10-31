mkdir -p /var/lib/postgresql/data/conf.d
chown postgres /var/lib/postgresql/data/conf.d
chgrp postgres /var/lib/postgresql/data/conf.d

echo "Created conf.d directory and set ownership and group"

mainconf=/var/lib/postgresql/data/postgresql.conf
echo "include_dir = '/var/lib/postgresql/data/conf.d'" >> ${mainconf}
echo "Added include_dir to main conf file"
