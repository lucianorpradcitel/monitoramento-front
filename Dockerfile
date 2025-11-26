# Etapa 1: Build da aplicação Angular
FROM node:18 AS build
WORKDIR /app
# Copiar package files
COPY package*.json ./
# Instalar dependências (incluindo devDependencies para o build)
RUN npm ci
# Copiar código fonte
COPY . .
# Build da aplicação
RUN npm run build -- --configuration production

# Etapa 2: Servindo com Nginx
FROM nginx:alpine
# Copia o build gerado
COPY --from=build /app/dist/monint /usr/share/nginx/html
# Copia config das rotas SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 4200
CMD ["nginx", "-g", "daemon off;"]
