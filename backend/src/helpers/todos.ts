import { TodoAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import { parseUserId } from '../auth/utils'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic
const todoAccess = new TodoAccess();
const attachmentUtil = new AttachmentUtils();

export async function getTodosForUser(jwtToken: string): Promise<TodoItem[]> {
    return todoAccess.getAllTodos(jwtToken);
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string
): Promise<TodoItem> {

    const itemId = uuid.v4()
    const userId = parseUserId(jwtToken)

    return await todoAccess.createTodo({
        todoId: itemId,
        userId: userId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false,
        attachmentUrl: null
    });
}

export async function updateTodo(
    updateTodoRequest: UpdateTodoRequest,
    itemId: string,
): Promise<TodoUpdate> {
    return await todoAccess.updateTodo({
        name: updateTodoRequest.name,
        dueDate: updateTodoRequest.dueDate,
        done: updateTodoRequest.done,
    }, itemId);
}

export async function deleteTodo(itemId: string) {
    return await todoAccess.deleteTodo(itemId)
}


export async function createAttachmentPresignedUrl(imageId: string) {
    return await attachmentUtil.getUploadUrl(imageId);
}

export async function getImageUrl(imageId: string, todoId: string) {
    return await attachmentUtil.updateImageUrl(imageId, todoId);
}
