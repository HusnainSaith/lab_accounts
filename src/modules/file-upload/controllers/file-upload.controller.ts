import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from '../services/file-upload.service';
import { CompaniesService } from '../../companies/services/companies.service';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CompanyGuard } from '../../../common/guards/company.guard';

@Controller('file-upload')
@UseGuards(RolesGuard, CompanyGuard)
export class FileUploadController {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly companiesService: CompaniesService,
  ) {}

  @Post('company-logo/:companyId')
  @Roles('owner')
  @UseInterceptors(FileInterceptor('logo'))
  async uploadCompanyLogo(
    @UploadedFile() file: Express.Multer.File,
    @Param('companyId') companyId: string,
  ) {
    const logoUrl = await this.fileUploadService.uploadCompanyLogo(file, companyId);
    
    await this.companiesService.update(companyId, { logoUrl });
    
    return { logoUrl };
  }
}