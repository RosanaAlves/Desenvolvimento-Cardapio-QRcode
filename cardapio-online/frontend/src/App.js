import React, { useState } from 'react';
import { CarrinhoProvider, useCarrinho } from './context/CarrinhoContext';
import Cardapio from './components/Cardapio';
import Carrinho from './components/Carrinho';
import './App.css';

const Header = () => {
  const { totalItens } = useCarrinho();
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <h1>🍔 Jetro's Lanches</h1>
          <button 
            className="btn-carrinho"
            onClick={() => setCarrinhoAberto(true)}
            aria-label={`Abrir carrinho com ${totalItens} itens`}
          >
            🛒 ({totalItens})
          </button>
        </div>
      </nav>
      
      <Carrinho 
        isAberto={carrinhoAberto} 
        fecharCarrinho={() => setCarrinhoAberto(false)} 
      />
    </>
  );
};

const App = () => {
  return (
    <CarrinhoProvider>
      <div className="App">
        <Header />
        <main className="container">
          <Cardapio />
        </main>
      </div>
    </CarrinhoProvider>
  );
};

export default App;