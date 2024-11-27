FROM node:20 AS build

RUN mkdir -p /app
WORKDIR /app
COPY . /app
COPY ./.env /app/.env

RUN npm install

FROM node:20 AS main
WORKDIR /app
COPY --from=build /app /app
EXPOSE 4000

CMD ["npm","run","start"]
