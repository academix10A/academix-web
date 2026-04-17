FROM node:20 as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_API_URL
ARG VITE_API_KEY

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_KEY=$VITE_API_KEY

RUN npm run build

FROM nginx:latest

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]