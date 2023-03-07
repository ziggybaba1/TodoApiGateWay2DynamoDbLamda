import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import * as uuid from 'uuid'
import { createAttachmentPresignedUrl, getImageUrl } from '../../helpers/todos'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    // const newItem = await createImage(groupId, imageId, event)
    const imageId = uuid.v4()
    const imageUrl = await getImageUrl(imageId, todoId)
    const uploadUrl = await createAttachmentPresignedUrl(imageId)
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        imageUrl: imageUrl,
        uploadUrl: uploadUrl,
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )