FROM node:22-alpine AS base
WORKDIR /app
COPY package.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages
RUN npm install
RUN npm --workspace @milestone/admin run build
EXPOSE 3001
CMD ["npm", "--workspace", "@milestone/admin", "run", "start"]
