import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './modules/category/category.module';
import { PostModule } from './modules/post/post.module';
import { PrismaService } from './prisma/prisma.service';
<<<<<<< Updated upstream
import { PricingsModule } from './modules/pricings/pricings.module';
=======
import { CommentModule } from './modules/comment/comment.module';
>>>>>>> Stashed changes

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    PrismaModule,

    CategoryModule,

    PostModule,

<<<<<<< Updated upstream
    PricingsModule
=======
    CommentModule
>>>>>>> Stashed changes
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }
