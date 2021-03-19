// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import dynamodb = require('@aws-cdk/aws-dynamodb');
import lambda = require('@aws-cdk/aws-lambda');
import { Construct } from '@aws-cdk/core';
import cdk = require('@aws-cdk/core');
import apigateway = require('@aws-cdk/aws-apigateway'); 
import iam = require('@aws-cdk/aws-iam')

export class BackEnd extends Construct {
    constructor(parent: Construct, name: string) {
        super(parent, name);

        // Creates Meetings table for storage of meeting information
        const meetingsTable = new dynamodb.Table(this, 'meetings', {
            partitionKey: {
              name: 'Title',
              type: dynamodb.AttributeType.STRING
            },
            tableName: 'meetings',
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            timeToLiveAttribute: 'TTL',
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,            
        });

        // New to Breakout Rooms - adds a GSI that is used to correlate Parent Meeting with Breakout Meeting
        meetingsTable.addGlobalSecondaryIndex ({
          indexName: "ParentMeeting",
          partitionKey: {
            name: 'ParentMeeting',
            type: dynamodb.AttributeType.STRING
          }})


        // Creates Attendee Table for storage of attendee information
        const attendeeTable = new dynamodb.Table(this, 'attendees', {
          partitionKey: {
            name: 'AttendeeId',
            type: dynamodb.AttributeType.STRING
          },
          tableName: 'attendees',
          removalPolicy: cdk.RemovalPolicy.DESTROY,
          billingMode: dynamodb.BillingMode.PAY_PER_REQUEST
        });

        // IAM Role and Policy to be used by Lambda functions
        const lambdaChimeRole = new iam.Role(this, 'LambdaChimeRole', {
          assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        });
    
        lambdaChimeRole.addToPolicy(new iam.PolicyStatement({
          resources: ['*'],
          actions: ['chime:CreateMeeting',
                    'chime:CreateMeeting',
                    'chime:CreateMeeting',
                    'chime:DeleteMeeting',
                    'chime:GetMeeting',
                    'chime:ListMeetings',
                    'chime:BatchCreateAttendee',
                    'chime:CreateAttendee',
                    'chime:DeleteAttendee',
                    'chime:GetAttendee',
                    'chime:ListAttendees',
        ]}));

        lambdaChimeRole.addToPolicy(new iam.PolicyStatement({
          resources: ['*'],
          actions: ['logs:CreateLogStream',
                    'logs:PutLogEvents',
                    'logs:DescribeLogStreams']
        }));

        lambdaChimeRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"));

        const lambdaLogsRole = new iam.Role(this, 'LambdaLogRole', {
          assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        });

        lambdaLogsRole.addToPolicy(new iam.PolicyStatement({
          resources: ['*'],
          actions: ['logs:CreateLogStream',
                    'logs:PutLogEvents',
                    'logs:DescribeLogStreams']
        }));

        lambdaLogsRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"));        

        // Creates Lambda Layer with Utility functions from lambda-layer/nodejs/node_modules/ directory
        const layer = new lambda.LayerVersion(this, 'MeetingUtilsLayer', {
            code: new lambda.AssetCode('back-end-resources/lambda-layer'),
            compatibleRuntimes: [lambda.Runtime.NODEJS_12_X],
            license: 'Apache-2.0',
            description: 'Meeting Utils Layer',
        });

        // Creates Lambda functions from src directory for each different function
        // Each function is created from a specific file
        // A layer is attached to each function to provide utility functions
        // Environment Variables are added for DynamoDB tables
        // An approriate role is associated to each Lambda
        const joinLambda = new lambda.Function(this, 'joinMeeting', {
            code: lambda.Code.fromAsset("back-end-resources/src", {exclude: ["**", "!join.js"]}),
            handler: 'join.handler',
            runtime: lambda.Runtime.NODEJS_12_X,
            environment: {
              MEETINGS_TABLE_NAME: meetingsTable.tableName,
              ATTENDEES_TABLE_NAME: attendeeTable.tableName,
            },
            layers: [layer],
            role: lambdaChimeRole
        });

        const attendeeLambda = new lambda.Function(this, 'attendeeMeeting', {
            code: lambda.Code.fromAsset("back-end-resources/src", {exclude: ["**", "!attendee.js"]}),
            handler: 'attendee.handler',
            runtime: lambda.Runtime.NODEJS_12_X,
            environment: {
              MEETINGS_TABLE_NAME: meetingsTable.tableName,
              ATTENDEES_TABLE_NAME: attendeeTable.tableName,
            },
            layers: [layer],
            role: lambdaChimeRole
        });

        const endLambda = new lambda.Function(this, 'end', {
            code: lambda.Code.fromAsset("back-end-resources/src", {exclude: ["**", "!end.js"]}),
            handler: 'end.handler',
            runtime: lambda.Runtime.NODEJS_12_X,
            environment: {
              MEETINGS_TABLE_NAME: meetingsTable.tableName,
              ATTENDEES_TABLE_NAME: attendeeTable.tableName,
            },
            layers: [layer],
            role: lambdaChimeRole
        });

        const logsLambda = new lambda.Function(this, 'logs', {
          code: lambda.Code.fromAsset("back-end-resources/src", {exclude: ["**", "!logs.js"]}),
          handler: 'logs.handler',
          runtime: lambda.Runtime.NODEJS_12_X,
          environment: {
            MEETINGS_TABLE_NAME: meetingsTable.tableName,
            ATTENDEES_TABLE_NAME: attendeeTable.tableName,
          },
          layers: [layer],
          role: lambdaLogsRole
        });

        const breakoutsLambda = new lambda.Function(this, 'breakout', {
          code: lambda.Code.fromAsset("back-end-resources/src", { exclude: ["**", "!breakouts.js"] }),
          handler: 'breakouts.handler',
          runtime: lambda.Runtime.NODEJS_12_X,
          environment: {
              MEETINGS_TABLE_NAME: meetingsTable.tableName,
              ATTENDEES_TABLE_NAME: attendeeTable.tableName,
          },
          layers: [layer],
          role: lambdaChimeRole
        });        

        const createLambda = new lambda.Function(this, 'create', {
          code: lambda.Code.fromAsset("back-end-resources/src", {exclude: ["**", "!create.js"]}),
          handler: 'create.handler',
          runtime: lambda.Runtime.NODEJS_12_X,
          environment: {
            MEETINGS_TABLE_NAME: meetingsTable.tableName,
            ATTENDEES_TABLE_NAME: attendeeTable.tableName,
          },
          layers: [layer],
          role: lambdaChimeRole
         });           

         // Permissions are granted to each Lambda to allow it to RW DynamoDB Tables
         meetingsTable.grantReadWriteData(joinLambda);
         attendeeTable.grantReadWriteData(joinLambda);
         meetingsTable.grantReadWriteData(endLambda);
         attendeeTable.grantReadWriteData(endLambda);
         meetingsTable.grantReadWriteData(attendeeLambda);
         attendeeTable.grantReadWriteData(attendeeLambda);
         meetingsTable.grantReadWriteData(breakoutsLambda);
         attendeeTable.grantReadWriteData(breakoutsLambda);         
         meetingsTable.grantReadWriteData(createLambda);
         attendeeTable.grantReadWriteData(createLambda);         

        // Creates an API Gateway that is used by React App to make requests to Lambda functions
        const api = new apigateway.RestApi(this, 'meetingApi', {
            restApiName: 'Meeting BackEnd',
            endpointConfiguration: {
              types: [ apigateway.EndpointType.REGIONAL ]
            }
        });

        // This URL will be used in the Front End deployment
        const breakoutAPI = new cdk.CfnOutput(this, 'BreakoutAPIURL', { 
          value: api.url,
          exportName: "BreakoutAPIURL"
        });        

        breakoutAPI.overrideLogicalId('breakoutAPI')

        // Adds Methods and CORS to API Gateway
        const join = api.root.addResource('join');
        const joinIntegration = new apigateway.LambdaIntegration(joinLambda);
        join.addMethod('POST', joinIntegration);
        addCorsOptions(join);        
      
        const attendee = api.root.addResource('attendee');
        const attendeeIntegration = new apigateway.LambdaIntegration(attendeeLambda);
        attendee.addMethod('GET', attendeeIntegration);
        addCorsOptions(attendee);

        const end = api.root.addResource('end');
        const endIntegration = new apigateway.LambdaIntegration(endLambda);
        end.addMethod('POST', endIntegration);
        addCorsOptions(end);
        
        const logs = api.root.addResource('logs');
        const logsIntegration = new apigateway.LambdaIntegration(logsLambda);
        logs.addMethod('POST', logsIntegration);
        addCorsOptions(logs);

        const breakouts = api.root.addResource('breakouts');
        const breakoutsIntegration = new apigateway.LambdaIntegration(breakoutsLambda);
        breakouts.addMethod('POST', breakoutsIntegration);
        addCorsOptions(breakouts);


        const create = api.root.addResource('create');
        const createIntegration = new apigateway.LambdaIntegration(createLambda);
        create.addMethod('POST', createIntegration);
        addCorsOptions(create);
        
      }        
}

// Add CORS for API Gateways
export function addCorsOptions(apiResource: apigateway.IResource) {
  apiResource.addMethod('OPTIONS', new apigateway.MockIntegration({
    integrationResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
        'method.response.header.Access-Control-Allow-Origin': "'*'",
        'method.response.header.Access-Control-Allow-Credentials': "'false'",
        'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
      },
    }],
    passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
    requestTemplates: {
      "application/json": "{\"statusCode\": 200}"
    },
  }), {
    methodResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': true,
        'method.response.header.Access-Control-Allow-Methods': true,
        'method.response.header.Access-Control-Allow-Credentials': true,
        'method.response.header.Access-Control-Allow-Origin': true,
      },  
    }]
  })
}