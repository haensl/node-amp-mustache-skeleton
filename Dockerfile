FROM node:alpine
COPY --chown=node:node dist/ /var/www/
USER node
LABEL version="1.3.1"
WORKDIR /var/www
ENV NODE_ENV production
ENV PORT 8080
RUN npm i --production
EXPOSE 8080
ENTRYPOINT ["npm"]
CMD ["start"]
