# Etapa 1: Build de la aplicación Angular
FROM node:22 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build -- gui-web-intercambio --configuration production


# Verifica la estructura de /app/dist/
RUN ls -l /app/dist/                # Debería existir /app/dist/app/
RUN ls -l /app/dist/app/            # Debería contener /browser/
RUN ls -l /app/dist/app/browser/    # Debería tener index.html, assets/, etc.

# Etapa 2: Servir la aplicación Angular
FROM nginx:1.25

COPY --from=build /app/dist/app/browser/ /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5040

CMD ["nginx", "-g", "daemon off;"]
