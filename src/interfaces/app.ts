export interface IIssuedCred {
  statusCode: number,
  message: string,
  data: boolean
}

export interface IVerifyPres {
  statusCode: number,
  message: string,
  data: {
    _tags: string,
    metadata: string,
    id: string,
    createdAt: string,
    protocolVersion: string,
    state: string,
    role: "verifier",
    connectionId: string,
    threadId: string,
    autoAcceptProof: string,
    updatedAt: string
  }
}

export interface IVerifyPresOOB {
  statusCode: number,
  message: string,
  data: boolean
}

export interface IVerifiedProofRecord {
  statusCode: number,
  message: string,
  data: [
      {
        "First Name": string,
        "schemaId": string
      },
      {
        "Last Name": string,
        "schemaId": string
      },
      {
        "Folder Name": string,
        "schemaId": string
      },
      {
        "Expires at": string,
        "schemaId": string
      }
    ]
}