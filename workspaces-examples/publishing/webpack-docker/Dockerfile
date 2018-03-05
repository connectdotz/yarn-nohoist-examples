FROM node:latest

WORKDIR /workspaces

# add code
COPY . /workspaces
RUN yarn install --frozen-lockfile --no-cache  
RUN yarn build

CMD yarn run-app