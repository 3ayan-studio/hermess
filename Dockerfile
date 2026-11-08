# Stage 1: Build de l'application Angular
FROM node:22-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances en premier pour bénéficier du cache Docker
COPY package.json ./

RUN npm ci

# Copie de l'intégralité du code source
COPY . .

# Build de production
RUN npm run build

# Stage 2: Serveur Nginx de production
FROM nginx:alpine AS runner

# Configuration Nginx personnalisée avec support du Range HTTP (206) et SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie des fichiers compilés depuis le builder
COPY --from=builder /app/dist/hermess/browser /usr/share/nginx/html

# Port exposé en interne dans le conteneur
EXPOSE 80

# Healthcheck (utilisation explicite de 127.0.0.1 pour compatibilité Alpine)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -q --spider http://127.0.0.1/healthz || exit 1

# Démarrage de Nginx au premier plan
CMD ["nginx", "-g", "daemon off;"]
