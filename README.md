## Deploy

This demo can be deployed via CDK so you can see how this works in your own AWS Account.
Prerequisites:

* aws-cdk installed (https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html) and bootstrapped (https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html)
* npm installed
* credentials configured
    * account credentials
    * cdk account association: `export CDK_DEFAULT_ACCOUNT=<ACCOUNTID>`



```
chmod +x deploy.sh
./deploy.sh
```

This script will complete a series of actions that includes building the CDK deployment and the React App. The CDK consists of two Stacks that are deployed sequentially so that the API Gateway URL that is created in the Backend Stack can be passed to and used in the Frontend. The output from this will include the URL that is hosting the front end app.

## Cleanup

To remove deployed resources:

```
cdk destroy --all
```
