import { useTranslation } from 'react-i18next';

import MainToDo from './pages/MainToDo';

import './App.css';

const App: React.FC = () => {
  const [t] = useTranslation();

  return (
    <div className="App">
      <header className="App-header">
        <h1>{t('title')}</h1>
      </header>

      <MainToDo />
    </div>
  );
};

export default App;
