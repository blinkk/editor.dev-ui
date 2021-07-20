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

# Copy just the node requirement files to take advantage of
# Docker layer caching.
COPY ./website/package.json ./website/
COPY ./website/yarn.lock ./website/

# Install from the lock file.
RUN yarn install --frozen-lockfile

# Install from the lock file.
RUN cd website && yarn install --frozen-lockfile

# Copy files needed for compilation.
COPY ./webpack* ./
COPY ./tsconfig.json ./
COPY ./src ./src
COPY ./static ./static

# Copy website files.
COPY ./website/content ./website/content
COPY ./website/plugins ./website/plugins
COPY ./website/src ./website/src
COPY ./website/static ./website/static
COPY ./website/views ./website/views
COPY ./website/amagaki.ts ./website/amagaki.ts
COPY ./website/rollup.config.js ./website/rollup.config.js
COPY ./website/tsconfig.json ./website/tsconfig.json

# Compile the production js/css files.
RUN yarn run compile

# Having issues with git symlinks to generated files.
RUN echo "Copying symlinked files that do not register correctly." \
  # && cp ./dist/css/server/editor.css ./website/static/ \
  && cp ./dist/server/app.* ./website/static/ \
  && cp ./dist/server/gh.callback.min.js ./website/static/

# Build website.
RUN cd website && yarn run build:prod

# Copy public files.
RUN mkdir -p ./public/ \
  && cp -r ./website/build/* ./public/ \
  && cp static/example/* ./public/example/ \
  && cp dist/css/example/* ./public/example/ \
  && cp dist/example.* ./public/example/ \
  && ls -R ./public/

# Copy api documentation.
COPY ./api ./public/api

EXPOSE 8080

CMD [ "node", "dist/server/server.js" ]
