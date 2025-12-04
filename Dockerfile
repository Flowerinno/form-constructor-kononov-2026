FROM node:20-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci
EXPOSE 5173
CMD ["npm", "run", "dev"]