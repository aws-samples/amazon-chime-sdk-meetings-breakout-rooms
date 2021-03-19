// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0


var AWS = require('aws-sdk');
const chime = new AWS.Chime({ region: 'us-east-1' });
chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com/console');
const utils = require('utils');

exports.handler = async (event, context, callback) => {
  var response = {
    "statusCode": 200,
    "headers": { 
      "Access-Control-Allow-Origin": "*", 
      "Access-Control-Allow-Credentials": true },
    "body": '',
    "isBase64Encoded": false
  };
  const meeting = event.queryStringParameters.meeting;

  if (!meeting) {
    response["statusCode"] = 400;
    response["body"] = "Must provide title";
    callback(null, response);
    return;
  }

  let meetingInfo = await utils.getBreakoutMeeting(meeting);

  response.body = JSON.stringify(meetingInfo, '', 2);
  callback(null, response);
};
