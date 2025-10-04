import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        console.log('🔄 Carregando dados da API...');
        
        const [resCategorias, resProdutos] = await Promise.all([
          fetch('/api/categorias'),
          fetch('/api/produtos')
        ]);

        const dadosCategorias = await resCategorias.json();
        const dadosProdutos = await resProdutos.json();

        setCategorias(dadosCategorias);
        setProdutos(dadosProdutos);
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
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h1>🍔 Jetro's Lanches</h1>
        <p>Carregando cardápio...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* HEADER */}
      <header style={{ 
        backgroundColor: '#b71c1c', 
        color: 'white', 
        padding: '25px', 
        textAlign: 'center',
        borderRadius: '15px',
        marginBottom: '30px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5em' }}>🍔 Jetro's Lanches</h1>
        <p style={{ margin: '0 0 10px 0', fontSize: '1.2em' }}>Cardápio Digital</p>
        <p style={{ margin: '0', fontSize: '1.1em' }}>📞 99611-2820 | 3822-7097</p>
      </header>

      {/* LISTA DE CATEGORIAS E PRODUTOS */}
      {categorias.map(categoria => (
        <div key={categoria.id} style={{ 
          marginBottom: '40px',
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '25px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            color: '#b71c1c', 
            borderBottom: '3px solid #b71c1c',
            paddingBottom: '15px',
            marginBottom: '20px',
            fontSize: '1.8em'
          }}>
            {categoria.nome}
          </h3>
          
          {categoria.descricao && (
            <p style={{ 
              color: '#666', 
              fontStyle: 'italic', 
              fontSize: '1.1em',
              marginBottom: '25px'
            }}>
              {categoria.descricao}
            </p>
          )}

          {/* PRODUTOS DESTA CATEGORIA */}
          <div style={{ display: 'grid', gap: '20px' }}>
            {produtos
              .filter(produto => produto.categoria_id === categoria.id)
              .map(produto => (
                <div key={produto.id} style={{
                  backgroundColor: '#f9f9f9',
                  padding: '20px',
                  borderRadius: '10px',
                  border: '2px solid #eee'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    gap: '15px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        margin: '0 0 12px 0', 
                        color: '#333',
                        fontSize: '1.3em'
                      }}>
                        {produto.nome}
                      </h4>
                      {produto.descricao && (
                        <p style={{ 
                          margin: '0', 
                          color: '#666', 
                          fontSize: '1em',
                          lineHeight: '1.4'
                        }}>
                          {produto.descricao}
                        </p>
                      )}
                    </div>
                    <span style={{ 
                      backgroundColor: '#2e7d32', 
                      color: 'white', 
                      padding: '8px 16px', 
                      borderRadius: '25px',
                      fontWeight: 'bold',
                      fontSize: '1.1em',
                      minWidth: '80px',
                      textAlign: 'center'
                    }}>
                      R$ {Number(produto.preco).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      ))}

      {/* FOOTER */}
      <footer style={{ 
        marginTop: '60px', 
        textAlign: 'center', 
        color: '#666',
        padding: '30px',
        borderTop: '2px solid #ddd',
        backgroundColor: 'white',
        borderRadius: '10px'
      }}>
        <p style={{ margin: '0', fontSize: '1.1em' }}>
          © 2024 Jetro's Lanches - Cardápio Digital
        </p>
      </footer>
    </div>
  );
}

export default App;