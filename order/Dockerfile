FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . . 
# This ensures routes/order.js can see ../db.js correctly
CMD ["node", "index.js"]