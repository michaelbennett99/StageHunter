FROM nginx:1.27.2 AS base

FROM base AS deps

COPY nginx.conf /etc/nginx/nginx.conf
COPY includes /etc/nginx/includes
COPY startup.sh /startup.sh

# Don't need SSL certificates for development, just use nginx
FROM deps AS development

COPY --from=deps /etc/nginx /etc/nginx

# In staging, we need SSL certificates. Install certbot and run it.
FROM deps AS staging

COPY --from=deps /etc/nginx /etc/nginx
COPY --from=deps /startup.sh /startup.sh

# Install certbot
RUN apt-get update \
    && apt-get install -y certbot python3-certbot-nginx \
    && rm -rf /var/lib/apt/lists/*

# Start nginx and then run certbot
CMD [ "/startup.sh" ]
