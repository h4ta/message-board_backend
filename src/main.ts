import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;

  app.enableCors({
    origin: '*',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
  });

  console.log(`listening on port ${port}`);
  await app.listen(port);
}
bootstrap();
