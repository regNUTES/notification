FROM registry.access.redhat.com/ubi8/nodejs-14:1

# Copy app source
COPY . .

# Install app dependencies
RUN npm install

# Build app
RUN npm run build

EXPOSE 7000
EXPOSE 7001

CMD ["npm", "start"]