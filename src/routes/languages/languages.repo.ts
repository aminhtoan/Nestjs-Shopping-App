import { Injectable } from '@nestjs/common'
import { CreateLanguageBodyType, LanguageType } from './languages.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import { UserType } from 'src/shared/models/shared-user.model'

@Injectable()
export class LanguagesRespository {
  constructor(private readonly prismaService: PrismaService) {}

  async createLanguage(
    body: CreateLanguageBodyType & Pick<UserType, 'createdById' | 'updatedById'>,
  ): Promise<LanguageType> {
    return await this.prismaService.language.create({
      data: body,
    })
  }

  async findAllLanguage(): Promise<LanguageType[]> {
    return await this.prismaService.language.findMany({
      where: {
        deletedAt: null,
      },
    })
  }

  async findLanguageById(id: string): Promise<LanguageType> {
    return await this.prismaService.language.findUniqueOrThrow({
      where: {
        id,
        deletedAt: null,
      },
    })
  }

  async deleleById(id: string, hard: boolean, userId: number): Promise<LanguageType> {
    return hard === true
      ? await this.prismaService.language.delete({
          where: { id, deletedAt: null },
        })
      : await this.prismaService.language.update({
          where: { id, deletedAt: null },
          data: {
            deletedById: userId,
            deletedAt: new Date(),
          },
        })
  }

  async updateLanguage(id: string, data: Partial<Pick<LanguageType, 'name' | 'updatedById'>>): Promise<LanguageType> {
    return await this.prismaService.language.update({
      where: { id },
      data,
    })
  }
}
