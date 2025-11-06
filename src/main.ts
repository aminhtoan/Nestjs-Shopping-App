import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const config = new DocumentBuilder()
    .setTitle('NestJS E-commerce')
    .setDescription('The E-commerce API description')
    .setVersion('1.0')
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, documentFactory)

  app.enableCors({
    origin: '*', // địa chỉ của Next.js
    credentials: true,
  })

  await app.listen(process.env.PORT ?? 3333)
  console.log(`✅ Server listening on http://localhost:${process.env.PORT}`)
  console.log(`✅ Swagger listening on http://localhost:${process.env.PORT}/api`)
}
bootstrap()
