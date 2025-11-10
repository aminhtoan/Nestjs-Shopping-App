import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'
import { Throttle } from '@nestjs/throttler'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @IsPublic()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  getHello(): string {
    return this.appService.getHello()
  }
}
