
import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('main.tsx loading, React available:', typeof React);
const root = createRoot(document.getElementById("root")!);
root.render(React.createElement(App));
