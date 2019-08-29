FROM node:8.15-alpine

# Setup environment
RUN apk update && \
    apk add --virtual .build-deps --update --no-cache openssl ca-certificates && \
    update-ca-certificates && \
    apk del .build-deps && \
    apk add --no-cache git

# Install tyscan from source
RUN mkdir /tyscan
COPY . /tyscan
WORKDIR /tyscan
RUN npm install && npm run build && npm link

# Install peer dependencies
RUN export npm_config_global=true && npx npm-install-peers

WORKDIR /workdir
ENTRYPOINT [ "tyscan" ]
