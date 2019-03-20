FROM  node:8.15-alpine

RUN apk update && \
    apk add --virtual .build-deps --update --no-cache openssl ca-certificates && \
    update-ca-certificates

ENV TYSCAN_VERSION 0.1.4
RUN npm install -g "typescript@3.3.3333"
RUN npm install -g "tyscan@${TYSCAN_VERSION}"

RUN apk del .build-deps

WORKDIR /workdir

ENTRYPOINT [ "tyscan" ]
