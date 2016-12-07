#!/bin/bash

##
# update-lambda.sh
#
# Updates an AWS Lambda function with the contents of the ./lambda folder
# Requires that the AWS CLI Tools [https://aws.amazon.com/cli/] are available.
#
# Author: Henry Cooke <henry.cooke@bbc.co.uk>
# Version: 0.33
#

ZIPFILE="payload.zip" 
SKILL_DIR="src"

# exit on errors
set -e

# delete stale zip, if present
if [ -f $ZIPFILE ]; then rm $ZIPFILE; fi

# create new code package zip
cd $SKILL_DIR
## install npm modules
npm install --production
echo "zipping skill folder..."
zip -r --quiet ../$ZIPFILE *
cd ..
echo "uploading..."
aws lambda update-function-code --function-name $LAMBDA_FUNCTION --zip-file fileb://$ZIPFILE
rm $ZIPFILE