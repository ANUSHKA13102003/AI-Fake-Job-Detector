import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Result from './pages/Result';

function AppContent() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [inputText, setInputText] = useState('');
  const navigate = useNavigate();

  const handleAnalysisComplete = (result, text) => {
    setAnalysisResult(result);
    setInputText(text);
    navigate('/result');
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setInputText('');
    navigate('/');
  };

  return (
    <Routes>
      <Route path="/" element={<Home onAnalysisComplete={handleAnalysisComplete} />} />
      <Route
        path="/result"
        element={
          analysisResult
            ? <Result result={analysisResult} inputText={inputText} onReset={handleReset} />
            : <Home onAnalysisComplete={handleAnalysisComplete} />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
