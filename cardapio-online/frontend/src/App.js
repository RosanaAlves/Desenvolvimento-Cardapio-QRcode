import React, { useState, useEffect } from 'react';

// 🔥 CORREÇÃO: URL base da API - use localhost:8000 diretamente
const API_BASE_URL = 'http://localhost:8000';

// Função para fetch com tratamento de erro
const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    // 🔥 CORREÇÃO: Adicione credentials: 'include' em TODAS as chamadas
    const response = await fetch(`${API_BASE_URL}${url}`, {
      credentials: 'include', // ← ESTA LINHA É ESSENCIAL
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
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
  const [etapa, setEtapa] = useState('coletar-nome');
  const [nomeCliente, setNomeCliente] = useState('');
  const [mesas, setMesas] = useState([]);
  const [mesaSelecionada, setMesaSelecionada] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [enviandoPedido, setEnviandoPedido] = useState(false);
  const [resumoConta, setResumoConta] = useState(null);

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        setErro(null);

        // 🔥 CORREÇÃO: URLs completas com /api
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

  // Avançar para seleção de mesa após coletar nome
  const avancarParaMesas = () => {
    if (nomeCliente.trim() === '') {
      alert('Por favor, informe seu nome');
      return;
    }
    setEtapa('selecao-mesa');
  };

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

  // Finalizar pedido - ATUALIZADO
  const finalizarPedido = async () => {
    try {
      setEnviandoPedido(true);

      // 🔥 CORREÇÃO: Preparar dados do pedido
      const pedidoData = {
        mesa_id: mesaSelecionada.id,
        cliente_nome: nomeCliente,
        itens: carrinho.map(item => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          observacoes: item.observacoes || ''
        }))
      };

      // 🔥 CORREÇÃO: Fazer a requisição diretamente
      const resultado = await fetchWithErrorHandling('/api/pedidos', {
        method: 'POST',
        body: JSON.stringify(pedidoData)
      });

      if (resultado.success) {
        setEtapa('confirmacao');
        setCarrinho([]); // Limpar carrinho após sucesso
      } else {
        throw new Error(resultado.message || 'Erro desconhecido ao enviar pedido');
      }

    } catch (erro) {
      console.error('Erro ao finalizar pedido:', erro);
      alert('Erro ao enviar pedido. Tente novamente.');
    } finally {
      setEnviandoPedido(false);
    }
  };

  // Fechar conta
  const fecharConta = async () => {
    try {
      const resultado = await fetchWithErrorHandling(`/api/mesas/${mesaSelecionada.id}/fechar-conta`, {
        method: 'POST'
      });
      
      if (resultado.success) {
        setResumoConta(resultado);
        setEtapa('conta-fechada');
      } else {
        throw new Error(resultado.message || 'Erro ao fechar conta');
      }
    } catch (erro) {
      console.error('Erro ao fechar conta:', erro);
      alert('Erro ao fechar conta. Tente novamente.');
    }
  };

  // Voltar para seleção de mesa
  const voltarParaMesas = () => {
    setMesaSelecionada(null);
    setCarrinho([]);
    setEtapa('selecao-mesa');
  };

  // Voltar para coletar nome
  const voltarParaNome = () => {
    setMesaSelecionada(null);
    setCarrinho([]);
    setEtapa('coletar-nome');
  };

  // Novo pedido
  const fazerNovoPedido = () => {
    setMesaSelecionada(null);
    setCarrinho([]);
    setNomeCliente('');
    setResumoConta(null);
    setEtapa('coletar-nome');
  };

  // Estilos de fonte acessíveis
  const estilos = {
    fontePrimaria: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      lineHeight: '1.6'
    },
    titulo: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      fontWeight: '700',
      lineHeight: '1.3'
    },
    subtitulo: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      fontWeight: '600',
      lineHeight: '1.4'
    },
    texto: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      fontWeight: '400',
      lineHeight: '1.5'
    },
    botao: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      fontWeight: '600',
      fontSize: '1em'
    }
  };

  // 🔥 TESTE RÁPIDO: Adicione este useEffect para debug
  useEffect(() => {
    console.log('🔧 Debug - API_BASE_URL:', API_BASE_URL);
    console.log('🔧 Debug - Etapa atual:', etapa);
  }, [etapa]);

  // TELA DE COLETAR NOME
  if (etapa === 'coletar-nome') {
    return (
      <div style={{ 
        padding: '20px', 
        minHeight: '100vh', 
        backgroundColor: '#f5f5f5',
        ...estilos.fontePrimaria
      }}>
        <header style={{ 
          backgroundColor: '#b71c1c', 
          color: 'white', 
          padding: '25px', 
          textAlign: 'center',
          borderRadius: '15px',
          marginBottom: '30px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}>
          <h1 style={{ 
            margin: '0 0 10px 0', 
            fontSize: '2.8em',
            ...estilos.titulo
          }}>
            🍔 Jetro's Lanches
          </h1>
          <p style={{ 
            margin: '0 0 10px 0', 
            fontSize: '1.4em',
            ...estilos.subtitulo
          }}>
            Cardápio Digital
          </p>
          <p style={{ 
            margin: '0', 
            fontSize: '1.2em',
            ...estilos.texto
          }}>
            📞 99611-2820 | 3822-7097
          </p>
        </header>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '15px',
          maxWidth: '500px',
          margin: '0 auto',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '4em', marginBottom: '20px' }}>👤</div>
          <h2 style={{ 
            color: '#333', 
            marginBottom: '15px',
            ...estilos.titulo,
            fontSize: '1.8em'
          }}>
            Bem-vindo!
          </h2>
          <p style={{ 
            color: '#666', 
            marginBottom: '30px',
            ...estilos.texto,
            fontSize: '1.2em'
          }}>
            Para começar, por favor informe seu nome
          </p>
          
          <input
            type="text"
            value={nomeCliente}
            onChange={(e) => setNomeCliente(e.target.value)}
            placeholder="Digite seu nome completo"
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '1.2em',
              border: '2px solid #ddd',
              borderRadius: '10px',
              marginBottom: '20px',
              textAlign: 'center',
              ...estilos.texto
            }}
            onKeyPress={(e) => e.key === 'Enter' && avancarParaMesas()}
          />
          
          <button
            onClick={avancarParaMesas}
            disabled={!nomeCliente.trim()}
            style={{
              backgroundColor: nomeCliente.trim() ? '#2e7d32' : '#ccc',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '10px',
              fontSize: '1.2em',
              ...estilos.botao,
              cursor: nomeCliente.trim() ? 'pointer' : 'not-allowed',
              width: '100%'
            }}
          >
            Continuar para Mesas
          </button>
        </div>

        <footer style={{ 
          marginTop: '60px', 
          textAlign: 'center', 
          color: '#666',
          padding: '30px'
        }}>
          <p style={{ 
            margin: '0', 
            fontSize: '1.1em',
            ...estilos.texto
          }}>
            © 2025 Jetro's Lanches - Cardápio Digital
          </p>
        </footer>
      </div>
    );
  }

  // TELA DE SELEÇÃO DE MESA
  if (etapa === 'selecao-mesa') {
    return (
      <div style={{ 
        padding: '20px', 
        minHeight: '100vh', 
        backgroundColor: '#f5f5f5',
        ...estilos.fontePrimaria
      }}>
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
              onClick={voltarParaNome}
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: '8px 15px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.9em',
                ...estilos.botao
              }}
            >
              ← Voltar
            </button>
            <h1 style={{ 
              margin: '0', 
              fontSize: '2.2em',
              ...estilos.titulo
            }}>
              🍔 Jetro's Lanches
            </h1>
            <div style={{ width: '100px' }}></div>
          </div>
          <p style={{ 
            margin: '0 0 10px 0', 
            fontSize: '1.3em',
            ...estilos.subtitulo
          }}>
            Olá, {nomeCliente}!
          </p>
          <p style={{ 
            margin: '0', 
            fontSize: '1.1em',
            ...estilos.texto
          }}>
            📞 99611-2820 | 3822-7097
          </p>
        </header>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ 
            color: '#333', 
            marginBottom: '15px',
            ...estilos.titulo,
            fontSize: '1.8em'
          }}>
            Selecione sua Mesa
          </h2>
          <p style={{ 
            color: '#666',
            ...estilos.texto,
            fontSize: '1.1em'
          }}>
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
            <p style={{ 
              color: '#b71c1c', 
              marginBottom: '20px',
              ...estilos.texto,
              fontSize: '1.1em'
            }}>
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
                ...estilos.botao,
                fontSize: '1em'
              }}
            >
              Recarregar Página
            </button>
          </div>
        ) : carregando ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div style={{ fontSize: '3em', marginBottom: '20px' }}>⏳</div>
            <p style={estilos.texto}>Carregando mesas...</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '20px',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            {mesas.filter(mesa => mesa.status === 'livre').map(mesa => (
              <button
                key={mesa.id}
                onClick={() => selecionarMesa(mesa)}
                style={{
                  backgroundColor: '#2e7d32',
                  color: 'white',
                  border: 'none',
                  padding: '25px 15px',
                  borderRadius: '15px',
                  fontSize: '1.6em',
                  ...estilos.botao,
                  cursor: 'pointer',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease',
                  minHeight: '80px'
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
          <p style={{ 
            margin: '0', 
            fontSize: '1.1em',
            ...estilos.texto
          }}>
            © 2025 Jetro's Lanches - Cardápio Digital
          </p>
        </footer>
      </div>
    );
  }

  // TELA DE CONFIRMAÇÃO DE PEDIDO
  if (etapa === 'confirmacao') {
    return (
      <div style={{ 
        padding: '20px', 
        minHeight: '100vh', 
        backgroundColor: '#f5f5f5',
        ...estilos.fontePrimaria
      }}>
        <header style={{ 
          backgroundColor: '#2e7d32', 
          color: 'white', 
          padding: '25px', 
          textAlign: 'center',
          borderRadius: '15px',
          marginBottom: '30px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}>
          <h1 style={{ 
            margin: '0 0 10px 0', 
            fontSize: '2.3em',
            ...estilos.titulo
          }}>
            ✅ Pedido Confirmado!
          </h1>
          <p style={{ 
            margin: '0', 
            fontSize: '1.3em',
            ...estilos.subtitulo
          }}>
            Mesa {mesaSelecionada.numero} - {nomeCliente}
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
          <h2 style={{ 
            color: '#2e7d32', 
            marginBottom: '15px',
            ...estilos.titulo,
            fontSize: '1.8em'
          }}>
            Pedido Recebido!
          </h2>
          <p style={{ 
            color: '#666', 
            marginBottom: '10px',
            ...estilos.texto,
            fontSize: '1.1em'
          }}>
            Seu pedido foi enviado para a cozinha.
          </p>
          <p style={{ 
            color: '#666', 
            marginBottom: '25px',
            ...estilos.texto,
            fontSize: '1.1em'
          }}>
            Aguarde que em breve será preparado!
          </p>
          
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '10px',
            marginBottom: '25px'
          }}>
            <h3 style={{ 
              color: '#333', 
              marginBottom: '15px',
              ...estilos.subtitulo
            }}>
              Resumo do Pedido
            </h3>
            {carrinho.map(item => (
              <div key={item.produto_id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px',
                ...estilos.texto
              }}>
                <span>{item.quantidade}x {item.nome}</span>
                <span style={{ fontWeight: '600' }}>R$ {(Number(item.preco) * item.quantidade).toFixed(2)}</span>
              </div>
            ))}
            <hr style={{ margin: '15px 0' }} />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              ...estilos.subtitulo,
              fontSize: '1.2em'
            }}>
              <span>Total:</span>
              <span>R$ {calcularTotal().toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={() => setEtapa('cardapio')}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '15px 25px',
                borderRadius: '10px',
                fontSize: '1.1em',
                ...estilos.botao,
                cursor: 'pointer',
                flex: 1
              }}
            >
              Fazer Mais Pedidos
            </button>
            
            <button
              onClick={fecharConta}
              style={{
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                padding: '15px 25px',
                borderRadius: '10px',
                fontSize: '1.1em',
                ...estilos.botao,
                cursor: 'pointer',
                flex: 1
              }}
            >
              🧾 Fechar Conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  // TELA CONTA FECHADA
  if (etapa === 'conta-fechada') {
    return (
      <div style={{ 
        padding: '20px', 
        minHeight: '100vh', 
        backgroundColor: '#f5f5f5',
        ...estilos.fontePrimaria
      }}>
        <header style={{ 
          backgroundColor: '#ff9800', 
          color: 'white', 
          padding: '25px', 
          textAlign: 'center',
          borderRadius: '15px',
          marginBottom: '30px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}>
          <h1 style={{ 
            margin: '0 0 10px 0', 
            fontSize: '2.3em',
            ...estilos.titulo
          }}>
            🧾 Conta Fechada!
          </h1>
          <p style={{ 
            margin: '0', 
            fontSize: '1.3em',
            ...estilos.subtitulo
          }}>
            Mesa {mesaSelecionada.numero} - {nomeCliente}
          </p>
        </header>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '15px',
          maxWidth: '600px',
          margin: '0 auto',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <div style={{ fontSize: '4em', marginBottom: '15px' }}>💰</div>
            <h2 style={{ 
              color: '#ff9800', 
              marginBottom: '10px',
              ...estilos.titulo
            }}>
              Resumo da Conta
            </h2>
            <p style={{ 
              color: '#666',
              ...estilos.texto
            }}>
              Dirija-se ao caixa para efetuar o pagamento
            </p>
          </div>

          {resumoConta && (
            <>
              <div style={{ 
                backgroundColor: '#fff3cd', 
                padding: '20px', 
                borderRadius: '10px',
                marginBottom: '25px',
                border: '2px solid #ffeaa7'
              }}>
                <h3 style={{ 
                  color: '#856404', 
                  marginBottom: '15px',
                  textAlign: 'center',
                  ...estilos.subtitulo
                }}>
                  Total a Pagar
                </h3>
                <div style={{
                  textAlign: 'center',
                  fontSize: '2.5em',
                  fontWeight: 'bold',
                  color: '#2e7d32'
                }}>
                  R$ {Number(resumoConta.total_conta).toFixed(2)}
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ 
                  color: '#333', 
                  marginBottom: '15px',
                  ...estilos.subtitulo
                }}>
                  Todos os Pedidos
                </h3>
                {resumoConta.pedidos && resumoConta.pedidos.map(pedido => (
                  <div key={pedido.id} style={{
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontWeight: 'bold' }}>Pedido #{pedido.id}</span>
                      <span style={{ 
                        backgroundColor: '#007bff',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8em'
                      }}>
                        {pedido.status}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: '#666',
                      fontSize: '0.9em'
                    }}>
                      <span>{new Date(pedido.created_at).toLocaleString('pt-BR')}</span>
                      <span style={{ fontWeight: 'bold' }}>R$ {Number(pedido.total).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <button
            onClick={fazerNovoPedido}
            style={{
              backgroundColor: '#b71c1c',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '10px',
              fontSize: '1.1em',
              ...estilos.botao,
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
    <div style={{ 
      padding: '20px', 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5', 
      paddingBottom: '100px',
      ...estilos.fontePrimaria
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
              padding: '10px 20px',
              borderRadius: '20px',
              cursor: 'pointer',
              ...estilos.botao,
              fontSize: '0.9em'
            }}
          >
            ← Trocar Mesa
          </button>
          <h1 style={{ 
            margin: '0', 
            fontSize: '1.8em',
            ...estilos.titulo
          }}>
            🍔 Jetro's Lanches
          </h1>
          <div style={{ width: '100px' }}></div>
        </div>
        <p style={{ 
          margin: '0', 
          fontSize: '1.2em',
          ...estilos.subtitulo
        }}>
          Mesa {mesaSelecionada.numero} - {nomeCliente}
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
          padding: '16px 24px',
          borderRadius: '50px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          ...estilos.botao
        }}
        onClick={() => setEtapa('carrinho')}
        >
          <span style={{ fontSize: '1.3em' }}>🛒</span>
          <span>{carrinho.reduce((total, item) => total + item.quantidade, 0)} itens</span>
          <span>R$ {calcularTotal().toFixed(2)}</span>
        </div>
      )}

      {/* BOTÃO FECHAR CONTA NO CARDÁPIO */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={fecharConta}
          style={{
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '10px',
            fontSize: '1.1em',
            ...estilos.botao,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          🧾 Fechar Conta
        </button>
      </div>

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
            fontSize: '1.6em',
            ...estilos.titulo
          }}>
            {categoria.nome}
          </h3>
          
          {categoria.descricao && (
            <p style={{ 
              color: '#666', 
              fontStyle: 'italic', 
              fontSize: '1.1em',
              marginBottom: '25px',
              ...estilos.texto
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
                      fontSize: '1.2em',
                      ...estilos.subtitulo
                    }}>
                      {produto.nome}
                    </h4>
                    {produto.descricao && (
                      <p style={{ 
                        margin: '0', 
                        color: '#666', 
                        fontSize: '1em',
                        lineHeight: '1.4',
                        ...estilos.texto
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
                      ...estilos.botao,
                      fontSize: '1em',
                      minWidth: '90px',
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
                        padding: '12px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        ...estilos.botao,
                        fontSize: '1.1em',
                        minWidth: '50px'
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
            ...estilos.fontePrimaria
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ 
                margin: 0, 
                color: '#333',
                ...estilos.titulo
              }}>
                Seu Pedido
              </h2>
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
              <p style={{ 
                textAlign: 'center', 
                color: '#666', 
                padding: '40px',
                ...estilos.texto
              }}>
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
                        <div style={{ 
                          fontWeight: '600', 
                          marginBottom: '5px',
                          ...estilos.subtitulo
                        }}>
                          {item.nome}
                        </div>
                        <div style={{ 
                          color: '#666', 
                          fontSize: '0.95em',
                          ...estilos.texto
                        }}>
                          R$ {Number(item.preco).toFixed(2)} cada
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          onClick={() => atualizarQuantidade(item.produto_id, item.quantidade - 1)}
                          style={{
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #ddd',
                            padding: '8px 12px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            ...estilos.botao,
                            fontSize: '0.9em'
                          }}
                        >
                          -
                        </button>
                        
                        <span style={{ 
                          minWidth: '30px', 
                          textAlign: 'center',
                          ...estilos.texto,
                          fontWeight: '600'
                        }}>
                          {item.quantidade}
                        </span>
                        
                        <button
                          onClick={() => atualizarQuantidade(item.produto_id, item.quantidade + 1)}
                          style={{
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #ddd',
                            padding: '8px 12px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            ...estilos.botao,
                            fontSize: '0.9em'
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
                            padding: '8px 12px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginLeft: '10px',
                            ...estilos.botao,
                            fontSize: '0.9em'
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
                    ...estilos.titulo,
                    fontSize: '1.2em'
                  }}>
                    <span>Total:</span>
                    <span>R$ {calcularTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setEtapa('cardapio')}
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '15px',
                      borderRadius: '10px',
                      fontSize: '1.1em',
                      ...estilos.botao,
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    Continuar Comprando
                  </button>
                  
                  <button
                    onClick={finalizarPedido}
                    disabled={enviandoPedido}
                    style={{
                      backgroundColor: enviandoPedido ? '#ccc' : '#2e7d32',
                      color: 'white',
                      border: 'none',
                      padding: '15px',
                      borderRadius: '10px',
                      fontSize: '1.1em',
                      ...estilos.botao,
                      cursor: enviandoPedido ? 'not-allowed' : 'pointer',
                      flex: 1
                    }}
                  >
                    {enviandoPedido ? 'Enviando...' : `Finalizar Pedido`}
                  </button>
                </div>
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
        <p style={{ 
          margin: '0', 
          fontSize: '1.1em',
          ...estilos.texto
        }}>
          © 2025 Jetro's Lanches - Cardápio Digital
        </p>
      </footer>
    </div>
  );
}

export default App;