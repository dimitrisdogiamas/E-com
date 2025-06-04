import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { PaymentModule } from './payment/payment.module';
import { OrderModule } from './order/order.module';
import { ChatModule } from './chat/chat.module';
import { SearchModule } from './search/search.module';
import { AdminModule } from './admin/admin.module';
import { RecommendationModule } from './recommendation/recommendation.module';
// import { CategoryModule } from './category/category.module'; // Temporarily disabled
import { EmailModule } from './email/email.module';
import { UploadModule } from './upload/upload.module';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { ProfileController } from './profile/profile-controller/profile.controller';
import { ProfileService } from './profile/profile-service/profile.service';
import { ProfileModule } from './profile/profile.module';
import { ProductService } from './product/product-service/product.service';
import { ProductController } from './product/product-controller/product.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    UserModule,
    ProductModule,
    CartModule,
    PaymentModule,
    OrderModule,
    ChatModule,
    SearchModule,
    AdminModule,
    RecommendationModule,
    // CategoryModule, // Temporarily disabled until migration
    EmailModule,
    UploadModule,
    ProfileModule,
  ],
  controllers: [AppController, ProfileController, ProductController],
  providers: [AppService, PrismaService, ProfileService, ProductService],
})
export class AppModule {}
