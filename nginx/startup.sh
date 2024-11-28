#!/bin/bash

# Run certbot first
certbot --nginx -n --agree-tos -m admin@stagehunter.cc \
    -d stagehunter.cc -d www.stagehunter.cc

# Then start nginx in foreground
nginx -g 'daemon off;'
