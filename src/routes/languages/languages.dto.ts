import { createZodDto } from 'nestjs-zod'
import {
  CreateLanguageBodySchema,
  GetAllLanguagesResSchema,
  GetLanguageParamsSchema,
  GetLanguageResSchema,
  UpdateLanguageBodySchema,
} from './languages.model'

export class CreateLanguageBodyDTO extends createZodDto(CreateLanguageBodySchema) {}
export class GetAllLanguagesResDTO extends createZodDto(GetAllLanguagesResSchema) {}
export class GetLanguageResDTO extends createZodDto(GetLanguageResSchema) {}
export class UpdateLanguageBodyDTO extends createZodDto(UpdateLanguageBodySchema) {}
export class GetLanguageParamsDTO extends createZodDto(GetLanguageParamsSchema) {}
