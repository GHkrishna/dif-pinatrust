export interface ITokenResponse {
  statusCode: number,
  message: string,
  data: {
    access_token: string,
    expires_in: number,
    refresh_expires_in: number,
    token_type: string,
    'not-before-policy': number,
    scope: string
  }
}