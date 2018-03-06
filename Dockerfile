FROM node:alpine
COPY --chown=node:node dist/ /var/www/
USER node
LABEL version="1.2.0"
WORKDIR /var/www
ENV NODE_ENV production
ENV PORT 8082
RUN npm i --production
EXPOSE 8082
ENTRYPOINT ["npm"]
CMD ["start"]
