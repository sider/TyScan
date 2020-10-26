# NOTE: Use Alpine to reduce the image size.
FROM node:15-alpine AS build

WORKDIR /work
COPY package.json package-lock.json tsconfig.json ./
COPY bin ./bin
COPY src ./src
COPY sample ./sample
RUN npm ci && npm pack

FROM node:15-alpine

WORKDIR /work
COPY --from=build /work/tyscan-*.tgz /work/tyscan.tgz
RUN npm install -g typescript /work/tyscan.tgz && \
    rm /work/tyscan.tgz

ENTRYPOINT ["tyscan"]
