import { IsString, IsNotEmpty, Length } from 'class-validator'

export class CreateHolidayDto {
  @IsString()
  @IsNotEmpty()
  date: string

  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  localName: string

  @IsString()
  @Length(2, 2)
  countryCode: string
}
