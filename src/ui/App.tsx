// src/ui/App.tsx
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Form } from './pages/Form';
import { Index } from './pages/Index';

export default function App() {
  return (
    <HashRouter>
      {/* 1. Global Navigation Bar */}
      {/* <nav style={{ padding: '10px', background: '#202225', display: 'flex', gap: '15px' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
        <Link to="/add-employee" style={{ color: 'white', textDecoration: 'none' }}>Add Employee</Link>
      </nav> */}

      {/* 2. Active Screen Injector */}
      <div style={{ padding: '20px' }}>
        <Routes>
          {/* Index page route */}
          <Route path="/" element={<Index />} />
          {/* Your custom employee collection form route */}
          <Route path="/form" element={<Form />} />
        </Routes>
      </div>
    </HashRouter>
  );
}