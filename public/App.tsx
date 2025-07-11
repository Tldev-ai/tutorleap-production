import React, { useState, useEffect } from 'react';
import { supabase } from './utils/supabase';
import Auth from './components/Auth';
import CurriculumAnalysis from './components/CurriculumAnalysis';
import Dashboard from './components/Dashboard';
import CurriculumConverter from './components/CurriculumConverter';
import ConversionResult from './components/ConversionResult';
import MockTestFlow from './components/MockTestFlow';
import './App.css';

function App() {
  const [session, setSession] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [conversionData, setConversionData] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page);
    if (data) {
      setConversionData(data);
    }
  };

  const handleBack = () => {
    setCurrentPage('dashboard');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentPage('dashboard');
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="App">
      <main>
        {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
        {currentPage === 'curriculum' && <CurriculumAnalysis onBack={handleBack} />}
        {currentPage === 'mocktest' && <MockTestFlow onBack={handleBack} />}
        {currentPage === 'converter' && <CurriculumConverter onBack={handleBack} />}
        {currentPage === 'result' && conversionData && (
          <ConversionResult 
            data={conversionData} 
            onBack={handleBack} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
