// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0


var AWS = require('aws-sdk');
const chime = new AWS.Chime({ region: 'us-east-1' });
chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com/console');
const utils = require('utils');

// Read resource names from the environment
const meetingsTableName = process.env.MEETINGS_TABLE_NAME;
const attendeesTableName = process.env.ATTENDEES_TABLE_NAME;

exports.handler = async (event, context, callback) => {
    var response = {
      "statusCode": 200,
      "headers": { 
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Credentials": true },
      "body": '',
      "isBase64Encoded": false
    };
    const meeting = event.queryStringParameters.meeting.trim();
    const breakout = event.queryStringParameters.breakout.trim();
    const region = event.queryStringParameters.region.trim() || 'us-east-1';
    
    if (!meeting) {
      response["statusCode"] = 400;
      response["body"] = "Must provide title";
      callback(null, response);
      return;
    }
  
    let meetingInfo = await utils.getMeeting(breakout);
    if (!meetingInfo) {
      const request = {
        ClientRequestToken: utils.uuid(),
        MediaRegion: region
      };
      console.info('Creating new meeting: ' + JSON.stringify(request));
      meetingInfo = await chime.createMeeting(request).promise();
      await utils.putBreakoutMeeting(meeting, breakout, meetingInfo);
    }
  
    const joinInfo = {
      JoinInfo: {
        Title: meeting,
        Meeting: meetingInfo.Meeting,
      },
    };
  
    response.body = JSON.stringify(joinInfo, '', 2);
    callback(null, response);
  };
  