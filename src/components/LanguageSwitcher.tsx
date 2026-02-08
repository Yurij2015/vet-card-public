import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'uk', label: 'UA', flag: '🇺🇦' },
  { code: 'en', label: 'EN', flag: '🇬🇧' }
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const currentLang = i18n.language?.split('-')[0] || 'uk'

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode)
  }

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`
            px-3 py-1.5 rounded-md text-sm font-medium transition-all
            ${currentLang === lang.code
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          <span className="mr-1">{lang.flag}</span>
          {lang.label}
        </button>
      ))}
    </div>
  )
}

