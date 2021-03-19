// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import cloudfront = require('@aws-cdk/aws-cloudfront');
import s3 = require('@aws-cdk/aws-s3');
import s3deploy = require('@aws-cdk/aws-s3-deployment');
import cdk = require('@aws-cdk/core');
import { Construct } from '@aws-cdk/core';
import iam = require('@aws-cdk/aws-iam')

export class FrontEnd extends Construct {
    constructor(parent: Construct, name: string) {
        super(parent, name);

        // Creates S3 bucket for Website Hosting.  This bucket will empty and delete on destroy.
        const siteBucket = new s3.Bucket(this, 'SiteBucket', {
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'index.html',
            publicReadAccess: false,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true 
        });
        new cdk.CfnOutput(this, 'Bucket', { value: siteBucket.bucketName });

        // Creates OAI for Cloudfront to allow access to S3 bucket for Cloudfront
        const distributionOAI = new cloudfront.OriginAccessIdentity(this, 'OAI', {
            comment: "distribution OAI"
        })

        // Creates Cloudfront Distribution to use S3 bucket as Website
        const distribution = new cloudfront.CloudFrontWebDistribution(this, 'SiteDistribution', {
            errorConfigurations: [
                {
                    errorCode: 404,
                    responseCode: 200,
                    responsePagePath: '/index.html',
                }
            ],
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: siteBucket,
                        originAccessIdentity: distributionOAI
                    },
                    behaviors : [ {isDefaultBehavior: true}],
                },
            ],
        });
        new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
        new cdk.CfnOutput(this, "siteURL", {
            value: 'https://' + distribution.distributionDomainName
        })
        
        // Creates IAM Policy to allow Cloudfront access to S3
        const policyStatement = new iam.PolicyStatement();
        policyStatement.addActions('s3:GetBucket*');
        policyStatement.addActions('s3:GetObject*');
        policyStatement.addActions('s3:List*');
        policyStatement.addResources(siteBucket.bucketArn);
        policyStatement.addResources(`${siteBucket.bucketArn}/*`);
        policyStatement.addCanonicalUserPrincipal(distributionOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId);
    
        siteBucket.addToResourcePolicy(policyStatement);

        // Copies files from React App up to S3 bucket for website
        new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
            sources: [ s3deploy.Source.asset('front-end-resources/react-meeting/build') ],
            destinationBucket: siteBucket,
            distribution,
            distributionPaths: ['/*'],
          });
    }
}
