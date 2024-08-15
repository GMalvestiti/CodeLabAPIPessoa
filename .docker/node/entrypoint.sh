#!/bin/bash

echo "Container em execução"

# tail -f /dev/null

mkdir -p tmp/export

# npm dedupe

npm install --legacy-peer-deps

npm run start:debug