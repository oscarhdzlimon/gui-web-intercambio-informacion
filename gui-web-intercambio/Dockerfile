FROM node:22 AS build

WORKDIR /app

COPY package*.json ./

# Instalamos dependencias, incluyendo popper si no existe
RUN npm install @popperjs/core --save --legacy-peer-deps || true
RUN npm install --legacy-peer-deps

COPY . .

# Ajusta el nombre exactamente del proyecto según angular.json
RUN npm run build --configuration production
# o si tu proyecto requiere especificar la app:
# RUN npm run build gui-web-intercambio --configuration production

# Mostramos para debug
RUN ls -R /app/dist/


FROM nginx:1.25

# Ajusta la ruta según la salida real
COPY --from=build /app/dist/gui-web-intercambio/browser/ /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5040
CMD ["nginx", "-g", "daemon off;"]
