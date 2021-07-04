FROM node:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install
RUN cat /dev/urandom | head | base64 > ./config/secret.key
RUN npm build
EXPOSE 7500
CMD ['npm', 'run', 'start:prod']