import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ImageKit from '@imagekit/nodejs';

@Injectable()
export class ImageKitService {
  private readonly imageKit: ImageKit;

  constructor(private readonly configService: ConfigService) {
    this.imageKit = new ImageKit({
      privateKey: this.configService.getOrThrow<string>('IMAGEKIT_PRIVATE_KEY'),
    });
  }

  generateUploadAuthParams() {
    return this.imageKit.helper.getAuthenticationParameters();
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.imageKit.files.delete(fileId);
  }

  getPublicKey(): string {
    return this.configService.getOrThrow<string>('IMAGEKIT_PUBLIC_KEY');
  }

  getUrlEndpoint(): string {
    return this.configService.getOrThrow<string>('IMAGEKIT_URL_ENDPOINT');
  }

  async getFile(fileId: string): Promise<ImageKit.File> {
    return this.imageKit.files.get(fileId);
  }
}
