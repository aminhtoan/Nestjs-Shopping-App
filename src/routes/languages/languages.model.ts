import z from 'zod'

const LanguageSchema = z.object({
  id: z.string().max(10),
  name: z.string(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const CreateLanguageBodySchema = LanguageSchema.pick({
  id: true,
  name: true,
})

export const GetAllLanguagesResSchema = z.object({
  data: z.array(LanguageSchema),
  totalItems: z.number(),
})

export const GetLanguageResSchema = LanguageSchema

export const UpdateLanguageBodySchema = LanguageSchema.pick({
  name: true,
})

export const GetLanguageParamsSchema = z
  .object({
    languageId: z.string().max(10),
  })
  .strict()

export type LanguageType = z.infer<typeof LanguageSchema>
export type CreateLanguageBodyType = z.infer<typeof CreateLanguageBodySchema>
export type GetAllLanguagesResType = z.infer<typeof GetAllLanguagesResSchema>
export type GetLanguageResType = z.infer<typeof GetLanguageResSchema>
export type UpdateLanguageBodyType = z.infer<typeof UpdateLanguageBodySchema>
export type GetLanguageParamsType = z.infer<typeof GetLanguageParamsSchema>
