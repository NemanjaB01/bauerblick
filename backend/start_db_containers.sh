#!/bin/bash

# Start MongoDB for usersdb on port 27017
docker run --name usersdb -d -p 27017:27017 mongo

# Start MongoDB for farmsdb on port 27018
docker run --name farmsdb -d -p 27018:27017 mongo

# Output the status of the containers
docker ps