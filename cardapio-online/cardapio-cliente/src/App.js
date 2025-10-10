import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Carregar dados do cardápio
  useEffect(() => {
    const carregarCardapio = async () => {
      try {
        setCarregando(true);
        const [dadosCategorias, dadosProdutos] = await Promise.all([
          fetch(`${API_BASE_URL}/api/categorias`).then(r => r.json()),
          fetch(`${API_BASE_URL}/api/produtos`).then(r => r.json())
        ]);
        
        setCategorias(dadosCategorias);
        setProdutos(dadosProdutos);
      } catch (error) {
        console.error('Erro ao carregar cardápio:', error);
      } finally {
        setCarregando(false);
      }
    };

    carregarCardapio();
  }, []);

  if (carregando) {
    return (
      <div style={{ 
        padding: '50px', 
        textAlign: 'center',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" 
      }}>
        <div style={{ fontSize: '3em', marginBottom: '20px' }}>⏳</div>
        <h2>Carregando Cardápio...</h2>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {/* HEADER */}
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        padding: '30px',
        backgroundColor: '#b71c1c',
        color: 'white',
        borderRadius: '15px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{ 
          margin: '0 0 10px 0', 
          fontSize: '2.8em',
          fontWeight: '700'
        }}>
          🍔 Jetro's Lanches
        </h1>
        <p style={{ 
          margin: '0 0 15px 0', 
          fontSize: '1.4em',
          fontWeight: '600'
        }}>
          Cardápio Digital
        </p>
        <p style={{ 
          margin: '0', 
          fontSize: '1.1em',
          opacity: 0.9
        }}>
          📞 99611-2820 | 3822-7097
        </p>
        <div style={{ 
          marginTop: '15px',
          padding: '10px 20px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '20px',
          display: 'inline-block'
        }}>
          🎯 Peça ao garçom
        </div>
      </header>

      {/* CARDÁPIO */}
      <div style={{ marginBottom: '50px' }}>
        {categorias.map(categoria => {
          const produtosDaCategoria = produtos.filter(produto => 
            produto.categoria_id === categoria.id
          );

          if (produtosDaCategoria.length === 0) return null;

          return (
            <div key={categoria.id} style={{ 
              marginBottom: '40px',
              backgroundColor: 'white',
              borderRadius: '15px',
              padding: '25px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ 
                color: '#b71c1c', 
                borderBottom: '3px solid #b71c1c',
                paddingBottom: '15px',
                marginBottom: '25px',
                fontSize: '1.8em',
                fontWeight: '700'
              }}>
                {categoria.nome}
              </h2>
              
              {categoria.descricao && (
                <p style={{ 
                  color: '#666', 
                  fontStyle: 'italic', 
                  fontSize: '1.1em',
                  marginBottom: '25px',
                  lineHeight: '1.5'
                }}>
                  {categoria.descricao}
                </p>
              )}

              {/* PRODUTOS */}
              <div style={{ display: 'grid', gap: '20px' }}>
                {produtosDaCategoria.map(produto => (
                  <div key={produto.id} style={{
                    backgroundColor: '#f9f9f9',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '2px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '15px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'}
                  onMouseOut={(e) => e.target.style.boxShadow = 'none'}
                  >
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        margin: '0 0 8px 0', 
                        color: '#333',
                        fontSize: '1.3em',
                        fontWeight: '600'
                      }}>
                        {produto.nome}
                      </h3>
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
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '15px',
                      flexShrink: 0
                    }}>
                      <span style={{ 
                        backgroundColor: '#2e7d32', 
                        color: 'white', 
                        padding: '8px 16px', 
                        borderRadius: '25px',
                        fontWeight: '600',
                        fontSize: '1.1em',
                        minWidth: '100px',
                        textAlign: 'center'
                      }}>
                        R$ {Number(produto.preco).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <footer style={{ 
        textAlign: 'center', 
        color: '#666',
        padding: '30px',
        borderTop: '2px solid #eee',
        marginTop: '50px'
      }}>
        <p style={{ 
          margin: '0 0 10px 0', 
          fontSize: '1.1em',
          fontWeight: '600'
        }}>
          💡 Como pedir?
        </p>
        <p style={{ 
          margin: '0', 
          fontSize: '1em'
        }}>
          Chame o garçom e informe os itens desejados
        </p>
        <p style={{ 
          margin: '20px 0 0 0', 
          fontSize: '0.9em',
          opacity: 0.7
        }}>
          © 2025 Jetro's Lanches - Cardápio Digital
        </p>
      </footer>
    </div>
  );
}

export default App;