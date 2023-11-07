# Stage 1 - Build the base image
FROM node:18-alpine as base
WORKDIR /app
COPY src ./src
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm install


# Stage 2 - Build the app
FROM base as build
WORKDIR /app
RUN npm run build

# Stage 3 - Production (Starting the server)
FROM node:18-alpine as production
WORKDIR /app
COPY package*.json ./
RUN npm install --only-production
COPY --from=build /app/build ./

CMD [ "node", "main.js" ]
