import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}

export class ProvideAcessDto {
  @ApiPropertyOptional({example: 'did:key:oiuyteryuoppoiyteruopoiuy'})
  // @IsNotEmpty({message: 'did of the receiver must not be empty'})
  @IsString()
  holderDid: string 

  @ApiProperty({example: 'faberOrg'})
  @IsNotEmpty({message: 'orgId of the provider must not be empty'})
  orgId: string

  @ApiProperty({example: 'engineering'})
  @IsString()
  @IsNotEmpty({message: 'folder of the provider must not be empty'})
  folderName: string

  @ApiProperty({example: 'abc@yopmail.com'})
  @IsEmail()
  @IsNotEmpty({message: 'email of the receiver must not be empty'})
  email: string

  @ApiPropertyOptional({example: 'John'})
  @IsString()
  firstName: string

  @ApiPropertyOptional({example: 'Doe'})
  @IsString()
  lastName: string

  @ApiPropertyOptional({example: 'Engineering'})
  @IsString()
  department: string

  @ApiProperty({example: 'PinaVault'})
  @IsNotEmpty()
  @IsString()
  organizationName: string

  @ApiPropertyOptional({example: '23/11/2124'})
  @IsString()
  expires: string

  @ApiPropertyOptional({example: 'true'})
  @IsString()
  admin: string = 'false'
}

export class GetAccessDto extends OmitType(ProvideAcessDto, ['admin'] as const) {
  @ApiPropertyOptional({example: '0f4fce2b-1ebf-4d27-817a-dfffe53be3d9'})
  @IsString()
  connectionId?: string
}