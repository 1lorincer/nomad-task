FROM node:20-alpine AS app

WORKDIR /app
COPY package*.json ./

RUN npm install
COPY . .
EXPOSE 5050

RUN npm run build

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5050"]
