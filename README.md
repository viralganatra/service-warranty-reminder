<div align="center">
<h1>Service Warranty Reminder 📅</h1>

<p>A project that sends notifications when a certificate is due to expire.</p>
</div>

<hr />

## What is this?

This project takes reads a Google Sheet, parses the expiry date of a given certificate and sends email notifications when it is due to expire. This is a simple project that was only designed for me, but if you wish to use it feel free to.

## Tech stack

This is a [Serverless](https://www.serverless.com/) project written in TypeScript that deploys a Lambda to AWS. It runs on a schedule of once a day. It uses [SparkPost](https://www.sparkpost.com/) to send email notifications.

## How does it work

It reads a Google Sheet in the following format:

| Property | Certificate Type | Expiry Date | Link        |
|----------|------------------|-------------|-------------|
| Foo      | Washing Machine  | 28-Mar-2031 | https://xxx |

And determines if a notification should be sent. A notification is sent if the certificate is expiring in either 14, 7 or 2 days time or if it has already expired.

## Configuration

Setup an AWS account and add the following secrets in AWS System Manager under Parameter Store:

### Dev

| Name                                                     | Type         | Value                                     |
|----------------------------------------------------------|--------------|-------------------------------------------|
| /dev/service-warranty-reminder/SparkPostApiKey           | SecureString | apiKey                                    |
| /dev/service-warranty-reminder/SparkPostEmailListId      | SecureString | listId                                    |
| /dev/service-warranty-reminder/emailFromAddress          | String       | test@test.com                             |
| /dev/service-warranty-reminder/googlePrivateKey          | SecureString | googlePrivateKey                          |
| /dev/service-warranty-reminder/googleServiceAccountEmail | SecureString | email@servicename.iam.gserviceaccount.com |
| /dev/service-warranty-reminder/googleSpreadsheetId       | SecureString | googleSpreadsheetId                       |

### Prod

| Name                                                     | Type         | Value                                     |
|----------------------------------------------------------|--------------|-------------------------------------------|
| /prod/service-warranty-reminder/SparkPostApiKey           | SecureString | apiKey                                    |
| /prod/service-warranty-reminder/SparkPostEmailListId      | SecureString | listId                                    |
| /prod/service-warranty-reminder/emailFromAddress          | String       | test@test.com                             |
| /prod/service-warranty-reminder/googlePrivateKey          | SecureString | googlePrivateKey                          |
| /prod/service-warranty-reminder/googleServiceAccountEmail | SecureString | email@servicename.iam.gserviceaccount.com |
| /prod/service-warranty-reminder/googleSpreadsheetId       | SecureString | googleSpreadsheetId                       |

### AWS SSO

In order to login to AWS, configure your account to create profiles for dev and prod, called `swr-production` and `swr-dev`.

In `~/.aws/config` add the following:

```
[sso-session swr]
sso_start_url = {startUrlFromAWS}
sso_region = {region}

[profile swr-dev]
sso_session = swr
sso_account_id = {accountId}
sso_role_name = AdministratorAccess
region = {region}

[profile swr-production]
sso_session = swr
sso_account_id = {accountId}
sso_role_name = AdministratorAccess
region = {region}
```

and in `~/.aws/credentials` add your user access key:

```
[swr-dev]
aws_access_key_id = aws_access_key_id
aws_secret_access_key = aws_secret_access_key

[swr-production]
aws_access_key_id = aws_access_key_id
aws_secret_access_key = aws_secret_access_key
```

### Policies

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "ManageBootstrapStateBucket",
            "Effect": "Allow",
            "Action": [
                "s3:CreateBucket",
                "s3:PutBucketVersioning",
                "s3:PutBucketNotification",
                "s3:PutBucketPolicy",
                "s3:DeleteObject",
                "s3:GetObject",
                "s3:ListBucket",
                "s3:PutObject"
            ],
            "Resource": [
                "arn:aws:s3:::sst-state-*"
            ]
        },
        {
            "Sid": "ManageBootstrapAssetBucket",
            "Effect": "Allow",
            "Action": [
                "s3:CreateBucket",
                "s3:PutBucketVersioning",
                "s3:PutBucketNotification",
                "s3:PutBucketPolicy",
                "s3:DeleteObject",
                "s3:GetObject",
                "s3:ListBucket",
                "s3:PutObject",
                "s3:PutObjectTagging",
                "s3:GetObjectTagging"
            ],
            "Resource": [
                "arn:aws:s3:::sst-asset-*"
            ]
        },
        {
            "Sid": "ManageBootstrapECRRepo",
            "Effect": "Allow",
            "Action": [
                "ecr:CreateRepository",
                "ecr:DescribeRepositories"
            ],
            "Resource": [
                "arn:aws:ecr:{AWS_REGION}:{AWS_ACCOUNT_ID}:repository/sst-asset"
            ]
        },
        {
            "Sid": "ManageBootstrapSSMParameter",
            "Effect": "Allow",
            "Action": [
                "ssm:GetParameters",
                "ssm:PutParameter"
            ],
            "Resource": [
                "arn:aws:ssm:{AWS_REGION}:{AWS_ACCOUNT_ID}:parameter/sst/passphrase/*",
                "arn:aws:ssm:{AWS_REGION}:{AWS_ACCOUNT_ID}:parameter/sst/bootstrap"
            ]
        },
        {
            "Sid": "ManageSecrets",
            "Effect": "Allow",
            "Action": [
                "ssm:DeleteParameter",
                "ssm:GetParameter",
                "ssm:GetParameters",
                "ssm:GetParametersByPath",
                "ssm:PutParameter"
            ],
            "Resource": [
                "arn:aws:ssm:{AWS_REGION}:{AWS_ACCOUNT_ID}:parameter/sst/*"
            ]
        }
    ]
}
```

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "LiveLambdaSocketConnection",
            "Effect": "Allow",
            "Action": [
                "iot:DescribeEndpoint",
                "iot:Connect",
                "iot:Subscribe",
                "iot:Publish",
                "iot:Receive"
            ],
            "Resource": [
                "*"
            ]
        },
        {
            "Sid": "AppSync",
            "Effect": "Allow",
            "Action": [
                "appsync:CreateApi",
                "appsync:CreateChannelNamespace"
            ],
            "Resource": [
                "arn:aws:appsync:{AWS_REGION:AWS_ACCOUNT_ID}:apis/*"
            ]
        },
        {
            "Sid": "ManageLogs",
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:TagResource",
                "logs:PutRetentionPolicy",
                "logs:ListTagsForResource",
                "logs:DeleteLogGroup"
            ],
            "Resource": [
                "arn:aws:logs:{AWS_REGION:AWS_ACCOUNT_ID}:log-group:/*"
            ]
        },
        {
            "Sid": "ManageLogStream",
            "Effect": "Allow",
            "Action": [
                "logs:DescribeLogGroups"
            ],
            "Resource": [
                "*"
            ]
        },
        {
            "Sid": "ManageEvents",
            "Effect": "Allow",
            "Action": [
                "events:TagResource",
                "events:PutRule",
                "events:DescribeRule",
                "events:ListTagsForResource",
                "events:DeleteRule",
                "events:PutTargets",
                "events:ListTargetsByRule",
                "events:RemoveTargets"
            ],
            "Resource": [
                "arn:aws:events:{AWS_REGION:AWS_ACCOUNT_ID}:rule/*"
            ]
        },
        {
            "Sid": "CreateIamRole",
            "Effect": "Allow",
            "Action": [
                "iam:CreateRole",
                "iam:TagRole",
                "iam:PutRolePolicy",
                "iam:ListInstanceProfilesForRole",
                "iam:AttachRolePolicy",
                "iam:GetRole",
                "iam:ListRolePolicies",
                "iam:GetRolePolicy",
                "iam:ListAttachedRolePolicies",
                "iam:PassRole",
                "iam:DeleteRole",
                "iam:DetachRolePolicy",
                "iam:DeleteRolePolicy"
            ],
            "Resource": [
                "arn:aws:iam::{AWS_ACCOUNT_ID}:role/*"
            ]
        },
        {
            "Sid": "ManageLambda",
            "Effect": "Allow",
            "Action": [
                "lambda:CreateFunction",
                "lambda:GetFunction",
                "lambda:GetFunctionCodeSigningConfig",
                "lambda:DeleteFunction",
                "lambda:GetPolicy"
            ],
            "Resource": [
                "arn:aws:lambda:{AWS_REGION:AWS_ACCOUNT_ID}:*"
            ]
        },
        {
            "Sid": "ManageLambdaTaggging",
            "Effect": "Allow",
            "Action": [
                "lambda:TagResource",
                "lambda:ListVersionsByFunction",
                "lambda:AddPermission",
                "lambda:RemovePermission"
            ],
            "Resource": [
                "*"
            ]
        }
    ]
}
```

## License

[MIT](LICENSE)
