#!/bin/bash

# Stop the usersdb container
docker stop usersdb

# Remove the usersdb container
docker rm usersdb

# Stop the farmsdb container
docker stop farmsdb

# Remove the farmsdb container
docker rm farmsdb

# Output the status of the containers
docker ps -a
