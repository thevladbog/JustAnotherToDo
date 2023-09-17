import { useTranslation } from 'react-i18next';
import Select from 'react-select';

import MainToDo from './pages/MainToDo';

import './App.css';
import { useEffect } from 'react';

enum Language {
  EN = 'en',
  RU = 'ru'
}

interface ILanguageOptions {
  value: Language;
  label: string;
}

const App: React.FC = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (language: ILanguageOptions) => {
    i18n.changeLanguage(language.value);
    window.localStorage.setItem('language', language.value);
  };

  const options: ILanguageOptions[] = [
    { value: Language.RU, label: '\uD83C\uDDF7\uD83C\uDDFA Русский' },
    { value: Language.EN, label: '\uD83C\uDDFA\uD83C\uDDF8 English' }
  ];

  useEffect(() => {
    const currentLang = window.localStorage.getItem('language');
    if (currentLang) {
      window.localStorage.setItem('i18nextLng', currentLang);
    }
  }, []);

  return (
    <div className="App">
      <Select
        defaultValue={options.find(
          (lang) => lang.value === window.localStorage.getItem('language')
        )}
        onChange={(e: ILanguageOptions | null) =>
          e !== null && changeLanguage(e)
        }
        options={options}
        className="languageSelect"
      />
      <header className="App-header">
        <h1>{t('title')}</h1>
      </header>

      <MainToDo />
    </div>
  );
};

export default App;
