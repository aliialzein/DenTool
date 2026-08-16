import { Global, Module } from '@nestjs/common';
import { ImageKitService } from './imagekit.service';

@Global()
@Module({
  providers: [ImageKitService],
  exports: [ImageKitService],
})
export class ImageKitModule {}
