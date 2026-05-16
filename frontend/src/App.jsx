import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Routes>
      {/* 默认首页路由指向 Dashboard 组件 */}
      <Route path="/" element={<Dashboard />} />
    </Routes>
  );
}

export default App;