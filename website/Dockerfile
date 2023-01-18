FROM node:alpine

ENV HOME /website
WORKDIR /website

COPY . .
RUN npm install

# start app
RUN npm run build
EXPOSE 3000
CMD npm run start