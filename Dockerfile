FROM node:14

WORKDIR /usr/src/app

ENV MODE=prod
ENV PROJECT_ID=grow-prod

# Upgrade base image and cleanup.
RUN apt-get update \
  && apt-get -qq upgrade \
  && apt-get -qq autoremove \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copy just the node requirement files to take advantage of
# Docker layer caching.
COPY ./package.json ./
COPY ./yarn.lock ./

# Install from the lock file.
RUN yarn install --frozen-lockfile

# Copy files needed for compilation.
COPY ./webpack* ./
COPY ./gulpfile.js ./
COPY ./tsconfig.json ./
COPY ./sass ./sass
COPY ./src ./src
COPY ./views ./views

# Compile the production js/css files.
RUN yarn run compile

# Copy the static files.
# Use `public` directory to keep from serving source files.
COPY ./static/server/* ./public/

# Copy public files.
RUN cp ./dist/css/server/editor.min.css ./public/ \
  && cp ./dist/src/server/editor.* ./public/ \
  && cp -r ./dist/src/server/gh ./public/gh

# Copy api documentation.
COPY ./api/* ./public/api/

EXPOSE 8080

CMD [ "node", "dist/src/server/server.js" ]
