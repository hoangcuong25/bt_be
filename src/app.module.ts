import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './modules/category/category.module';
import { PostModule } from './modules/post/post.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    PrismaModule,

    CategoryModule,

    PostModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }
