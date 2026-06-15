import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Generate laporan kehadiran' })
  @ApiQuery({ name: 'mataKuliahId', required: false, type: String })
  @ApiQuery({ name: 'kelasId', required: false, type: String })
  @ApiQuery({ name: 'pengajarId', required: false, type: String })
  generateReport(
    @Query('mataKuliahId') mataKuliahId?: string,
    @Query('kelasId') kelasId?: string,
    @Query('pengajarId') pengajarId?: string,
  ) {
    return this.reportsService.generateReport(
      mataKuliahId,
      kelasId,
      pengajarId,
    );
  }
}
