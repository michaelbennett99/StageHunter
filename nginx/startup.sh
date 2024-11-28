#!/bin/bash

# Then start nginx in foreground
nginx

# Run certbot first
certbot --nginx -n --agree-tos -m admin@stagehunter.cc \
    -d stagehunter.cc -d www.stagehunter.cc

# Stop nginx
nginx -s stop

# Then start nginx in foreground
nginx -g 'daemon off;'
