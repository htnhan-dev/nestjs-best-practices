import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiParamOptions,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { Delete, Get, Post, Put, Type, applyDecorators } from '@nestjs/common';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type ParamOptions = ApiParamOptions & {
  name: string;
};

export type QueryOption = {
  required?: boolean;
  description?: string;
  example?: unknown;
  default?: unknown;
};

export interface EndpointConfig<
  TBody = unknown,
  TQuery = unknown,
  TRes = unknown,
> {
  title: string;
  success: string;

  /** Optional responses */
  badRequest?: string;
  conflict?: string;
  notFound?: string;

  /** OpenAPI schemas */
  body?: Type<TBody>;
  query?: TQuery;
  param?: ParamOptions;
  responseType?: Type<TRes>;
  isArray?: boolean;

  /** HTTP method */
  method: HttpMethod;

  /** For file upload */
  consumesMultipart?: boolean;
}

const methodDecoratorMap: Record<
  HttpMethod,
  (...args: unknown[]) => MethodDecorator
> = {
  GET: Get,
  POST: Post,
  PUT: Put,
  DELETE: Delete,
};

function createResponse(
  status: number,
  description: string,
  type?: Type<unknown>,
  isArray?: boolean,
) {
  if (type) {
    const schema = isArray
      ? { type: 'array', items: { $ref: getSchemaPath(type) } }
      : { $ref: getSchemaPath(type) };

    return ApiResponse({ status, description, schema });
  }

  return ApiResponse({ status, description });
}

export function ApiEndpoint<TBody = unknown, TQuery = unknown, TRes = unknown>(
  config: EndpointConfig<TBody, TQuery, TRes>,
) {
  const decorators: Array<ClassDecorator | MethodDecorator> = [];

  // Summary
  decorators.push(ApiOperation({ summary: config.title }));

  // Global responses
  decorators.push(
    createResponse(400, config.badRequest ?? 'Bad Request'),
    createResponse(409, config.conflict ?? 'Conflict'),
    createResponse(404, config.notFound ?? 'Not Found'),
    createResponse(500, 'Internal Server Error'),
  );

  // Body
  if (config.body) {
    decorators.push(ApiBody({ type: config.body }));
  }

  // Query
  if (config.query) {
    const queryObj = config.query as Record<string, QueryOption>;

    Object.entries(queryObj).forEach(([name, options]) => {
      decorators.push(
        ApiQuery({
          name,
          required: options.required ?? false,
          description: options.description,
          example: options.example,
          default: options.default,
        }),
      );
    });
  }

  // Params
  if (config.param) {
    const params = Array.isArray(config.param) ? config.param : [config.param];

    params.forEach((p) => {
      decorators.push(
        ApiParam({
          name: p.name,
          required: p.required ?? true,
          type: p.type ?? String,
          description: p.description,
        }),
      );
    });
  }

  // Multipart
  if (config.consumesMultipart) {
    decorators.push(ApiConsumes('multipart/form-data'));
  }

  // Success response
  const successStatus =
    config.method === 'POST'
      ? 201
      : config.method === 'DELETE'
        ? 200
        : config.method === 'PUT'
          ? 200
          : 200;

  decorators.push(
    createResponse(
      successStatus,
      config.success,
      config.responseType,
      config.isArray,
    ),
  );

  // Add model for Swagger
  if (config.responseType) {
    decorators.push(ApiExtraModels(config.responseType));
  }

  // Add HTTP method decorator
  const methodDecoratorFactory = methodDecoratorMap[config.method];
  if (typeof methodDecoratorFactory === 'function') {
    decorators.push(methodDecoratorFactory());
  }

  return applyDecorators(...decorators);
}

export function ApiEndpointAuth<
  TBody = unknown,
  TQuery = unknown,
  TRes = unknown,
>(config: EndpointConfig<TBody, TQuery, TRes>) {
  return applyDecorators(ApiBearerAuth(), ApiEndpoint(config));
}
