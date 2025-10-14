import React, { useState, useEffect } from 'react';

<<<<<<< Updated upstream
// Configuração da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
=======

// 🔥 CORREÇÃO: URL base da API - use localhost:8000 diretamente
const API_BASE_URL = 'http://localhost:8000';
>>>>>>> Stashed changes

// Função para fetch com tratamento de erro
const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      credentials: 'include',
<<<<<<< Updated upstream
=======
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
>>>>>>> Stashed changes
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
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
<<<<<<< Updated upstream
  // Estados do sistema
  const [etapa, setEtapa] = useState('selecao-mesa');
=======
  // Estados do sistema - ATUALIZADOS
  const [etapa, setEtapa] = useState('coletar-garcom');
  const [garcomNome, setGarcomNome] = useState('');
>>>>>>> Stashed changes
  const [mesas, setMesas] = useState([]);
  const [mesaSelecionada, setMesaSelecionada] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [enviandoPedido, setEnviandoPedido] = useState(false);
<<<<<<< Updated upstream
=======
  const [resumoConta, setResumoConta] = useState(null);
  const [itemComObservacao, setItemComObservacao] = useState(null);
>>>>>>> Stashed changes

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        setErro(null);

<<<<<<< Updated upstream
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
=======
        // ✅ CORREÇÃO: Carregar mesas e categorias separadamente
        const dadosMesas = await fetchWithErrorHandling('/api/garcom/mesas/status');
        const dadosCategorias = await fetchWithErrorHandling('/api/garcom/cardapio/categorias');

        console.log('📦 Dados recebidos - Mesas:', dadosMesas);
        console.log('📦 Dados recebidos - Categorias:', dadosCategorias);

        // ✅ CORREÇÃO: Formatação dos dados com fallback
        const mesasFormatadas = dadosMesas.success ? dadosMesas.data : (Array.isArray(dadosMesas) ? dadosMesas : []);
        const categoriasFormatadas = dadosCategorias.success ? dadosCategorias.data : (Array.isArray(dadosCategorias) ? dadosCategorias : []);

        if (!Array.isArray(mesasFormatadas)) {
          console.error('❌ Formato inválido de mesas:', dadosMesas);
          throw new Error('Formato inválido de mesas');
        }

        if (!Array.isArray(categoriasFormatadas)) {
          console.error('❌ Formato inválido de categorias:', dadosCategorias);
          throw new Error('Formato inválido de categorias');
        }

        setMesas(mesasFormatadas);
        setCategorias(categoriasFormatadas);
