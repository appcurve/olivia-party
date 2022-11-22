# OliviaParty api

OliviaParty back-end API powered by NestJS.

The project uses shared zod schemas defined in `shared-data-api` for typing and run-time validation between application boundaries.

NestJS-friendly class-based DTO variations of zod schemas are implemented with the suffix `ApiDto` by project convention.

## Data Validation

Shared zod schemas are defined in the `shared-data-api` library: `/libs/shared/data/api` (import from `@firx/op-data-api`).

The project's `AppModule` (`app.module.ts`) loads the custom `ZodDtoValidationPipe` as a global NestJS pipe.

The package `@anatine/zod-nestjs` is used to bring zod + NestJS together and enable support for NestJS' approach to OpenAPI integration.

Project requirements:

- Define DTO's for both request + response bodies in TypeScript files with extension `.api-dto.ts`
- Name all zod-based DTO classes with the suffix `ApiDto` to distinguish them from non-class counterparts
- Use `createZodDto()` from `@anatine/zod-nestjs` to create a DTO class from a shared zod schema
- Use `extendApi()` from `@anatine/zod-openapi` to add OpenAPI documentation details that can be understood by NestJS

- Requests: use `*ApiDto` to type request bodies of controller handlers to validate with `ZodDtoValidationPipe`
- Responses: use `*Api.Dto.create(data)` to parse response `data` prior to sending it back to a client

Note that zod's default behaviour when parsing is to strip properties from input data that are not defined in the schema. This is particularly relevant to schemas corresponding to response DTO's. Refer to the docs for `strict()` for details on how to modify this behaviour if/as required.

Example:

```ts
import { createZodDto } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'
import { zUserProfile } from '@firx/op-data-api'

export const zUserProfileApiDto = extendApi(zUserProfile, {
  title: 'Update User Profile',
  description: "Update a user's profile record with details of timezone, locale, etc.",
})

export class UserProfileApiDto extends createZodDto(zUserProfileApiDto) {}
```

Controller handler methods that declare the type of a request `@Body` to be an instance of a zod-friendly `*ApiDto` class will be validated by `ZodDtoValidationPipe`:

```ts
@Post()
async createVideo(
@AuthUser() user: SanitizedUserInternalDto,
@Param('player', new ParseUUIDPipe({ version: '4' })) playerUuid: string,
@Body() dto: CreateVideoApiDto,
): Promise<VideoDto> {
  return this.videosService.createByUser(user, playerUuid, dto)
}
```

### class-validator and class-transformer

NestJS' documentation provides validation recipes that use `class-validator` and `class-transformer` for validation of class-based DTO's, entities, and other data. Many if not most NestJS projects use this validation stack.

This project includes these dependencies for the time being. They can sometimes be helpful in NestJS projects because the framework and libraries in its ecosystem make heavy use of classes and decorators.

Keep in mind that shared zod schemas as documented above are the definitive design choice for implementing validation in this project.

One benefit of class-validator is that it brings in validator.js and includes compatible validation functions of its own. These validation helpers can be useful in API development.

To validate a class-based DTO that supports class-transformer/class-validator, decorate controller classes or individual controller handler methods with `@UsePipes()` and add `ValidationPipe`. Use the included `validationPipeOptions` to add standard options that apply to this project:

```ts
@Post()
@UsePipes(new ValidationPipe(validationPipeOptions))
async createObject(
  @Body() dto: DtoClassWithClassValidatorDecorators
) { ... }
```

NestJS' `ValidationPipe` should not be added as a global pipe or else it will compete with the global `ZodDtoValidationPipe`.
