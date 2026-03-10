import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { LANGUAGES } from '@/i18n/languages'
import type { LanguageCode } from '@/i18n/languages'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = (i18n.language?.slice(0, 2) ?? 'en') as LanguageCode
  const currentLang = LANGUAGES[current] ?? LANGUAGES.en

  const handleChange = (code: LanguageCode) => {
    i18n.changeLanguage(code)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 px-2">
          <span>{currentLang.flag}</span>
          <span className="hidden text-xs sm:block">
            {currentLang.nativeName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(
          Object.entries(LANGUAGES) as [
            LanguageCode,
            (typeof LANGUAGES)[LanguageCode]
          ][]
        ).map(([code, lang]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleChange(code)}
            className={current === code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.nativeName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
