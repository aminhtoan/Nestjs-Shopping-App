import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    return 'Nhìn cái gì cmm !!!'
  }
}
