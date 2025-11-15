import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { CreateLanguageBodyType, UpdateLanguageBodyType } from './languages.model'
import { LanguagesRespository } from './languages.repo'
import { isRecordNotFoundError, isUniqueConstraintError } from 'src/shared/helpers'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'

@Injectable()
export class LanguagesService {
  constructor(
    private readonly languagesRespository: LanguagesRespository,
    private readonly sharedUserRepository: SharedUserRepository,
  ) {}

  async create(body: CreateLanguageBodyType, userId: number) {
    try {
      const user = await this.sharedUserRepository.findUnique({ id: userId })

      if (!user) {
        throw new UnprocessableEntityException({
          message: 'Không tìn thấy thông tin đăng nhập của bạn',
          path: 'id',
        })
      }

      const lang = await this.languagesRespository.createLanguage({
        id: body.id,
        name: body.name,
        createdById: user.id,
        updatedById: user.id,
      })

      return lang
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException([
          {
            message: 'Ngôn ngữ đã tồn tại',
            path: 'id',
          },
        ])
      }
      throw error
    }
  }

  async getAllLanguages() {
    try {
      const res = await this.languagesRespository.findAllLanguage()

      if (!res || res.length === 0) {
        return {
          data: [],
          totalItems: 0,
        }
      }

      return {
        data: res,
        totalItems: res.length,
      }
    } catch (error) {
      console.error('[LanguagesService:GetAllLanguages]', error)
      throw error
    }
  }

  async getLanguagesById(id: string) {
    try {
      const res = await this.languagesRespository.findLanguageById(id)

      return res
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException([
          {
            message: 'Ngôn ngữ bạn tìm không tồn tại',
            path: 'id',
          },
        ])
      }
      throw error
    }
  }

  async delete(id: string, userId: number) {
    try {
      await this.languagesRespository.deleleById(id, true, userId)

      return {
        message: 'Xóa thông tin ngôn ngữ thành công',
      }
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException([
          {
            message: 'Ngôn ngữ bạn muốn xóa không tồn tại hoặc bị bị soft delete',
            path: 'id',
          },
        ])
      }
      throw error
    }
  }

  async update(id: string, body: UpdateLanguageBodyType, userId: number) {
    try {
      // 1. Kiểm tra language có tồn tại
      await this.languagesRespository.findLanguageById(id)

      // 2. Kiểm tra user tồn tại
      const user = await this.sharedUserRepository.findUnique({ id: userId })

      if (!user) {
        throw new UnprocessableEntityException([
          {
            message: 'Không tìm thấy thông tin đăng nhập của bạn',
            path: 'userId',
          },
        ])
      }

      // 3. Tiến hành cập nhật
      const updatedLanguage = await this.languagesRespository.updateLanguage(id, {
        name: body.name,
        updatedById: user.id,
      })

      // 4. Trả về response
      return {
        message: 'Cập nhật thông tin ngôn ngữ thành công',
        data: updatedLanguage,
      }
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        console.log(error)
        throw new NotFoundException([
          {
            message: 'Ngôn ngữ bạn muốn cập nhật không tồn tại',
            path: 'id',
          },
        ])
      }
      throw error
    }
  }
}
