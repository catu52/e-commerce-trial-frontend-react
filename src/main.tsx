import {BrowserRouter} from 'react-router-dom';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {ThemeProvider} from './context/ThemeContext.tsx';
import {AuthProvider} from './context/AuthContext.tsx';

createRoot(document.getElementById('root')!).render(<BrowserRouter><ThemeProvider><AuthProvider><App /></AuthProvider></ThemeProvider></BrowserRouter>);
