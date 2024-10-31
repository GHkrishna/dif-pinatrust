import { BadRequestException } from "@nestjs/common";
import { GetAccessDto } from "src/dto/app.dto";

export function getOOBVerificationPayload(payload: GetAccessDto) {
  return {
    "presentationDefinition": {
      "id": `0f4fce2b-1ebf-4d27-817a-dfffe53be3d9`,
      "input_descriptors": [
        {
          "id": "id-number-verification",
          "name": `Requesting access for ${payload.folderName}`,
          "purpose": `To verify that the user has access to folder: ${payload.folderName}`,
          "schema": [
            {
              "uri": "https://schema.credebl.id/schemas/b0f4d03d-a4f7-47ff-8737-11ddf2ecee33",
              "required": true
            }
          ],
          "constraints": {
            "fields": [
              {
                "path": [
                  "$.credentialSubject['\''First Name'\'']", "$.credentialSubject['\''Last Name'\'']", "$.credentialSubject['\''Folder Name'\'']", "$.credentialSubject['\''Expires at'\'']"
                ]
              }
            ]
          }
        }
      ]
    },
    "autoAcceptProof": "always",
    "isShortenUrl": true,
    "reuseConnection": true
  }
}

export const verifyOOBCredentialUrl = (CredeblOrgId: string) => `https://devapi.credebl.id/orgs/${CredeblOrgId}/proofs/oob?requestType=presentationExchange`

export function getVerificationPayload(payload: GetAccessDto) { 
  if (!payload.connectionId) {
    throw new BadRequestException('Cannot present without connection')
  }
  const verificationPayload = {
    "connectionId": `${payload.connectionId}`,
    "presentationDefinition": {
    "id": "b850118e-946b-4d25-b33b-004b9b519ed6",
      "input_descriptors": [
          {
              "id": "id-number-verification",
              "name": `Requesting access for ${payload.folderName}`,
              "purpose": `To verify that the user has access to folder: ${payload.folderName}`,
              "schema": [
                  {
                      "uri": "https://schema.credebl.id/schemas/b0f4d03d-a4f7-47ff-8737-11ddf2ecee33",
                      "required": true
                  }
              ],
              "constraints": {
                  "fields": [
                      {
                          "path": [
                              "$.credentialSubject['First Name']", "$.credentialSubject['Last Name']", "$.credentialSubject['Folder Name']", "$.credentialSubject['Expires at']"
                          ]
                      }
                  ]
              }
          }
      ]
    },
    "autoAcceptProof": "always"
  }  
  return verificationPayload
}

export const verifyCredentialUrl = (CredeblOrgId: string) => `https://devapi.credebl.id/orgs/${CredeblOrgId}/proofs?requestType=presentationExchange`

export const getVerifiedProofRecordUrl = (orgId: string, proofId: string) => `https://devapi.credebl.id/orgs/${orgId}/verified-proofs/${proofId}`