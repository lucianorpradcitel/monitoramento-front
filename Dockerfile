# ============================================
# Etapa 1: Build da aplicação Angular
# ============================================
FROM node:20 AS build

WORKDIR /app

# Atualizar npm para versão compatível
RUN npm install -g npm@11.6.2

# Aumentar memória do Node.js
ENV NODE_OPTIONS=--max_old_space_size=4096

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --legacy-peer-deps

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build -- --configuration=production

# ============================================
# Etapa 2: Servindo com Nginx
# ============================================
FROM nginx:alpine

# Remove configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia o build gerado (Angular 17+ usa /browser)
COPY --from=build /app/dist/monint/browser /usr/share/nginx/html

# Copia config customizada (COM PROXY REVERSO)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe porta 80
EXPOSE 80

# Health check (opcional, mas recomendado)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Inicia Nginx
CMD ["nginx", "-g", "daemon off;"]
