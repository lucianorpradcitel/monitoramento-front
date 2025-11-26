# Etapa 1: Build da aplicação Angular
FROM node:20 AS build
WORKDIR /app

# Atualizar npm para versão compatível
RUN npm install -g npm@11.6.2

# Aumentar memória do Node.js
ENV NODE_OPTIONS=--max_old_space_size=4096

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build -- --configuration=production

# Etapa 2: Servindo com Nginx
FROM nginx:alpine

# Copia o build gerado (Angular 17+ usa /browser)
COPY --from=build /app/dist/monint/browser /usr/share/nginx/html

# Copia config das rotas SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
