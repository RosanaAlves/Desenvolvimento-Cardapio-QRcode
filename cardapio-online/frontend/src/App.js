import React, { useState, useEffect } from 'react';

// Configuração da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Função para fetch com tratamento de erro
const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      credentials: 'include',
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Validação básica dos dados
    if (data === null || data === undefined) {
      throw new Error('Resposta da API vazia');
    }

    return data;
  } catch (error) {
    console.error(`❌ Erro na requisição para ${url}:`, error);
    throw error;
  }
};

function App() {
  // Estados do sistema
  const [etapa, setEtapa] = useState('selecao-mesa');
  const [mesas, setMesas] = useState([]);
  const [mesaSelecionada, setMesaSelecionada] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [enviandoPedido, setEnviandoPedido] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        setErro(null);

        const [dadosMesas, dadosCategorias, dadosProdutos] = await Promise.all([
          fetchWithErrorHandling('/api/mesas'),
          fetchWithErrorHandling('/api/categorias'),
          fetchWithErrorHandling('/api/produtos')
        ]);

        // Validação dos dados recebidos
        if (!Array.isArray(dadosMesas)) throw new Error('Formato inválido de mesas');
        if (!Array.isArray(dadosCategorias)) throw new Error('Formato inválido de categorias');
        if (!Array.isArray(dadosProdutos)) throw new Error('Formato inválido de produtos');

        setMesas(dadosMesas);
        setCategorias(dadosCategorias);
        setProdutos(dadosProdutos);
        
      } catch (erro) {
        console.error('❌ Erro ao carregar dados:', erro);
        setErro('Erro ao carregar cardápio. Tente recarregar a página.');
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  // Selecionar mesa
  const selecionarMesa = (mesa) => {
    setMesaSelecionada(mesa);
    setEtapa('cardapio');
  };

  // Adicionar item ao carrinho
  const adicionarAoCarrinho = (produto) => {
    const itemExistente = carrinho.find(item => item.produto_id === produto.id);
    const precoNumerico = Number(produto.preco);
    
    if (isNaN(precoNumerico)) {
      console.error('Preço inválido:', produto.preco);
      return;
    }

    if (itemExistente) {
      setCarrinho(carrinho.map(item =>
        item.produto_id === produto.id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ));
    } else {
      setCarrinho([...carrinho, {
        produto_id: produto.id,
        nome: produto.nome,
        preco: precoNumerico,
        quantidade: 1,
        observacoes: ''
      }]);
    }
  };

  // Remover item do carrinho
  const removerDoCarrinho = (produtoId) => {
    setCarrinho(carrinho.filter(item => item.produto_id !== produtoId));
  };

  // Atualizar quantidade
  const atualizarQuantidade = (produtoId, novaQuantidade) => {
    if (novaQuantidade < 1) {
      removerDoCarrinho(produtoId);
      return;
    }
    
    setCarrinho(carrinho.map(item =>
      item.produto_id === produtoId
        ? { ...item, quantidade: novaQuantidade }
        : item
    ));
  };

  // Calcular total do carrinho
  const calcularTotal = () => {
    return carrinho.reduce((total, item) => {
      const preco = Number(item.preco) || 0;
      const quantidade = item.quantidade || 0;
      return total + (preco * quantidade);
    }, 0);
  };

  // Finalizar pedido - MELHORADO
  const finalizarPedido = async () => {
    try {
      setEnviandoPedido(true);

      // 1. Primeiro garantir o CSRF token
      await fetchWithErrorHandling('/sanctum/csrf-cookie', {
        method: 'GET'
      });

      // 2. Preparar dados do pedido
      const pedidoData = {
        mesa_id: mesaSelecionada.id,
        itens: carrinho.map(item => ({
          produto_id: item.produto_id,
          nome: item.nome,
          preco: Number(item.preco),
          quantidade: item.quantidade,
          observacoes: item.observacoes
        }))
      };

      // 3. Fazer a requisição do pedido
      const resultado = await fetchWithErrorHandling('/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(pedidoData)
      });

      if (resultado.success || resultado.id) {
        setEtapa('confirmacao');
      } else {
        throw new Error(resultado.error || 'Erro desconhecido ao enviar pedido');
      }

    } catch (erro) {
      console.error('Erro ao finalizar pedido:', erro);
      alert('Erro ao enviar pedido. Tente novamente.');
    } finally {
      setEnviandoPedido(false);
    }
  };

  // Voltar para seleção de mesa
  const voltarParaMesas = () => {
    setMesaSelecionada(null);
    setCarrinho([]);
    setEtapa('selecao-mesa');
  };

  // Novo pedido
  const fazerNovoPedido = () => {
    setMesaSelecionada(null);
    setCarrinho([]);
    setEtapa('selecao-mesa');
  };

  // TELA DE SELEÇÃO DE MESA
  if (etapa === 'selecao-mesa') {
    return (
      <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif' }}>
        <header style={{ 
          backgroundColor: '#b71c1c', 
          color: 'white', 
          padding: '25px', 
          textAlign: 'center',
          borderRadius: '15px',
          marginBottom: '30px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '3em', fontWeight: 'bold' }}>
            🍔 Jetro's Lanches
          </h1>
          <p style={{ margin: '0 0 10px 0', fontSize: '1.6em', fontWeight: '600' }}>
            Cardápio Digital
          </p>
          <p style={{ margin: '0', fontSize: '1.3em' }}>
            📞 99611-2820 | 3822-7097
          </p>
        </header>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#333', marginBottom: '15px', fontSize: '2.2em', fontWeight: 'bold' }}>
            Selecione sua Mesa
          </h2>
          <p style={{ color: '#666', fontSize: '1.3em' }}>
            Escolha o número da sua mesa para começar
          </p>
        </div>

        {erro ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '50px',
            backgroundColor: '#ffebee',
            borderRadius: '10px',
            margin: '20px'
          }}>
            <div style={{ fontSize: '3em', marginBottom: '20px' }}>😞</div>
            <p style={{ color: '#b71c1c', marginBottom: '20px', fontSize: '1.3em' }}>
              {erro}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#b71c1c',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1.2em',
                fontWeight: 'bold'
              }}
            >
              Recarregar Página
            </button>
          </div>
        ) : carregando ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div style={{ fontSize: '3em', marginBottom: '20px' }}>⏳</div>
            <p style={{ fontSize: '1.3em' }}>Carregando mesas...</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '20px',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            {mesas.map(mesa => (
              <button
                key={mesa.id}
                onClick={() => selecionarMesa(mesa)}
                style={{
                  backgroundColor: '#2e7d32',
                  color: 'white',
                  border: 'none',
                  padding: '25px 15px',
                  borderRadius: '15px',
                  fontSize: '1.8em',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease',
                  minHeight: '80px',
                  fontFamily: 'Arial, sans-serif'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                Mesa {mesa.numero}
              </button>
            ))}
          </div>
        )}

        <footer style={{ 
          marginTop: '60px', 
          textAlign: 'center', 
          color: '#666',
          padding: '30px'
        }}>
          <p style={{ margin: '0', fontSize: '1.2em' }}>
            © 2025 Jetro's Lanches - Cardápio Digital
          </p>
        </footer>
      </div>
    );
  }

  // TELA DE CONFIRMAÇÃO
  if (etapa === 'confirmacao') {
    return (
      <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif' }}>
        <header style={{ 
          backgroundColor: '#2e7d32', 
          color: 'white', 
          padding: '25px', 
          textAlign: 'center',
          borderRadius: '15px',
          marginBottom: '30px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '2.8em', fontWeight: 'bold' }}>
            ✅ Pedido Confirmado!
          </h1>
          <p style={{ margin: '0', fontSize: '1.6em', fontWeight: '600' }}>
            Mesa {mesaSelecionada.numero}
          </p>
        </header>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '15px',
          maxWidth: '500px',
          margin: '0 auto',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '4em', marginBottom: '20px' }}>🎉</div>
          <h2 style={{ color: '#2e7d32', marginBottom: '15px', fontSize: '2em', fontWeight: 'bold' }}>
            Pedido Recebido!
          </h2>
          <p style={{ color: '#666', marginBottom: '10px', fontSize: '1.3em' }}>
            Seu pedido foi enviado para a cozinha.
          </p>
          <p style={{ color: '#666', marginBottom: '25px', fontSize: '1.3em' }}>
            Aguarde que em breve será preparado!
          </p>
          
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '10px',
            marginBottom: '25px'
          }}>
            <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '1.5em', fontWeight: 'bold' }}>
              Resumo do Pedido
            </h3>
            {carrinho.map(item => (
              <div key={item.produto_id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px',
                fontSize: '1.2em'
              }}>
                <span>{item.quantidade}x {item.nome}</span>
                <span style={{ fontWeight: '600' }}>R$ {(Number(item.preco) * item.quantidade).toFixed(2)}</span>
              </div>
            ))}
            <hr style={{ margin: '15px 0' }} />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 'bold',
              fontSize: '1.4em'
            }}>
              <span>Total:</span>
              <span>R$ {calcularTotal().toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={fazerNovoPedido}
            style={{
              backgroundColor: '#b71c1c',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '10px',
              fontSize: '1.3em',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            Fazer Novo Pedido
          </button>
        </div>
      </div>
    );
  }

  // TELA DO CARDÁPIO (etapa === 'cardapio')
  return (
    <div style={{ 
      padding: '20px', 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5', 
      paddingBottom: '100px',
      fontFamily: 'Arial, sans-serif'
    }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <button
            onClick={voltarParaMesas}
            style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              padding: '12px 20px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '1.1em',
              fontWeight: 'bold',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            ← Trocar Mesa
          </button>
          <h1 style={{ margin: '0', fontSize: '2.2em', fontWeight: 'bold' }}>
            🍔 Jetro's Lanches
          </h1>
          <div style={{ width: '100px' }}></div>
        </div>
        <p style={{ margin: '0', fontSize: '1.4em', fontWeight: '600' }}>
          Mesa {mesaSelecionada.numero}
        </p>
      </header>

      {/* CARRINHO FLUTUANTE */}
      {carrinho.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#2e7d32',
          color: 'white',
          padding: '18px 26px',
          borderRadius: '50px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '1.2em',
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif'
        }}
        onClick={() => setEtapa('carrinho')}
        >
          <span style={{ fontSize: '1.4em' }}>🛒</span>
          <span>{carrinho.reduce((total, item) => total + item.quantidade, 0)} itens</span>
          <span>R$ {calcularTotal().toFixed(2)}</span>
        </div>
      )}

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
            fontSize: '1.8em',
            fontWeight: 'bold'
          }}>
            {categoria.nome}
          </h3>
          
          {categoria.descricao && (
            <p style={{ 
              color: '#666', 
              fontStyle: 'italic', 
              fontSize: '1.3em',
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
                  border: '2px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '15px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      margin: '0 0 8px 0', 
                      color: '#333',
                      fontSize: '1.5em',
                      fontWeight: 'bold'
                    }}>
                      {produto.nome}
                    </h4>
                    {produto.descricao && (
                      <p style={{ 
                        margin: '0', 
                        color: '#666', 
                        fontSize: '1.2em',
                        lineHeight: '1.4'
                      }}>
                        {produto.descricao}
                      </p>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ 
                      backgroundColor: '#2e7d32', 
                      color: 'white', 
                      padding: '10px 18px', 
                      borderRadius: '25px',
                      fontWeight: 'bold',
                      fontSize: '1.3em',
                      minWidth: '100px',
                      textAlign: 'center',
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      R$ {Number(produto.preco).toFixed(2)}
                    </span>
                    
                    <button
                      onClick={() => adicionarAoCarrinho(produto)}
                      style={{
                        backgroundColor: '#b71c1c',
                        color: 'white',
                        border: 'none',
                        padding: '14px 18px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1.3em',
                        fontFamily: 'Arial, sans-serif',
                        minWidth: '55px'
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      ))}

      {/* MODAL DO CARRINHO */}
      {etapa === 'carrinho' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            fontFamily: 'Arial, sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#333', fontSize: '1.8em', fontWeight: 'bold' }}>
                Seu Pedido
              </h2>
              <button
                onClick={() => setEtapa('cardapio')}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '1.8em',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>

            {carrinho.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '40px', fontSize: '1.3em' }}>
                Seu carrinho está vazio
              </p>
            ) : (
              <>
                <div style={{ marginBottom: '20px' }}>
                  {carrinho.map(item => (
                    <div key={item.produto_id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '15px 0',
                      borderBottom: '1px solid #eee'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '1.3em' }}>
                          {item.nome}
                        </div>
                        <div style={{ color: '#666', fontSize: '1.1em' }}>
                          R$ {Number(item.preco).toFixed(2)} cada
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          onClick={() => atualizarQuantidade(item.produto_id, item.quantidade - 1)}
                          style={{
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #ddd',
                            padding: '10px 14px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '1.1em',
                            fontWeight: 'bold',
                            fontFamily: 'Arial, sans-serif'
                          }}
                        >
                          -
                        </button>
                        
                        <span style={{ minWidth: '30px', textAlign: 'center', fontSize: '1.2em', fontWeight: 'bold' }}>
                          {item.quantidade}
                        </span>
                        
                        <button
                          onClick={() => atualizarQuantidade(item.produto_id, item.quantidade + 1)}
                          style={{
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #ddd',
                            padding: '10px 14px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '1.1em',
                            fontWeight: 'bold',
                            fontFamily: 'Arial, sans-serif'
                          }}
                        >
                          +
                        </button>
                        
                        <button
                          onClick={() => removerDoCarrinho(item.produto_id)}
                          style={{
                            backgroundColor: '#ffebee',
                            color: '#b71c1c',
                            border: 'none',
                            padding: '10px 14px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginLeft: '10px',
                            fontSize: '1.1em',
                            fontWeight: 'bold',
                            fontFamily: 'Arial, sans-serif'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  borderTop: '2px solid #eee',
                  paddingTop: '20px',
                  marginBottom: '25px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 'bold',
                    fontSize: '1.4em'
                  }}>
                    <span>Total:</span>
                    <span>R$ {calcularTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={finalizarPedido}
                  disabled={enviandoPedido}
                  style={{
                    backgroundColor: enviandoPedido ? '#ccc' : '#2e7d32',
                    color: 'white',
                    border: 'none',
                    padding: '18px',
                    borderRadius: '10px',
                    fontSize: '1.3em',
                    fontWeight: 'bold',
                    cursor: enviandoPedido ? 'not-allowed' : 'pointer',
                    width: '100%',
                    fontFamily: 'Arial, sans-serif'
                  }}
                >
                  {enviandoPedido ? 'Enviando...' : `Finalizar Pedido - R$ ${calcularTotal().toFixed(2)}`}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ 
        marginTop: '60px', 
        textAlign: 'center', 
        color: '#666',
        padding: '30px'
      }}>
        <p style={{ margin: '0', fontSize: '1.2em' }}>
          © 2025 Jetro's Lanches - Cardápio Digital
        </p>
      </footer>
    </div>
  );
}

export default App;