FROM node:22-bullseye AS build
WORKDIR /app

RUN npm install -g corepack@latest && corepack enable pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm i --frozen-lockfile

COPY . .
RUN pnpm build

FROM scratch AS static
COPY --from=build /app/dist /dist

FROM nginxinc/nginx-unprivileged:1-alpine AS nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
