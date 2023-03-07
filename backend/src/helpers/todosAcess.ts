import * as AWS from 'aws-sdk'

import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { parseUserId } from '../auth/utils';

let AWSXRay = require('aws-xray-sdk');

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE) {
  }

  async getAllTodos(jwt: string): Promise<TodoItem[]> {
    logger.info('Getting all todos');
    const result = await this.docClient.scan({
      TableName: this.todosTable,
      Limit:50,
      FilterExpression: 'userId = :userId',
      ExpressionAttributeValues: { ":userId": parseUserId(jwt) },
      
    }).promise();
    logger.info('List all todos',result);
    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info("creating item ", todo);
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()
    logger.info('Item created successfully', todo);
    return todo as TodoItem;
  }

  async updateTodo(todo: TodoUpdate, itemId: string): Promise<TodoUpdate> {
    logger.info("Updating todo item", itemId);
    var params = {
      TableName: this.todosTable,
      Key: {
        todoId: itemId
      },
      UpdateExpression: "set #name = :name, #dueDate = :dueDate, #done = :done",
      ExpressionAttributeNames: {
        "#name": "name",
        "#dueDate": "dueDate",
        "#done": "done"
      },
      ExpressionAttributeValues: {
        ":name": todo.name,
        ":dueDate": todo.dueDate,
        ":done": todo.done
      },
      ReturnValues: "UPDATED_NEW"
    };
    await this.docClient.update(params).promise();
    logger.info("Todo item successfully updated ", itemId);
    return todo as TodoUpdate
  }

  async deleteTodo(itemId: string) {
    await this.docClient.delete({
      TableName: this.todosTable,
      "Key": {
        "todoId": itemId
      }
    }).promise()
    logger.info("Successfully deleted todo item", itemId);
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
