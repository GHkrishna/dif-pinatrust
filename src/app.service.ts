import { HttpException, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PinataSDK, UploadOptions } from 'pinata';
import { File } from '@web-std/file';
import { GetAccessDto, ProvideAcessDto } from './dto/app.dto';
import { getToken } from './utils/issuerToken';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { issuCredentialUrl, getCredeblHeaders, issueJson } from './utils/returnIssueJson';
import { firstValueFrom } from 'rxjs';
import { IIssuedCred, IVerifiedProofRecord, IVerifyPres } from './interfaces/app';
import { getVerificationPayload, getVerifiedProofRecordUrl, verifyCredentialUrl } from './utils/returnVerificationJson';

@Injectable()
export class AppService {
  private pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.PINATA_GATEWAY_DOMAIN,
    pinataGatewayKey: process.env.PINATA_GATEWAY_KEYS,
  });
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache, private httpService: HttpService) {}
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

  async giveAccessToFolder(payload: ProvideAcessDto): Promise<object> {
    try {
      // Check folder exists
      if (!await this.folderExists(payload.orgId, payload.folderName))
       throw new NotFoundException(`No such folder:: ${payload.folderName} exist for org`)
      console.debug('Folder exists with folderName::', `${payload.orgId}-${payload.folderName}`)
      console.debug('getting access token to access credebl')
      // folder exist, issue credential

      const token = await this.getToken()
      if (!token)
       throw new NotFoundException('Error getting token to access CREDEBL')
      console.debug('getting access token to access credebl')

      console.debug('Issuing credential using CREDEBL')
      const issuedCred = await firstValueFrom( await this.httpService.post(issuCredentialUrl(process.env.CREDEBL_ISSUER_ORGID), await issueJson(payload), { headers: getCredeblHeaders(token) }))
      const res: IIssuedCred = issuedCred.data

      if (!(res.statusCode === 201))
       throw new InternalServerErrorException('Error while issuing credential through credebl', {cause: res.message})
      console.debug('Credentials issued using CREDEBL')

      return {status: 'Access granted successfully'}
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

  async accessFolder(payload: GetAccessDto) {
    // Check folder exists
    if (!await this.folderExists(payload.orgId, payload.folderName))
     throw new NotFoundException(`No such folder:: ${payload.folderName} exist for org`)
    console.debug('Folder exists with folderName::', `${payload.orgId}-${payload.folderName}`)
    console.debug('getting access token to access credebl')
    // folder exist, send presentation req

    // GEt token
    const token = await this.getToken()
    if (!token)
     throw new NotFoundException('Error getting token to access CREDEBL')
    console.debug('getting access token to access credebl')
    // Get payload for verification with connectionId(get Id)
    console.debug('Presenting credential using CREDEBL')

    console.log('this is url: ', verifyCredentialUrl(process.env.CREDEBL_ISSUER_ORGID))
    console.log('this is getVerificationPayload: ', JSON.stringify(getVerificationPayload(payload), null, 2))
    console.log('this is headers: ', { headers: getCredeblHeaders(token) })
    // return
    const verifyPres = await firstValueFrom(await this.httpService.post(verifyCredentialUrl(process.env.CREDEBL_ISSUER_ORGID), getVerificationPayload(payload), { headers: getCredeblHeaders(token) }))

    const res: IVerifyPres = verifyPres.data

    // Timeout
    await new Promise((resolve) => setTimeout(resolve, 5000));


    // console.log('this is url1: ', getVerifiedProofRecordUrl(process.env.CREDEBL_ISSUER_ORGID, res.data.id))
    // console.log('this is headers1: ', { headers: getCredeblHeaders(token) })
    // Get verified proof record by id
    const resP = await firstValueFrom( await this.httpService.get(getVerifiedProofRecordUrl(process.env.CREDEBL_ISSUER_ORGID, res.data.id), { headers: getCredeblHeaders(token) }))
    const verifiedRecord: IVerifiedProofRecord = resP.data
    // Check if verified proof and accessing folders is same
    if (verifiedRecord.data[0]['First Name'] !== payload.firstName)
      throw new UnauthorizedException(`Your provided First Name::${payload.firstName} and presented first name:: ${verifiedRecord.data[0]['First Name']} does not match`)

    if (verifiedRecord.data[1]['Last Name'] !== payload.lastName)
      throw new UnauthorizedException(`Your provided Last Name::${payload.lastName} and presented last name:: ${verifiedRecord.data[0]['Last Name']} does not match`)

    if (verifiedRecord.data[2]['Folder Name'] !== payload.folderName)
      throw new UnauthorizedException(`You do not have access to the folder ${payload.folderName}`)

    if ((verifiedRecord.data[3]['Expires at'] !== '-') && (verifiedRecord.data[0]['Expires at'] <= Date.now().toString()))
      throw new UnauthorizedException(`Your credential is expired at  ${verifiedRecord.data[0]['Expires at']}`)

    // To do: Can add verification based on did
    // if ((verifiedRecord.data[0]['Expires at'] !== '-') && (verifiedRecord.data[0]['Expires at'] <= Date.now().toString()))
    //   throw new UnauthorizedException(`Your credential is expired at  ${verifiedRecord.data[0]['Expires at']}`)
    // Once verified, check if folderName, orgName and other validations are staisfied

    console.debug(`Presentation verified successfully, returning files inside folder ${payload.folderName}`)
    const filesResult = await this.getFilesInFolder(payload.orgId, payload.folderName)

    return {result: 'Successfully verified'}
  }

  async folderExists(orgId: string, folderName: string): Promise<boolean> {
    const groupRes = await this.pinata.groups.list().name(`${orgId}-${folderName}`);
    console.debug('this is groupRes:::', JSON.stringify(groupRes, null, 2))
    return groupRes.groups.length === 0 ? false: true
  }

  private async getToken(): Promise<string> {
    const cachedToken: string = await this.cacheManager.get('CREDEBL_ACCESS_TOKEN');
    if (cachedToken) return cachedToken;
  
    const data = await getToken();
    await this.cacheManager.set('CREDEBL_ACCESS_TOKEN', data.data.access_token, data.data.expires_in);
    return data.data.access_token;
  }
}
