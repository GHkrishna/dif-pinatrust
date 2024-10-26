import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PinataSDK, UploadOptions } from 'pinata';
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

  async getFolders(orgId: string): Promise<object> {
    try {
    const folders = await this.pinata.groups.list()
    const filteredByOrgID = folders.groups.filter(item => new RegExp(`^${orgId}-`).test(item.name) )
    return filteredByOrgID
  } catch (err) {
    console.log('Error getting getFolders by orgId', JSON.stringify(err));
    
    const customError = {
      message: err.response.message || 'Internal Server Error',
      error: err.response.err? err.response.err: {},
      statusCode: err.response.statusCode? err.response.statusCode : 500,
    };
    throw new HttpException(customError, customError.statusCode);
  }
  }

  async getFilesInFolder(orgId: string, folderName: string): Promise<object> {
    try {
      const groupName = `${orgId}-${folderName}`
      console.debug('Searcing for groupName:::', groupName)
      const groupInfo = await this.pinata.groups.list().name(`${orgId}-${folderName}`)
      if (groupInfo.groups.length == 0) {
        // No such OrgId or Name exists
        console.debug('No such group exists, with groupName::', groupName);
        throw new NotFoundException(`No such group exists, with groupName::${groupName}`);
      }
      const groupId = groupInfo.groups[0].id;
      console.debug('Group exists, with groupName::', groupName);
      console.debug('Finding files inside group', groupName);
      const files = await this.pinata.files.list().group(groupId)
      console.debug('Returning files found');
      return files
    } catch (err) {
      console.log('Error getting files in folder by orgId and folderName', JSON.stringify(err));
      
      const customError = {
        message: err.response.message || 'Internal Server Error',
        error: err.response.err? err.response.err: {},
        statusCode: err.response.statusCode? err.response.statusCode : 500,
      };
      throw new HttpException(customError, customError.statusCode);
    }
  } 
}
