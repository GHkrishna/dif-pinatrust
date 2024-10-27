import { ProvideAcessDto } from "src/dto/app.dto"

export function issueJson(payload: ProvideAcessDto): object {
  const credOfferPayload = {
    "credentialOffer": [
      {
        "emailId": `${payload.email}`,
        "credential": {
          "@context": [
            "https://www.w3.org/2018/credentials/v1",
            `https://schema.credebl.id/schemas/b0f4d03d-a4f7-47ff-8737-11ddf2ecee33`
          ],
          "type": [
            "VerifiableCredential",
            "Access Card PinaVault"
          ],
          "issuer": {
            "id": `${process.env.CREDEBL_ISSUER_DID}`
          },
          "issuanceDate": Date.now().toString(),
          "credentialSubject": {
            "First Name": payload.firstName,
            "Last Name": payload.lastName,
            "Folder Name": payload.folderName,
            "Department": payload.department || "-",
            "Organization": payload.organizationName,
            "Created at": Date.now().toString(),
            "Expires at": payload.expires || "-",
            "Admin": payload.admin || "false"
          }
        },
        "options": {
          "proofType": "Ed25519Signature2018",
          "proofPurpose": "assertionMethod"
        }
      }
    ],
    "protocolVersion": "v2",
    "isReuseConnection": true,
    "credentialType": "jsonld"
  }
  if (payload.holderDid)
    credOfferPayload.credentialOffer[0].credential.credentialSubject["id"] = payload.holderDid
  return credOfferPayload
}

export const issuCredentialUrl = (CredeblOrgId: string) => `https://devapi.credebl.id/orgs/${CredeblOrgId}/credentials/oob/email?credentialType=jsonld`

export const issueCredHeaders = (token: string): object => {
  return {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}
// Response
// {"statusCode":201,"message":"Out-of-band credentials offer created successfully","data":true}