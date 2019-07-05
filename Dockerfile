FROM  node:8.15-alpine


# Setup environment
RUN apk update && \
    apk add --virtual .build-deps --update --no-cache openssl ca-certificates && \
    update-ca-certificates && \
    apk del .build-deps && \
    apk add --no-cache git

# Install typescript
RUN npm install -g typescript@3.5.2

# Install tyscan from source
RUN mkdir /tyscan
COPY . /tyscan
RUN cd /tyscan && npm install && npm run build && npm link


WORKDIR /workdir
ENTRYPOINT [ "tyscan" ]
