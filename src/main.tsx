import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

if (import.meta.env.MODE === 'development') {
    localStorage.clear();
  }
createRoot(document.getElementById("root")!).render(<App />);
