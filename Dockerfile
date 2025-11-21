# Etapa 1: Build da aplicação Angular
FROM node:18 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration production

# Etapa 2: Servindo com Nginx
FROM nginx:alpine

# Copia o build gerado
COPY --from=build /app/dist/monint /usr/share/nginx/html

# Copia config das rotas SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]