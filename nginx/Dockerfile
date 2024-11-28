FROM nginx:1.27.2 AS base

FROM base AS deps

COPY . /etc/nginx

# Don't need SSL certificates for development, just use nginx
FROM deps AS development

COPY --from=deps /etc/nginx /etc/nginx

# In staging, we need SSL certificates. Install certbot and run it.
FROM deps AS staging

COPY --from=deps /etc/nginx /etc/nginx

# Install certbot
RUN apt-get update \
    && apt-get install -y certbot python3-certbot-nginx \
    && rm -rf /var/lib/apt/lists/*

# # Start nginx and then run certbot
# CMD [ \
#     "nginx", "-g", "daemon off;", \
#     "&&", "certbot", "--nginx", \
#     "-n", "--agree-tos", "-m", "admin@stagehunter.cc", \
#     "-d", "stagehunter.cc", "-d", "www.stagehunter.cc" \
# ]
