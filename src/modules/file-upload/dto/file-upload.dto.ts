import { IsString, IsUUID } from 'class-validator';

export class UploadLogoDto {
  @IsUUID()
  companyId: string;
}

export class FileUploadResponseDto {
  @IsString()
  url: string;

  @IsString()
  filename: string;

  @IsString()
  mimetype: string;

  size: number;
}