import * as AWS from 'aws-sdk'

import { createLogger } from '../utils/logger'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
let AWSXRay = require('aws-xray-sdk');

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('AttachUtils');
const s3 = new AWS.S3({
    signatureVersion: 'v4'
});
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

// TODO: Implement the fileStogare logic
export class AttachmentUtils {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {
    }

    async updateImageUrl(imageId: string, todoId: string) {
        let imageUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`;
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId: todoId
            },
            UpdateExpression: "set #attachmentUrl = :attachmentUrl",
            ExpressionAttributeNames: {
                "#attachmentUrl":"attachmentUrl"
            },
            ExpressionAttributeValues: {
                ":attachmentUrl": imageUrl
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()
        logger.info('Item created successfully');
        return imageUrl;
    }

    async getUploadUrl(imageId: string) {
        logger.info('Creating upload signed url');
        return s3.getSignedUrl('putObject', {
            Bucket: bucketName,
            Key: imageId,
            Expires: JSON.parse(urlExpiration)
        })
        
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance');
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}