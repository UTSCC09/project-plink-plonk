FROM node:20 AS build

RUN mkdir -p /app
WORKDIR /app
COPY . /app
COPY ./.env /app/.env
RUN npm install
RUN npm run build

FROM node:20 AS main
WORKDIR /app
COPY --from=build /app /app
EXPOSE 3000

CMD ["npm","run","preview"]
