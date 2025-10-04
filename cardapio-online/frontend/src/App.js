import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Estados do sistema
  const [etapa, setEtapa] = useState('selecao-mesa');
  const [mesas, setMesas] = useState([]);
  const [mesaSelecionada, setMesaSelecionada] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [pedidoEnviado, setPedidoEnviado] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [resMesas, resCategorias, resProdutos] = await Promise.all([
          fetch('/api/mesas'),
          fetch('/api/categorias'),
          fetch('/api/produtos')
        ]);

        const dadosMesas = await resMesas.json();
        const dadosCategorias = await resCategorias.json();
        const dadosProdutos = await resProdutos.json();

        setMesas(dadosMesas);
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

  // Selecionar mesa
  const selecionarMesa = (mesa) => {
    setMesaSelecionada(mesa);
    setEtapa('cardapio');
  };

  // Adicionar item ao carrinho
  const adicionarAoCarrinho = (produto) => {
    const itemExistente = carrinho.find(item => item.produto_id === produto.id);
    
    // CONVERTER preco para número
    const precoNumerico = Number(produto.preco);
    
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
    return carrinho.reduce((total, item) => total + (Number(item.preco) * item.quantidade), 0);
  };

  // Finalizar pedido - CORRIGIDO COM CSRF TOKEN
  const finalizarPedido = async () => {
    try {
      // Primeiro, pegue o CSRF token
      await fetch('/sanctum/csrf-cookie');
      
      const pedidoData = {
        mesa_id: mesaSelecionada.id,
        itens: carrinho.map(item => ({
          ...item,
          preco: Number(item.preco)
        }))
      };

      const resposta = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify(pedidoData)
      });

      const resultado = await resposta.json();

      if (resultado.success) {
        setPedidoEnviado(true);
        setEtapa('confirmacao');
      } else {
        alert('Erro ao enviar pedido: ' + resultado.error);
      }

    } catch (erro) {
      console.error('Erro ao finalizar pedido:', erro);
      alert('Erro ao enviar pedido. Tente novamente.');
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
    setPedidoEnviado(false);
    setEtapa('selecao-mesa');
  };

  // TELA DE SELEÇÃO DE MESA
  if (etapa === 'selecao-mesa') {
    return (
      <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
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

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#333', marginBottom: '10px' }}>Selecione sua Mesa</h2>
          <p style={{ color: '#666' }}>Escolha o número da sua mesa para começar</p>
        </div>

        {carregando ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p>Carregando mesas...</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '15px',
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
                  fontSize: '1.5em',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease'
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
          <p style={{ margin: '0', fontSize: '1.1em' }}>
            © 2025 Jetro's Lanches - Cardápio Digital
          </p>
        </footer>
      </div>
    );
  }

  // TELA DE CONFIRMAÇÃO
  if (etapa === 'confirmacao') {
    return (
      <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <header style={{ 
          backgroundColor: '#2e7d32', 
          color: 'white', 
          padding: '25px', 
          textAlign: 'center',
          borderRadius: '15px',
          marginBottom: '30px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5em' }}>✅ Pedido Confirmado!</h1>
          <p style={{ margin: '0', fontSize: '1.2em' }}>Mesa {mesaSelecionada.numero}</p>
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
          <h2 style={{ color: '#2e7d32', marginBottom: '15px' }}>Pedido Recebido!</h2>
          <p style={{ color: '#666', marginBottom: '10px' }}>
            Seu pedido foi enviado para a cozinha.
          </p>
          <p style={{ color: '#666', marginBottom: '25px' }}>
            Aguarde que em breve será preparado!
          </p>
          
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '10px',
            marginBottom: '25px'
          }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>Resumo do Pedido</h3>
            {carrinho.map(item => (
              <div key={item.produto_id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <span>{item.quantidade}x {item.nome}</span>
                <span>R$ {(Number(item.preco) * item.quantidade).toFixed(2)}</span>
              </div>
            ))}
            <hr style={{ margin: '15px 0' }} />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 'bold',
              fontSize: '1.1em'
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
              padding: '15px 30px',
              borderRadius: '10px',
              fontSize: '1.1em',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%'
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
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '100px' }}>
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
              padding: '8px 15px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.9em'
            }}
          >
            ← Trocar Mesa
          </button>
          <h1 style={{ margin: '0', fontSize: '2em' }}>🍔 Jetro's Lanches</h1>
          <div style={{ width: '100px' }}></div>
        </div>
        <p style={{ margin: '0', fontSize: '1.1em' }}>Mesa {mesaSelecionada.numero}</p>
      </header>

      {/* CARRINHO FLUTUANTE */}
      {carrinho.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#2e7d32',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '50px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
        onClick={() => setEtapa('carrinho')}
        >
          <span style={{ fontSize: '1.2em' }}>🛒</span>
          <span style={{ fontWeight: 'bold' }}>{carrinho.reduce((total, item) => total + item.quantidade, 0)} itens</span>
          <span style={{ fontWeight: 'bold' }}>R$ {calcularTotal().toFixed(2)}</span>
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
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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
                    
                    <button
                      onClick={() => adicionarAoCarrinho(produto)}
                      style={{
                        backgroundColor: '#b71c1c',
                        color: 'white',
                        border: 'none',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1.1em'
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
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#333' }}>Seu Pedido</h2>
              <button
                onClick={() => setEtapa('cardapio')}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '1.5em',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>

            {carrinho.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
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
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{item.nome}</div>
                        <div style={{ color: '#666', fontSize: '0.9em' }}>R$ {Number(item.preco).toFixed(2)} cada</div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          onClick={() => atualizarQuantidade(item.produto_id, item.quantidade - 1)}
                          style={{
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #ddd',
                            padding: '5px 10px',
                            borderRadius: '5px',
                            cursor: 'pointer'
                          }}
                        >
                          -
                        </button>
                        
                        <span style={{ minWidth: '30px', textAlign: 'center' }}>
                          {item.quantidade}
                        </span>
                        
                        <button
                          onClick={() => atualizarQuantidade(item.produto_id, item.quantidade + 1)}
                          style={{
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #ddd',
                            padding: '5px 10px',
                            borderRadius: '5px',
                            cursor: 'pointer'
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
                            padding: '5px 10px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginLeft: '10px'
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
                    fontSize: '1.2em'
                  }}>
                    <span>Total:</span>
                    <span>R$ {calcularTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={finalizarPedido}
                  style={{
                    backgroundColor: '#2e7d32',
                    color: 'white',
                    border: 'none',
                    padding: '15px',
                    borderRadius: '10px',
                    fontSize: '1.1em',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  Finalizar Pedido - R$ {calcularTotal().toFixed(2)}
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
        <p style={{ margin: '0', fontSize: '1.1em' }}>
          © 2025 Jetro's Lanches - Cardápio Digital
        </p>
      </footer>
    </div>
  );
}

export default App;