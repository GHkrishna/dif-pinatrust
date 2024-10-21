import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AppService } from './app.service';
import { FileUploadDto } from './dto/app.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Sign-up using credebl(get info, register and send VC on did), also return token(containing did)
  // Login: get presentation from adeya and verify against credebl
  // Post: Add file: to pinata
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'List of files',
    type: FileUploadDto,
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<object> {
    console.debug('file controller::', file);
    return this.appService.uploadFile(file);
  }
  // Get: get file from pinata

  /**
   * Utilities
   * 1. (Put)Associate name to did(name + did)
   * 2. (Get)Did/name-find people from platform from name or DID. So that u can add them to files to be shared
   * 3. (Put) Share to-share file to the person(Using did or name)
   */
}