>>>>>>> Stashed changes
        
      } catch (erro) {
        console.error('❌ Erro ao carregar dados:', erro);
        setErro('Erro ao carregar cardápio. Tente recarregar a página.');
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

<<<<<<< Updated upstream
  // Selecionar mesa
  const selecionarMesa = (mesa) => {
    setMesaSelecionada(mesa);
    setEtapa('cardapio');
=======
  // ✅ ATUALIZADO: Avançar para seleção de mesa após coletar nome do GARÇOM
  const avancarParaMesas = () => {
    if (garcomNome.trim() === '') {
      alert('Por favor, informe o nome do garçom');
      return;
    }
    setEtapa('selecao-mesa');
  };

  // ✅ ATUALIZADO: Selecionar mesa com nome do GARÇOM
  const selecionarMesa = async (mesa) => {
    // Se mesa já está ocupada, apenas seleciona
    if (mesa.status === 'ocupada') {
      setMesaSelecionada(mesa);
      setEtapa('cardapio');
      return;
    }

    // Se mesa está livre, ocupa com nome do garçom
    try {
      const resultado = await fetchWithErrorHandling(`/api/garcom/mesas/${mesa.id}/ocupar`, {
        method: 'POST',
        body: JSON.stringify({
          garcom_nome: garcomNome
        })
      });

      if (resultado.success) {
        setMesaSelecionada(resultado.data);
        setEtapa('cardapio');
      }
    } catch (erro) {
      console.error('Erro ao ocupar mesa:', erro);
      alert('Erro ao ocupar mesa. Tente novamente.');
    }
>>>>>>> Stashed changes
  };

  // ✅ NOVO: Adicionar item ao carrinho com observações
  const adicionarAoCarrinho = (produto) => {
    setItemComObservacao({
      produto: produto,
      observacoes: ''
    });
  };

  // ✅ NOVO: Confirmar item com observações
  const confirmarItemComObservacoes = () => {
    if (!itemComObservacao) return;

    const { produto, observacoes } = itemComObservacao;
    const itemExistente = carrinho.find(item => 
      item.produto_id === produto.id && 
      item.observacoes === observacoes
    );

    const precoNumerico = Number(produto.preco);
    
    if (isNaN(precoNumerico)) {
      console.error('Preço inválido:', produto.preco);
      return;
    }

    if (itemExistente) {
      setCarrinho(carrinho.map(item =>
        item.produto_id === produto.id && item.observacoes === observacoes
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ));
    } else {
      setCarrinho([...carrinho, {
        produto_id: produto.id,
        nome: produto.nome,
        preco: precoNumerico,
        quantidade: 1,
        observacoes: observacoes || ''
      }]);
    }

    setItemComObservacao(null);
  };

  // Remover item do carrinho
  const removerDoCarrinho = (produtoId, observacoes = '') => {
    setCarrinho(carrinho.filter(item => 
      !(item.produto_id === produtoId && item.observacoes === observacoes)
    ));
  };

  // Atualizar quantidade
  const atualizarQuantidade = (produtoId, novaQuantidade, observacoes = '') => {
    if (novaQuantidade < 1) {
      removerDoCarrinho(produtoId, observacoes);
      return;
    }
    
    setCarrinho(carrinho.map(item =>
      item.produto_id === produtoId && item.observacoes === observacoes
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

<<<<<<< Updated upstream
  // Finalizar pedido - MELHORADO
=======
  // ✅ ATUALIZADO: Finalizar pedido com GARÇOM_NOME
>>>>>>> Stashed changes
  const finalizarPedido = async () => {
    try {
      setEnviandoPedido(true);

<<<<<<< Updated upstream
      // 1. Primeiro garantir o CSRF token
      await fetchWithErrorHandling('/sanctum/csrf-cookie', {
        method: 'GET'
      });

      // 2. Preparar dados do pedido
      const pedidoData = {
        mesa_id: mesaSelecionada.id,
=======
      const pedidoData = {
        mesa_id: mesaSelecionada.id,
        garcom_nome: garcomNome,
>>>>>>> Stashed changes
        itens: carrinho.map(item => ({
          produto_id: item.produto_id,
          nome: item.nome,
          preco: Number(item.preco),
          quantidade: item.quantidade,
          observacoes: item.observacoes
        }))
      };

<<<<<<< Updated upstream
      // 3. Fazer a requisição do pedido
      const resultado = await fetchWithErrorHandling('/api/pedidos', {
=======
      const resultado = await fetchWithErrorHandling('/api/garcom/pedidos', {
>>>>>>> Stashed changes
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(pedidoData)
      });

      if (resultado.success || resultado.id) {
        setEtapa('confirmacao');
<<<<<<< Updated upstream
=======
        setCarrinho([]);
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
  // Voltar para seleção de mesa
=======
  // ✅ ATUALIZADO: Fechar conta com validação
  const fecharConta = async () => {
    try {
      const resultado = await fetchWithErrorHandling(`/api/garcom/mesas/${mesaSelecionada.id}/fechar-conta`, {
        method: 'POST'
      });
      
      if (resultado.success) {
        setResumoConta(resultado);
        setEtapa('conta-fechada');
      } else {
        if (resultado.error && resultado.error.includes('Sem pedidos')) {
          alert('Sem pedidos realizados!');
          return;
        }
        throw new Error(resultado.message || 'Erro ao fechar conta');
      }
    } catch (erro) {
      console.error('Erro ao fechar conta:', erro);
      alert(erro.message || 'Erro ao fechar conta. Tente novamente.');
    }
  };

  // ✅ ATUALIZADO: Pagar conta
  const pagarConta = async () => {
    try {
      const resultado = await fetchWithErrorHandling(`/api/garcom/mesas/${mesaSelecionada.id}/pagar-conta`, {
        method: 'POST'
      });

      if (resultado.success) {
        alert('Conta paga com sucesso!');
        voltarParaMesas();
      }
    } catch (erro) {
      console.error('Erro ao pagar conta:', erro);
      alert('Erro ao processar pagamento.');
    }
  };

  // ✅ ATUALIZADO: Voltar para seleção de mesa
>>>>>>> Stashed changes
  const voltarParaMesas = () => {
    setMesaSelecionada(null);
    setCarrinho([]);
    setEtapa('selecao-mesa');
  };

<<<<<<< Updated upstream
  // Novo pedido
=======
  // ✅ ATUALIZADO: Voltar para coletar nome do GARÇOM
  const voltarParaGarcom = () => {
    setMesaSelecionada(null);
    setCarrinho([]);
    setGarcomNome('');
    setEtapa('coletar-garcom');
  };

  // ✅ ATUALIZADO: Novo pedido volta para MESAS
>>>>>>> Stashed changes
  const fazerNovoPedido = () => {
    setMesaSelecionada(null);
    setCarrinho([]);
    setEtapa('selecao-mesa');
  };

<<<<<<< Updated upstream
  // TELA DE SELEÇÃO DE MESA
=======
  // Estilos de fonte acessíveis - CORES ORIGINAIS MANTIDAS
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

  // 🔥 TELA DE COLETAR NOME DO GARÇOM (CORES ORIGINAIS)
  if (etapa === 'coletar-garcom') {
    return (
      <div style={{ 
        padding: '20px', 
        minHeight: '100vh', 
        backgroundColor: '#f5f5f5',
        ...estilos.fontePrimaria
      }}>
        <header style={{ 
          backgroundColor: '#b71c1c', // ✅ COR ORIGINAL: Vermelho
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
            Sistema do Garçom
          </p>
          <p style={{ 
            margin: '0', 
            fontSize: '1.2em',
            ...estilos.texto
          }}>
            👨‍💼 Painel de Atendimento
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
          <div style={{ fontSize: '4em', marginBottom: '20px' }}>👨‍💼</div>
          <h2 style={{ 
            color: '#333', 
            marginBottom: '15px',
            ...estilos.titulo,
            fontSize: '1.8em'
          }}>
            Identificação do Garçom
          </h2>
          <p style={{ 
            color: '#666', 
            marginBottom: '30px',
            ...estilos.texto,
            fontSize: '1.2em'
          }}>
            Por favor, informe seu nome para começar
          </p>
          
          <input
            type="text"
            value={garcomNome}
            onChange={(e) => setGarcomNome(e.target.value)}
            placeholder="Digite seu nome"
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
            disabled={!garcomNome.trim()}
            style={{
              backgroundColor: garcomNome.trim() ? '#b71c1c' : '#ccc', // ✅ COR ORIGINAL: Vermelho
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '10px',
              fontSize: '1.2em',
              ...estilos.botao,
              cursor: garcomNome.trim() ? 'pointer' : 'not-allowed',
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
            © 2025 Jetro's Lanches - Sistema Garçom
          </p>
        </footer>
      </div>
    );
  }

  // 🔥 TELA DE SELEÇÃO DE MESA (CORES ORIGINAIS)
>>>>>>> Stashed changes
  if (etapa === 'selecao-mesa') {
    return (
      <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif' }}>
        <header style={{ 
          backgroundColor: '#b71c1c', // ✅ COR ORIGINAL: Vermelho
          color: 'white', 
          padding: '25px', 
          textAlign: 'center',
          borderRadius: '15px',
          marginBottom: '30px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}>
<<<<<<< Updated upstream
          <h1 style={{ margin: '0 0 10px 0', fontSize: '3em', fontWeight: 'bold' }}>
            🍔 Jetro's Lanches
          </h1>
          <p style={{ margin: '0 0 10px 0', fontSize: '1.6em', fontWeight: '600' }}>
            Cardápio Digital
          </p>
          <p style={{ margin: '0', fontSize: '1.3em' }}>
            📞 99611-2820 | 3822-7097
=======
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <button
              onClick={voltarParaGarcom}
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
              ← Trocar Garçom
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
            Garçom: {garcomNome}
          </p>
          <p style={{ 
            margin: '0', 
            fontSize: '1.1em',
            ...estilos.texto
          }}>
            Selecione uma mesa para atender
>>>>>>> Stashed changes
          </p>
        </header>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
<<<<<<< Updated upstream
          <h2 style={{ color: '#333', marginBottom: '15px', fontSize: '2.2em', fontWeight: 'bold' }}>
            Selecione sua Mesa
          </h2>
          <p style={{ color: '#666', fontSize: '1.3em' }}>
            Escolha o número da sua mesa para começar
          </p>
=======
          <h2 style={{ 
            color: '#333', 
            marginBottom: '15px',
            ...estilos.titulo,
            fontSize: '1.8em'
          }}>
            Mesas Disponíveis
          </h2>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
          <div>
            {/* PAINEL DE STATUS - CORES ORIGINAIS */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '20px', 
              marginBottom: '30px',
              flexWrap: 'wrap'
            }}>
              <div style={{ 
                backgroundColor: '#2e7d32', // ✅ COR ORIGINAL: Verde
                color: 'white', 
                padding: '10px 20px', 
                borderRadius: '20px',
                ...estilos.botao
              }}>
                ✅ Livres: {mesas.filter(m => m.status === 'livre' || m.status === 'disponivel').length}
              </div>
              <div style={{ 
                backgroundColor: '#b71c1c', // ✅ COR ORIGINAL: Vermelho
                color: 'white', 
                padding: '10px 20px', 
                borderRadius: '20px',
                ...estilos.botao
              }}>
                🍽️ Ocupadas: {mesas.filter(m => m.status === 'ocupada').length}
              </div>
            </div>

            {/* MESAS - CORES ORIGINAIS */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '20px',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              {mesas.map(mesa => {
                const isOcupada = mesa.status === 'ocupada';
                const isFechada = mesa.status_pagamento === 'fechada';
                
                let corMesa = '#2e7d32'; // ✅ COR ORIGINAL: Verde - Livre
                let textoStatus = 'Livre';
                
                if (isOcupada && !isFechada) {
                  corMesa = '#b71c1c'; // ✅ COR ORIGINAL: Vermelho - Ocupada
                  textoStatus = 'Ocupada';
                } else if (isFechada) {
                  corMesa = '#ff9800'; // Laranja - Fechada
                  textoStatus = 'Fechada';
                }

                return (
                  <div key={mesa.id} style={{ position: 'relative' }}>
                    <button
                      onClick={() => selecionarMesa(mesa)}
                      style={{
                        backgroundColor: corMesa,
                        color: 'white',
                        border: 'none',
                        padding: '25px 15px',
                        borderRadius: '15px',
                        fontSize: '1.6em',
                        ...estilos.botao,
                        cursor: 'pointer',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s ease',
                        minHeight: '100px',
                        width: '100%'
                      }}
                      onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      Mesa {mesa.numero}
                      <div style={{
                        fontSize: '0.7em',
                        marginTop: '8px',
                        opacity: 0.9
                      }}>
                        {textoStatus}
                      </div>
                      {mesa.garcom_nome && (
                        <div style={{
                          fontSize: '0.6em',
                          marginTop: '5px',
                          opacity: 0.8
                        }}>
                          {mesa.garcom_nome}
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* LEGENDA ATUALIZADA */}
            <div style={{ 
              textAlign: 'center', 
              marginTop: '30px', 
              color: '#666',
              ...estilos.texto
            }}>
              <p>
                <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>Verde</span> = Livre • 
                <span style={{ color: '#b71c1c', fontWeight: 'bold' }}> Vermelho</span> = Ocupada • 
                <span style={{ color: '#ff9800', fontWeight: 'bold' }}> Laranja</span> = Fechada
              </p>
            </div>
>>>>>>> Stashed changes
          </div>
        )}

        <footer style={{ 
          marginTop: '60px', 
          textAlign: 'center', 
          color: '#666',
          padding: '30px'
        }}>
<<<<<<< Updated upstream
          <p style={{ margin: '0', fontSize: '1.2em' }}>
            © 2025 Jetro's Lanches - Cardápio Digital
=======
          <p style={{ 
            margin: '0', 
            fontSize: '1.1em',
            ...estilos.texto
          }}>
            © 2025 Jetro's Lanches - Sistema Garçom
>>>>>>> Stashed changes
          </p>
        </footer>
      </div>
    );
  }

<<<<<<< Updated upstream
  // TELA DE CONFIRMAÇÃO
=======
  // 🔥 MODAL DE OBSERVAÇÕES (NOVO)
  if (itemComObservacao) {
    return (
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
        zIndex: 3000,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '15px',
          maxWidth: '500px',
          width: '100%',
          ...estilos.fontePrimaria
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0',
            ...estilos.titulo,
            textAlign: 'center'
          }}>
            {itemComObservacao.produto.nome}
          </h3>
          
          <p style={{ 
            margin: '0 0 15px 0',
            color: '#666',
            ...estilos.texto
          }}>
            Preço: R$ {Number(itemComObservacao.produto.preco).toFixed(2)}
          </p>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: '600',
              ...estilos.subtitulo
            }}>
              Observações (opcional):
            </label>
            <textarea
              value={itemComObservacao.observacoes}
              onChange={(e) => setItemComObservacao({
                ...itemComObservacao,
                observacoes: e.target.value
              })}
              placeholder="Ex: Cortar ao meio, sem cebola, sem maionese, etc."
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                minHeight: '100px',
                resize: 'vertical',
                ...estilos.texto
              }}
            />
            <div style={{ 
              fontSize: '0.8em', 
              color: '#666', 
              marginTop: '5px',
              ...estilos.texto
            }}>
              💡 Dica: "Cortar ao meio", "Retirar [ingrediente]", "Adicionar [ingrediente]"
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setItemComObservacao(null)}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                flex: 1,
                ...estilos.botao
              }}
            >
              Cancelar
            </button>
            <button
              onClick={confirmarItemComObservacoes}
              style={{
                backgroundColor: '#b71c1c', // ✅ COR ORIGINAL: Vermelho
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                flex: 1,
                ...estilos.botao
              }}
            >
              Adicionar ao Pedido
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🔥 TELA DE CONFIRMAÇÃO DE PEDIDO (CORES ORIGINAIS)
>>>>>>> Stashed changes
  if (etapa === 'confirmacao') {
    return (
      <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif' }}>
        <header style={{ 
          backgroundColor: '#2e7d32', // ✅ COR ORIGINAL: Verde
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
<<<<<<< Updated upstream
          <p style={{ margin: '0', fontSize: '1.6em', fontWeight: '600' }}>
            Mesa {mesaSelecionada.numero}
=======
          <p style={{ 
            margin: '0', 
            fontSize: '1.3em',
            ...estilos.subtitulo
          }}>
            Mesa {mesaSelecionada.numero} - Garçom: {garcomNome}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
          <p style={{ 
            color: '#666', 
            marginBottom: '10px',
            ...estilos.texto,
            fontSize: '1.1em'
          }}>
            ✅ Pedido enviado para a cozinha com sucesso!
          </p>
          <p style={{ 
            color: '#666', 
            marginBottom: '25px',
            ...estilos.texto,
            fontSize: '1.1em'
          }}>
            Aguarde a preparação.
          </p>
          
          <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
            <button
              onClick={() => setEtapa('cardapio')}
              style={{
                backgroundColor: '#b71c1c', // ✅ COR ORIGINAL: Vermelho
                color: 'white',
                border: 'none',
                padding: '15px 25px',
                borderRadius: '10px',
                fontSize: '1.1em',
                ...estilos.botao,
                cursor: 'pointer'
              }}
            >
              Continuar com Mesa {mesaSelecionada.numero}
            </button>
            
            <button
              onClick={voltarParaMesas}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '15px 25px',
                borderRadius: '10px',
                fontSize: '1.1em',
                ...estilos.botao,
                cursor: 'pointer'
              }}
            >
              Voltar para Mesas
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🔥 TELA CONTA FECHADA (CORES ORIGINAIS)
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
            Mesa {mesaSelecionada.numero} - Garçom: {garcomNome}
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
          </div>

          {resumoConta && (
            <>
              <div style={{ 
                backgroundColor: '#fff3cd', 
                padding: '20px', 
                borderRadius: '10px',
                marginBottom: '25px',
                border: '2px solid #ffeaa7'
>>>>>>> Stashed changes
              }}>
                <span>{item.quantidade}x {item.nome}</span>
                <span style={{ fontWeight: '600' }}>R$ {(Number(item.preco) * item.quantidade).toFixed(2)}</span>
              </div>
<<<<<<< Updated upstream
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
=======

              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ 
                  color: '#333', 
                  marginBottom: '15px',
                  ...estilos.subtitulo
                }}>
                  Pedidos da Mesa
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

          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <button
              onClick={pagarConta}
              style={{
                backgroundColor: '#2e7d32', // ✅ COR ORIGINAL: Verde
                color: 'white',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '10px',
                fontSize: '1.1em',
                ...estilos.botao,
                cursor: 'pointer'
              }}
            >
              ✅ Pagar Conta
            </button>
            
            <button
              onClick={voltarParaMesas}
              style={{
                backgroundColor: '#b71c1c', // ✅ COR ORIGINAL: Vermelho
                color: 'white',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '10px',
                fontSize: '1.1em',
                ...estilos.botao,
                cursor: 'pointer'
              }}
            >
              Voltar para Mesas
            </button>
          </div>
>>>>>>> Stashed changes
        </div>
      </div>
    );
  }

  // 🔥 TELA DO CARDÁPIO (CORES ORIGINAIS)
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
        backgroundColor: '#b71c1c', // ✅ COR ORIGINAL: Vermelho
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
            ← Voltar para Mesas
          </button>
          <h1 style={{ margin: '0', fontSize: '2.2em', fontWeight: 'bold' }}>
            🍔 Jetro's Lanches
          </h1>
          <div style={{ width: '100px' }}></div>
        </div>
<<<<<<< Updated upstream
        <p style={{ margin: '0', fontSize: '1.4em', fontWeight: '600' }}>
          Mesa {mesaSelecionada.numero}
=======
        <p style={{ 
          margin: '0', 
          fontSize: '1.2em',
          ...estilos.subtitulo
        }}>
          Mesa {mesaSelecionada.numero} - Garçom: {garcomNome}
>>>>>>> Stashed changes
        </p>
      </header>

      {/* CARRINHO FLUTUANTE */}
      {carrinho.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#2e7d32', // ✅ COR ORIGINAL: Verde
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

<<<<<<< Updated upstream
=======
      {/* BOTÕES DE AÇÃO */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
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
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          🧾 Fechar Conta
        </button>
        
        <button
          onClick={voltarParaMesas}
          style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '15px 25px',
            borderRadius: '10px',
            fontSize: '1.1em',
            ...estilos.botao,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          ↩️ Trocar Mesa
        </button>
      </div>

>>>>>>> Stashed changes
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
            color: '#b71c1c', // ✅ COR ORIGINAL: Vermelho
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
<<<<<<< Updated upstream
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
=======
            {categoria.produtos && categoria.produtos.map(produto => (
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
>>>>>>> Stashed changes
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ 
                    backgroundColor: '#b71c1c', // ✅ COR ORIGINAL: Vermelho
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
                      backgroundColor: '#2e7d32', // ✅ COR ORIGINAL: Verde
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
            ))}
          </div>
        </div>
      ))}

      {/* MODAL DO CARRINHO (ATUALIZADO COM OBSERVAÇÕES) */}
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
<<<<<<< Updated upstream
              <h2 style={{ margin: 0, color: '#333', fontSize: '1.8em', fontWeight: 'bold' }}>
                Seu Pedido
=======
              <h2 style={{ 
                margin: 0, 
                color: '#333',
                ...estilos.titulo
              }}>
                Pedido - Mesa {mesaSelecionada.numero}
>>>>>>> Stashed changes
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
                  {carrinho.map((item, index) => (
                    <div key={index} style={{
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
<<<<<<< Updated upstream
                        <div style={{ color: '#666', fontSize: '1.1em' }}>
=======
                        {item.observacoes && (
                          <div style={{ 
                            color: '#ff9800', 
                            fontSize: '0.85em',
                            fontStyle: 'italic',
                            marginBottom: '5px'
                          }}>
                            📝 {item.observacoes}
                          </div>
                        )}
                        <div style={{ 
                          color: '#666', 
                          fontSize: '0.95em',
                          ...estilos.texto
                        }}>
>>>>>>> Stashed changes
                          R$ {Number(item.preco).toFixed(2)} cada
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          onClick={() => atualizarQuantidade(item.produto_id, item.quantidade - 1, item.observacoes)}
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
                          onClick={() => atualizarQuantidade(item.produto_id, item.quantidade + 1, item.observacoes)}
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
                          onClick={() => removerDoCarrinho(item.produto_id, item.observacoes)}
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

<<<<<<< Updated upstream
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
=======
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
                    Adicionar Mais Itens
                  </button>
                  
                  <button
                    onClick={finalizarPedido}
                    disabled={enviandoPedido}
                    style={{
                      backgroundColor: enviandoPedido ? '#ccc' : '#b71c1c', // ✅ COR ORIGINAL: Vermelho
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
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
        <p style={{ margin: '0', fontSize: '1.2em' }}>
          © 2025 Jetro's Lanches - Cardápio Digital
=======
        <p style={{ 
          margin: '0', 
          fontSize: '1.1em',
          ...estilos.texto
        }}>
          © 2025 Jetro's Lanches - Sistema Garçom
>>>>>>> Stashed changes
        </p>
      </footer>
    </div>
  );
}

export default App;