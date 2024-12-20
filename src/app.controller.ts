import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AppService } from './app.service';
import { FileUploadDto, GetAccessDto, ProvideAcessDto } from './dto/app.dto';
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

  // Get folder by orgName
  @Get('/folders/:orgId')
  async getFolders(@Param('orgId') orgId: string): Promise<object> {
    return this.appService.getFolders(orgId);
  }

  // Get files by orgName and folderName
  @Get('/files/:orgId/:folderName')
  async getFolder(@Param('orgId') orgId: string, @Param('folderName') folderName: string): Promise<object> {
    return this.appService.getFilesInFolder(orgId, folderName);
  }

  // Give access to folder using did
  @Post('/access')
  @ApiBody({
    description: 'Attributes required',
    type: ProvideAcessDto,
  })
  async giveAccessToFolder(@Body() provideAccessDto: ProvideAcessDto): Promise<object> {
    return this.appService.giveAccessToFolder(provideAccessDto);
  }

  @Post('/access-folder')
  @ApiBody({
    description: 'Attributes required to get access to folder for a employee',
    type: GetAccessDto
  })
  async accessFolder(@Body() getAccessDto: GetAccessDto): Promise<object> {
    return this.appService.accessFolder(getAccessDto)
  }

  /**
   * Utilities
   * 1. (Put)Associate name to did(name + did)
   * 2. (Get)Did/name-find people from platform from name or DID. So that u can add them to files to be shared
   * 3. (Put) Share to-share file to the person(Using did or name)
   */
}
