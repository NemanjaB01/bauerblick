#!/bin/bash
set -e

mongoimport --host localhost \
            --username "$MONGO_INITDB_ROOT_USERNAME" \
            --password "$MONGO_INITDB_ROOT_PASSWORD" \
            --authenticationDatabase admin \
            --db seedsdb \
            --collection seed \
            --type json \
            --file /data/seeds.json \
            --jsonArray \
            --drop
