import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCarrinho } from '../context/CarrinhoContext';

const Cardapio = () => {
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const { adicionarItem } = useCarrinho();

  useEffect(() => {
    carregarCardapio();
  }, []);

  const carregarCardapio = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/categorias');
      setCategorias(response.data);
      setCarregando(false);
    } catch (error) {
      console.error('Erro ao carregar cardápio:', error);
      setCarregando(false);
    }
  };

  if (carregando) {
    return <div className="loading">Carregando cardápio...</div>;
  }

  return (
    <div className="cardapio">
      <h2>🍔 Cardápio Jetro's Lanches</h2>
      
      {categorias.map(categoria => (
        <section key={categoria.id} className="categoria-section">
          <h3>{categoria.nome}</h3>
          <div className="produtos-grid">
            {categoria.produtos.map(produto => (
              <div key={produto.id} className="produto-card">
                <h4>{produto.nome}</h4>
                <p className="produto-descricao">{produto.descricao}</p>
                <div className="produto-info">
                  <span className="price">R$ {produto.preco}</span>
                  <button 
                    className="btn-adicionar"
                    onClick={() => adicionarItem(produto)}
                    aria-label={`Adicionar ${produto.nome} ao carrinho`}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default Cardapio;