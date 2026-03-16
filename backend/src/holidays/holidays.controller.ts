import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { HolidaysService } from './holidays.service'

@ApiTags('Holidays')
@Controller('holidays')
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

  @Get(':year')
  @ApiOperation({ summary: 'Get holidays for a specific year' })
  @ApiQuery({ name: 'countryCode', required: false, example: 'VN' })
  findAll(@Param('year', ParseIntPipe) year: number, @Query('countryCode') countryCode?: string) {
    return this.holidaysService.findAllByYear(year, countryCode || 'VN')
  }
}
