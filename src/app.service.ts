import { Injectable } from '@nestjs/common';
import { PinataSDK } from 'pinata';
import { File } from '@web-std/file';

@Injectable()
export class AppService {
  private pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.PINATA_GATEWAY_DOMAIN,
    pinataGatewayKey: process.env.PINATA_GATEWAY_KEYS,
  });
  constructor() {}
  getHello(): string {
    return 'Hello World!';
  }

  async uploadFile(file: Express.Multer.File): Promise<object> {
    try {
      const fileReady = new File([file.buffer], file.originalname, {
        type: file.mimetype,
      });
      const upload = await this.pinata.upload.file(fileReady);
      console.debug('this is file1', fileReady);
      return { status: 'file uploaded successfully', file: upload };
    } catch (err) {
      console.log('From AppService: Error while uploading file to pinata');
      throw new Error('Error while uploading file to pinata');
    }
  }
}
