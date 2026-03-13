FROM node:22-alpine AS base
WORKDIR /app
COPY package.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages
RUN npm install
RUN npm --workspace @milestone/web run build
EXPOSE 3000
CMD ["npm", "--workspace", "@milestone/web", "run", "start"]
