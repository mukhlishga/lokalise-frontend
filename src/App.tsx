import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Edit from './pages/Edit';
import View from './pages/View';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/:id/edit" element={<Edit />} />
        <Route path="/:id" element={<View />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
