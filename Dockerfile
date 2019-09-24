FROM node:10-alpine

# Setup environment
RUN apk update && \
    apk add --virtual .build-deps --update --no-cache openssl ca-certificates && \
    update-ca-certificates && \
    apk del .build-deps && \
    apk add --no-cache git

# Install tyscan from source
RUN mkdir /tyscan
COPY package.json package-lock.json tsconfig.json /tyscan/
COPY bin /tyscan/bin
COPY src /tyscan/src
WORKDIR /tyscan
RUN npm ci && npm run build && npm link

# Install peer dependencies
RUN export npm_config_global=true && npx npm-install-peers

WORKDIR /work
ENTRYPOINT [ "tyscan" ]
