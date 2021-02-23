# Image Optimizer - Lambda

Image optimizer using [Serverless Framework](https://www.serverless.com/) and [AWS Lambda](https://aws.amazon.com/lambda/).

## Setup project 

Install [Serverless Framework CLI](https://www.serverless.com/framework/docs/providers/aws/cli-reference/).

Install and configure access credentials via [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html):

```bash
aws configure
```
Create unique bucket in AWS account:

```bash
sh setup/aws.hs
```

Update environment bucket name in **serverless.yml** file:

```yaml
environment:
  BUCKET_NAME: images-optmized-upload
```
## Run project

Execute localhost:

```bash
npm run start:local
```

Deploy for AWS account:

```bash
npm run deploy 
```

## Endpoint

```curl
curl --location --request POST 'http://localhost:3000/dev/upload' image-optimizer-lambda \
--form 'file=@"{YOUR_PATH}/Photo.jpg"'
```
