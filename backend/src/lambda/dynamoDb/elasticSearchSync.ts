// import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda'
// import 'source-map-support/register'
// import * as elasticsearch from 'elasticsearch'
// import { createLogger } from '../../utils/logger'
// import * as httpAwsEs from 'http-aws-es'

// const esHost = process.env.ES_ENDPOINT

// const es = new elasticsearch.Client({
//   hosts: [ esHost ],
//   connectionClass: httpAwsEs
// })

// const logger = createLogger('TodosAccess')

// export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
//   logger.info('Processing events batch from DynamoDB', JSON.stringify(event))

//   for (const record of event.Records) {
//     logger.info('Processing record', JSON.stringify(record))
//     if (record.eventName !== 'INSERT') {
//       continue
//     }

//     const newItem = record.dynamodb.NewImage;

//     const imageId = newItem.todoId.S

//     const body = {
//         todoId: newItem.todoId.S,
//         userId: newItem.userId.S,
//         createdAt: newItem.createdAt.S,
//         name: newItem.name.S,
//         dueDate: newItem.dueDate.S,
//         done: newItem.done.S,
//         attachmentUrl: newItem.attachmentUrl.S
//     }

//     await es.index({
//       index: 'todo-index',
//       type: 'todo',
//       id: todoId,
//       body
//     })
//     logger.info('Process events batch from DynamoDB Added to elastic search', JSON.stringify(body))
//   }
// }
