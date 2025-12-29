#!/bin/bash
set -e

mongoimport --host localhost \
            --db seedsdb \
            --collection seeds \
            --type json \
            --file /data/seeds.json \
            --jsonArray \
            --drop

