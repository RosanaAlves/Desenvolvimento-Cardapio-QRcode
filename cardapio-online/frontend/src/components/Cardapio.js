import React, { useState, useEffect } from 'react';

function Cardapio() {
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        console.log('🔄 Carregando dados da API...');
        
        // Buscar categorias
        const respostaCategorias = await fetch('http://localhost:8000/api/categorias');
        const dadosCategorias = await respostaCategorias.json();
        setCategorias(dadosCategorias);
        console.log('✅ Categorias carregadas:', dadosCategorias.length);

        // Buscar produtos
        const respostaProdutos = await fetch('http://localhost:8000/api/produtos');
        const dadosProdutos = await respostaProdutos.json();
        setProdutos(dadosProdutos);
        console.log('✅ Produtos carregados:', dadosProdutos.length);

        setCarregando(false);
      } catch (erro) {
        console.error('❌ Erro ao carregar dados:', erro);
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  if (carregando) {
    return (
      <div className="text-center p-5">
        <h2>🔄 Carregando cardápio...</h2>
        <p>Conectando com a API...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Cardápio Jetro's Lanches</h1>
      <p>Total: {categorias.length} categorias e {produtos.length} produtos</p>
      
      {categorias.map(categoria => (
        <div key={categoria.id} className="categoria">
          <h2>{categoria.nome}</h2>
          <p>{categoria.descricao}</p>
          
          <div className="produtos">
            {produtos
              .filter(produto => produto.categoria_id === categoria.id)
              .map(produto => (
                <div key={produto.id} className="produto">
                  <h3>{produto.nome}</h3>
                  <p>{produto.descricao}</p>
                  <strong>R$ {produto.preco}</strong>
                </div>
              ))
            }
          </div>
        </div>
      ))}
    </div>
  );
}

export default Cardapio;