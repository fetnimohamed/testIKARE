# Étape de construction
FROM node:18-alpine as build

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY .eslintrc.js .prettierrc ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY public/ public/
COPY src/ src/

# Construire l'application
RUN npm run build

# Étape de production avec Nginx
FROM nginx:alpine

# Copier la configuration Nginx personnalisée si nécessaire
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers de build depuis l'étape précédente
COPY --from=build /app/build /usr/share/nginx/html

# Exposer le port
EXPOSE 80

# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"]