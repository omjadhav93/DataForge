import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DatasetView from './pages/DatasetView';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dataset" element={<DatasetView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
