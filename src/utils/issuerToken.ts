import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ITokenResponse } from 'src/interfaces/utils';


export async function getToken(): Promise<ITokenResponse> {
  const httpService = new HttpService()
  const url = `${process.env.CREDEBL_ENDPOINT}/orgs/${process.env.CREDEBL_ISSUER_CLIENT_ID}/token`;
  const headers = { 'Content-Type': 'application/json', 'accept': 'application/json' };
  const data = {
    clientSecret: `${process.env.CREDEBL_ISSUER_CLIENT_SECRET}`
  }
  const tokenRes = await firstValueFrom(httpService.post(url, data, {headers}))
  return tokenRes.data
}
