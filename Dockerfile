FROM node:14-alpine
RUN apk --no-cache add bash curl grep tzdata

# Setting user name
ARG USER=regnutes

# Setting home directory to install application
ARG HOME=/home/${USER}

# Setting application name
ARG SERVICE=notification

# Creating user
RUN addgroup ${USER} && adduser -DG ${USER} ${USER}

# Setting user
USER ${USER}

# Create app directory
RUN mkdir -p ${HOME}/${SERVICE}
WORKDIR ${HOME}/${SERVICE}

# Install app dependencies
COPY package.json ${HOME}/${SERVICE}
RUN npm install

# Copy app source
COPY . ${HOME}/${SERVICE}

# Build app
RUN npm run build

EXPOSE 7000
EXPOSE 7001

CMD ["npm", "start"]
