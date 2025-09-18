import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <nav className="navbar">
        <div className="container">
          <h1>🍔 Cardápio Online</h1>
        </div>
      </nav>
      
      <div className="container">
        <div className="hero">
          <h2>Bem-vindo à Nossa Lanchonete</h2>
          <p>Faça seu pedido online!</p>
        </div>
        
        <div className="loading">
          <p>Carregando cardápio...</p>
        </div>
      </div>
    </div>
  );
}

export default App;
