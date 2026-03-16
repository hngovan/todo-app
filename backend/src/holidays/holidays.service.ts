import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Holiday } from './entities/holiday.entity'

interface ExternalHoliday {
  date: string
  name: string
  localName: string
}

@Injectable()
export class HolidaysService {
  private readonly logger = new Logger(HolidaysService.name)

  constructor(
    @InjectRepository(Holiday)
    private readonly holidayRepository: Repository<Holiday>
  ) {}

  async findAllByYear(year: number, countryCode: string = 'VN'): Promise<Holiday[]> {
    // Check if we have holidays for this year in DB
    const startDate = `${year}-01-01`
    const endDate = `${year}-12-31`

    const holidays = await this.holidayRepository
      .createQueryBuilder('holiday')
      .where('holiday.date >= :startDate', { startDate })
      .andWhere('holiday.date <= :endDate', { endDate })
      .andWhere('holiday.countryCode = :countryCode', { countryCode })
      .orderBy('holiday.date', 'ASC')
      .getMany()

    if (holidays.length > 0) {
      return holidays
    }

    // If not, fetch from Nager.Date API
    this.logger.log(`Fetching ${countryCode} holidays for year ${year} from Nager.Date API...`)
    try {
      const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`)
      if (!response.ok) {
        this.logger.error(`Failed to fetch holidays: ${response.statusText}`)
        return []
      }

      const externalHolidays: ExternalHoliday[] = (await response.json()) as ExternalHoliday[]
      const newHolidays = externalHolidays.map(h => {
        return this.holidayRepository.create({
          date: h.date,
          name: h.name,
          localName: h.localName,
          countryCode: countryCode
        })
      })

      const saved = await this.holidayRepository.save(newHolidays)
      this.logger.log(`Saved ${saved.length} holidays for ${countryCode} in year ${year}`)
      return saved
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error(`Error fetching holidays: ${message}`)
      return []
    }
  }
}
