# build environment
FROM node:14-alpine as build
WORKDIR /kine-backend/front-end/kine-ui-registration
ENV PATH //kine-backend/front-end/kine-ui-registration/node_modules/.bin:$PATH
#COPY ./package.json ./
#COPY ./package-lock.json ./
COPY . ./
RUN npm rebuild node-sass --force
RUN yarn
RUN yarn build

# production environment
FROM nginx:alpine
#COPY --from=build /kine-frontend1/kine-ui-registration/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /kine-backend/front-end/kine-ui-registration/dist /usr/share/nginx/html
EXPOSE 88
CMD ["nginx", "-g", "daemon off;"]
