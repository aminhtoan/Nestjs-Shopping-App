import { Module } from '@nestjs/common'
import { LanguagesController } from './languages.controller'
import { LanguagesService } from './languages.service'
import { LanguagesRespository } from './languages.repo'

@Module({
  controllers: [LanguagesController],
  providers: [LanguagesService, LanguagesRespository],
})
export class LanguagesModule {}
