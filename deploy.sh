#!/bin/bash

## Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
## SPDX-License-Identifier: Apache-2.0

set -e

if [ -f "cdk.context.json" ]; then
    echo ""
    echo "INFO: Removing cdk.context.json"
    rm cdk.context.json
else
    echo ""
    echo "INFO: cdk.context.json not present, nothing to remove"
fi
npm install
if [ ! -d "front-end-resources/react-meeting/build" ]; then
    echo ""
    echo "Creating front-end-resources/react-meeting/build directory"
    echo ""
    mkdir front-end-resources/react-meeting/build
fi
echo ""
echo "Building CDK"
echo ""
npm run build
echo ""
echo "Deploying Back End"
echo ""
npx cdk deploy MeetingBackEnd -O front-end-resources/react-meeting/src/cdk-outputs.json
echo ""
echo "Building React App"
echo ""
pushd front-end-resources/react-meeting
npm install --legacy-peer-deps
npm run build
popd
echo ""
echo "Deploying Front End"
echo ""
npx cdk deploy MeetingFrontEnd
