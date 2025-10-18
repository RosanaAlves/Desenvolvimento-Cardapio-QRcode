import React, { useState, useEffect } from 'react';

// 🔥 SISTEMA DE DESIGN RESPONSIVO E ACESSÍVEL
const designSystem = {
  cores: {
    primaria: '#b71c1c',
    secundaria: '#2e7d32', 
    sucesso: '#2e7d32',
    aviso: '#ff9800',
    perigo: '#b71c1c',
    texto: '#1a1a1a',
    textoClaro: '#ffffff',
    fundo: '#f8f9fa',
    card: '#ffffff',
    borda: '#e0e0e0',
    emUso: '#ff9800' // ✅ NOVA COR PARA STATUS "EM USO"
  },

  fontSizes: {
    xs: '0.875rem',
    sm: '1rem',  
    base: '1.125rem',
    lg: '1.25rem',
    xl: '1.5rem',
    '2xl': '1.875rem',
    '3xl': '2.25rem',
    '4xl': '3rem',
  },

  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '20px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '64px'
  },

  botao: {
    minHeight: '60px',
    minWidth: '120px',
    padding: '16px 24px'
  },

  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  }
};

// 🔥 ESTILOS BASE RESPONSIVOS
const estilosBase = {
  fontePrimaria: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    lineHeight: '1.6',
    fontSize: designSystem.fontSizes.base,
    fontWeight: '400'
  },
  titulo: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    fontWeight: '700',
    lineHeight: '1.3',
    fontSize: designSystem.fontSizes['3xl']
  },
  subtitulo: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    fontWeight: '600', 
    lineHeight: '1.4',
    fontSize: designSystem.fontSizes.xl
  },
  texto: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    fontWeight: '400',
    lineHeight: '1.5',
    fontSize: designSystem.fontSizes.base
  },
  botao: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    fontWeight: '600',
    fontSize: designSystem.fontSizes.lg,
    minHeight: designSystem.botao.minHeight,
    minWidth: designSystem.botao.minWidth,
    padding: designSystem.botao.padding,
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};

// Configuração da API
const API_BASE_URL = 'http://localhost:8000';

// ✅ MELHORADO: Função para fetch com tratamento de erro aprimorado
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (data === null || data === undefined) {
      throw new Error('Resposta da API vazia');
    }

    if (data.success === false) {
      throw new Error(data.message || 'Erro na API');
    }

    return data;
  } catch (error) {
    console.error(`❌ Erro na requisição para ${endpoint}:`, error);
    throw error;
  }
};

// 🔥 COMPONENTE DE STATUS DA MESA (ATUALIZADO)
const StatusMesaInfo = ({ mesaSelecionada, verResumoConta, reabrirConta }) => {
  if (!mesaSelecionada) return null;

  // ✅ CORREÇÃO: Status atualizado com novo fluxo
  if (mesaSelecionada.status_pagamento === 'fechada') {
    return (
      <div style={{
        backgroundColor: '#fff3cd',
        border: '2px solid #ff9800',
        borderRadius: '10px',
        padding: '15px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2em', marginBottom: '10px' }}>💰</div>
        <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>
          Conta Fechada
        </h3>
        <p style={{ margin: '0 0 15px 0', color: '#856404' }}>
          Aguardando pagamento no caixa
        </p>
        <button
          onClick={verResumoConta}
          style={{
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          👀 Ver Resumo
        </button>
        <button
          onClick={reabrirConta}
          style={{
            backgroundColor: '#b71c1c',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          ↩️ Reabrir Conta
        </button>
      </div>
    );
  }

  if (mesaSelecionada.status_pagamento === 'paga') {
    return (
      <div style={{
        backgroundColor: '#d4edda',
        border: '2px solid #28a745',
        borderRadius: '10px',
        padding: '15px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2em', marginBottom: '10px' }}>✅</div>
        <h3 style={{ margin: '0 0 10px 0', color: '#155724' }}>
          Conta Paga
        </h3>
        <p style={{ margin: '0', color: '#155724' }}>
          Mesa liberada para novos clientes
        </p>
      </div>
    );
  }

  // ✅ NOVO: Status "Em Uso"
  if (mesaSelecionada.status === 'em_uso') {
    return (
      <div style={{
        backgroundColor: '#fff3cd',
        border: '2px solid #ff9800',
        borderRadius: '10px',
        padding: '15px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2em', marginBottom: '10px' }}>🟡</div>
        <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>
          Mesa em Preparação
        </h3>
        <p style={{ margin: '0', color: '#856404' }}>
          Faça o primeiro pedido para ocupar a mesa
        </p>
      </div>
    );
  }

  return null;
};

function App() {
  // Estados do sistema
  const [etapa, setEtapa] = useState('coletar-garcom');
  const [garcomNome, setGarcomNome] = useState('');
  const [mesas, setMesas] = useState([]);
  const [mesaSelecionada, setMesaSelecionada] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [enviandoPedido, setEnviandoPedido] = useState(false);
  const [resumoConta, setResumoConta] = useState(null);
  const [itemComObservacao, setItemComObservacao] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [carregandoResumo, setCarregandoResumo] = useState(false);
  const [atualizandoMesas, setAtualizandoMesas] = useState(false);

  // 🔥 DETECTAR TAMANHO DA TELA PARA RESPONSIVIDADE
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🔥 ESTILOS RESPONSIVOS DINÂMICOS
  const getResponsiveStyles = () => {
    if (windowWidth < designSystem.breakpoints.mobile) {
      return {
        gridColunasMesas: 'repeat(2, 1fr)',
        fontSizeBase: designSystem.fontSizes.base,
        paddingContainer: designSystem.spacing.md,
        tamanhoMesa: '100px',
        fontSizeMesa: designSystem.fontSizes.xl
      };
    } else if (windowWidth < designSystem.breakpoints.tablet) {
      return {
        gridColunasMesas: 'repeat(3, 1fr)',
        fontSizeBase: designSystem.fontSizes.lg,
        paddingContainer: designSystem.spacing.lg,
        tamanhoMesa: '120px',
        fontSizeMesa: designSystem.fontSizes['2xl']
      };
    } else {
      return {
        gridColunasMesas: 'repeat(4, 1fr)',
        fontSizeBase: designSystem.fontSizes.xl,
        paddingContainer: designSystem.spacing.xl,
        tamanhoMesa: '140px',
        fontSizeMesa: designSystem.fontSizes['3xl']
      };
    }
  };

  const responsive = getResponsiveStyles();

  // ✅ MELHORADO: Carregar dados iniciais com tratamento de erro
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        setErro(null);

        const [dadosMesas, dadosCategorias] = await Promise.all([
          fetchAPI('/api/garcom/mesas/status'),
          fetchAPI('/api/garcom/cardapio/categorias')
        ]);

        const mesasFormatadas = dadosMesas.data || [];
        const categoriasFormatadas = dadosCategorias.data || [];

        if (!Array.isArray(mesasFormatadas)) throw new Error('Formato inválido de mesas');
        if (!Array.isArray(categoriasFormatadas)) throw new Error('Formato inválido de categorias');

        setMesas(mesasFormatadas);
        setCategorias(categoriasFormatadas);
        
      } catch (erro) {
        console.error('❌ Erro ao carregar dados:', erro);
        setErro('Erro ao carregar cardápio. Verifique a conexão com o servidor.');
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  // ✅ MELHORADO: Atualizar lista de mesas
  const atualizarMesas = async () => {
    try {
      setAtualizandoMesas(true);
      const dadosMesas = await fetchAPI('/api/garcom/mesas/status');
      setMesas(dadosMesas.data || []);
    } catch (erro) {
      console.error('Erro ao atualizar mesas:', erro);
    } finally {
      setAtualizandoMesas(false);
    }
  };

  // Avançar para seleção de mesa após coletar nome do GARÇOM
  const avancarParaMesas = () => {
    if (garcomNome.trim() === '') {
      alert('Por favor, informe o nome do garçom');
      return;
    }
    setEtapa('selecao-mesa');
  };

  // ✅ CORREÇÃO: Selecionar mesa com novo fluxo
  const selecionarMesa = async (mesa) => {
    // Se mesa já está ocupada ou em uso, apenas acessa
    if (mesa.status === 'ocupada' || mesa.status === 'em_uso') {
      setMesaSelecionada(mesa);
      setEtapa('cardapio');
      return;
    }

    try {
      const resultado = await fetchAPI(`/api/garcom/mesas/${mesa.id}/ocupar`, {
        method: 'POST',
        body: JSON.stringify({
          garcom_nome: garcomNome
        })
      });

      if (resultado.success) {
        // Atualizar lista de mesas
        await atualizarMesas();
        
        // Buscar mesa atualizada
        const mesaAtualizada = mesas.find(m => m.id === mesa.id) || resultado.data;
        
        setMesaSelecionada(mesaAtualizada);
        setEtapa('cardapio');
        
        alert('✅ Mesa preparada para uso! Agora você pode fazer pedidos.');
      }
    } catch (erro) {
      console.error('Erro ao preparar mesa:', erro);
      
      if (erro.message.includes('já está ocupada')) {
        alert('❌ Esta mesa já está ocupada por outro garçom.');
      } else {
        alert('❌ Erro ao preparar mesa. Tente novamente.');
      }
    }
  };

  // Adicionar item ao carrinho com observações
  const adicionarAoCarrinho = (produto) => {
    setItemComObservacao({
      produto: produto,
      observacoes: ''
    });
  };

  // Confirmar item com observações
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
      alert('Erro: Preço do produto inválido');
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

  // ✅ MELHORADO: Finalizar pedido com tratamento completo
  const finalizarPedido = async () => {
    if (carrinho.length === 0) {
      alert('❌ Seu carrinho está vazio!');
      return;
    }

    try {
      setEnviandoPedido(true);

      const pedidoData = {
        mesa_id: mesaSelecionada.id,
        garcom_nome: garcomNome,
        itens: carrinho.map(item => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          observacoes: item.observacoes
        }))
      };

      console.log('📤 Enviando pedido:', pedidoData);

      const resultado = await fetchAPI('/api/garcom/pedidos', {
        method: 'POST',
        body: JSON.stringify(pedidoData)
      });

      if (resultado.success) {
        // ✅ ATUALIZAR STATUS DA MESA APÓS PRIMEIRO PEDIDO
        if (mesaSelecionada.status === 'em_uso') {
          await atualizarMesas();
        }

        setEtapa('confirmacao');
        setCarrinho([]);
        
        console.log('✅ Pedido criado com sucesso:', resultado.data);
      } else {
        throw new Error(resultado.message || 'Erro desconhecido ao enviar pedido');
      }

    } catch (erro) {
      console.error('Erro ao finalizar pedido:', erro);
      alert('❌ Erro ao enviar pedido: ' + erro.message);
    } finally {
      setEnviandoPedido(false);
    }
  };

  // ✅ CORRIGIDO: Fechar conta
  const fecharConta = async () => {
    try {
      const resultado = await fetchAPI(`/api/garcom/mesas/${mesaSelecionada.id}/fechar-conta`, {
        method: 'POST'
      });
      
      if (resultado.success) {
        setResumoConta(resultado);
        setEtapa('conta-fechada');
        
        // Atualizar status local
        setMesaSelecionada(prev => ({
          ...prev,
          status_pagamento: 'fechada'
        }));

        // Atualizar lista de mesas
        await atualizarMesas();
      }
    } catch (erro) {
      console.error('Erro ao fechar conta:', erro);
      
      if (erro.message.includes('422') || erro.message.includes('Sem pedidos')) {
        alert('❌ Não é possível fechar a conta!\n\nNenhum pedido foi realizado nesta mesa.');
      } else if (erro.message.includes('já foi fechada')) {
        alert('❌ Esta conta já está fechada!');
      } else {
        alert('❌ Erro ao fechar conta: ' + erro.message);
      }
    }
  };

  // ✅ CORRIGIDO: Ver resumo da conta
  const verResumoConta = async () => {
    try {
      setCarregandoResumo(true);
      const resultado = await fetchAPI(`/api/garcom/mesas/${mesaSelecionada.id}/status-conta`);
      
      if (resultado.success) {
        setResumoConta(resultado.data);
        setEtapa('conta-fechada');
      }
    } catch (erro) {
      console.error('Erro ao carregar resumo:', erro);
      alert('❌ Erro ao carregar resumo da conta. Tente novamente.');
    } finally {
      setCarregandoResumo(false);
    }
  };

  // ✅ CORRIGIDO: Reabrir conta
  const reabrirConta = async () => {
    try {
      const resultado = await fetchAPI(`/api/garcom/mesas/${mesaSelecionada.id}/reabrir-conta`, {
        method: 'POST'
      });

      if (resultado.success) {
        alert('✅ Conta reaberta com sucesso!');
        
        // Atualizar status local
        setMesaSelecionada(prev => ({
          ...prev,
          status_pagamento: 'aberta'
        }));
        
        // Atualizar lista de mesas
        await atualizarMesas();
        
        setEtapa('cardapio');
      }
    } catch (erro) {
      console.error('Erro ao reabrir conta:', erro);
      
      if (erro.message.includes('422') || erro.message.includes('fechadas')) {
        alert('❌ Só é possível reabrir contas que estão fechadas!');
      } else {
        alert('❌ Erro ao reabrir conta: ' + erro.message);
      }
    }
  };

  // Voltar para seleção de mesa
  const voltarParaMesas = () => {
    setMesaSelecionada(null);
    setCarrinho([]);
    setEtapa('selecao-mesa');
  };

  // Voltar para coletar nome do GARÇOM
  const voltarParaGarcom = () => {
    setMesaSelecionada(null);
    setCarrinho([]);
    setGarcomNome('');
    setEtapa('coletar-garcom');
  };

  // ✅ CORREÇÃO: Função para obter cor e status da mesa
  const getStatusMesa = (mesa) => {
    // Prioridade: Status pagamento > Status mesa
    if (mesa.status_pagamento === 'paga') {
      return { cor: '#4caf50', texto: 'Paga', emoji: '✅' };
    } else if (mesa.status_pagamento === 'fechada') {
      return { cor: designSystem.cores.aviso, texto: 'Fechada', emoji: '🧾' };
    } else if (mesa.status === 'ocupada') {
      return { cor: designSystem.cores.primaria, texto: 'Ocupada', emoji: '🔴' };
    } else if (mesa.status === 'em_uso') {
      return { cor: designSystem.cores.emUso, texto: 'Em Uso', emoji: '🟡' };
    } else {
      return { cor: designSystem.cores.sucesso, texto: 'Livre', emoji: '🟢' };
    }
  };

  // 🔥 TELA DE COLETAR NOME DO GARÇOM
  if (etapa === 'coletar-garcom') {
    return (
      <div style={{ 
        padding: responsive.paddingContainer,
        minHeight: '100vh', 
        backgroundColor: designSystem.cores.fundo,
        ...estilosBase.fontePrimaria
      }}>
        <header style={{ 
          backgroundColor: designSystem.cores.primaria,
          color: designSystem.cores.textoClaro, 
          padding: designSystem.spacing['2xl'],
          textAlign: 'center',
          borderRadius: '20px',
          marginBottom: designSystem.spacing['2xl'],
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
        }}>
          <h1 style={{ 
            margin: '0 0 16px 0', 
            fontSize: designSystem.fontSizes['3xl'],
            ...estilosBase.titulo
          }}>
            🍔 Jetro's Lanches
          </h1>
          <p style={{ 
            margin: '0 0 12px 0', 
            fontSize: designSystem.fontSizes.xl,
            ...estilosBase.subtitulo
          }}>
            Sistema do Garçom
          </p>
          <p style={{ 
            margin: '0', 
            fontSize: designSystem.fontSizes.lg,
            ...estilosBase.texto
          }}>
            👨‍💼 Painel de Atendimento
          </p>
        </header>

        <div style={{ 
          backgroundColor: designSystem.cores.card, 
          padding: designSystem.spacing['3xl'], 
          borderRadius: '20px',
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          border: `2px solid ${designSystem.cores.borda}`
        }}>
          <div style={{ fontSize: '5em', marginBottom: designSystem.spacing.xl }}>👨‍💼</div>
          <h2 style={{ 
            color: designSystem.cores.texto, 
            marginBottom: designSystem.spacing.lg,
            ...estilosBase.titulo,
            fontSize: designSystem.fontSizes['2xl']
          }}>
            Identificação do Garçom
          </h2>
          <p style={{ 
            color: '#666', 
            marginBottom: designSystem.spacing['2xl'],
            ...estilosBase.texto,
            fontSize: designSystem.fontSizes.lg
          }}>
            Por favor, informe seu nome para começar
          </p>
          
          <input
            type="text"
            value={garcomNome}
            onChange={(e) => setGarcomNome(e.target.value)}
            placeholder="Digite seu nome completo"
            style={{
              width: '100%',
              padding: designSystem.spacing.lg,
              fontSize: designSystem.fontSizes.lg,
              border: `3px solid ${designSystem.cores.borda}`,
              borderRadius: '12px',
              marginBottom: designSystem.spacing.xl,
              textAlign: 'center',
              ...estilosBase.texto
            }}
            onKeyPress={(e) => e.key === 'Enter' && avancarParaMesas()}
          />
          
          <button
            onClick={avancarParaMesas}
            disabled={!garcomNome.trim()}
            style={{
              backgroundColor: garcomNome.trim() ? designSystem.cores.primaria : '#ccc',
              color: designSystem.cores.textoClaro,
              border: 'none',
              padding: designSystem.spacing.lg,
              borderRadius: '12px',
              fontSize: designSystem.fontSizes.lg,
              ...estilosBase.botao,
              cursor: garcomNome.trim() ? 'pointer' : 'not-allowed',
              width: '100%'
            }}
          >
            Continuar para Mesas
          </button>
        </div>

        <footer style={{ 
          marginTop: designSystem.spacing['4xl'], 
          textAlign: 'center', 
          color: '#666',
          padding: designSystem.spacing['2xl']
        }}>
          <p style={{ 
            margin: '0', 
            fontSize: designSystem.fontSizes.lg,
            ...estilosBase.texto
          }}>
            © 2025 Jetro's Lanches - Sistema Garçom
          </p>
        </footer>
      </div>
    );
  }

  // 🔥 TELA DE SELEÇÃO DE MESA
  if (etapa === 'selecao-mesa') {
    // ✅ CORREÇÃO: Calcular estatísticas atualizadas
    const estatisticas = {
      livres: mesas.filter(m => getStatusMesa(m).texto === 'Livre').length,
      emUso: mesas.filter(m => getStatusMesa(m).texto === 'Em Uso').length,
      ocupadas: mesas.filter(m => getStatusMesa(m).texto === 'Ocupada').length,
      fechadas: mesas.filter(m => getStatusMesa(m).texto === 'Fechada').length,
      pagas: mesas.filter(m => getStatusMesa(m).texto === 'Paga').length
    };

    return (
      <div style={{ 
        padding: responsive.paddingContainer,
        minHeight: '100vh', 
        backgroundColor: designSystem.cores.fundo,
        ...estilosBase.fontePrimaria
      }}>
        <header style={{ 
          backgroundColor: designSystem.cores.primaria,
          color: designSystem.cores.textoClaro, 
          padding: designSystem.spacing['2xl'],
          textAlign: 'center',
          borderRadius: '20px',
          marginBottom: designSystem.spacing['2xl'],
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <button
              onClick={voltarParaGarcom}
              style={{
                backgroundColor: 'transparent',
                color: designSystem.cores.textoClaro,
                border: `2px solid ${designSystem.cores.textoClaro}`,
                padding: designSystem.spacing.sm,
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: designSystem.fontSizes.sm,
                ...estilosBase.botao,
                minHeight: 'auto',
                minWidth: 'auto'
              }}
            >
              ← Trocar Garçom
            </button>
            <h1 style={{ 
              margin: '0', 
              fontSize: designSystem.fontSizes['2xl'],
              ...estilosBase.titulo
            }}>
              🍔 Jetro's Lanches
            </h1>
            <div style={{ width: '100px' }}></div>
          </div>
          <p style={{ 
            margin: '0 0 12px 0', 
            fontSize: designSystem.fontSizes.xl,
            ...estilosBase.subtitulo
          }}>
            Garçom: {garcomNome}
          </p>
          <p style={{ 
            margin: '0', 
            fontSize: designSystem.fontSizes.lg,
            ...estilosBase.texto
          }}>
            Selecione uma mesa para atender
          </p>
        </header>

        <div style={{ textAlign: 'center', marginBottom: designSystem.spacing['2xl'] }}>
          <h2 style={{ 
            color: designSystem.cores.texto, 
            marginBottom: designSystem.spacing.lg,
            ...estilosBase.titulo,
            fontSize: designSystem.fontSizes['2xl']
          }}>
            Mesas Disponíveis
          </h2>
        </div>

        {erro ? (
          <div style={{ 
            textAlign: 'center', 
            padding: designSystem.spacing['3xl'],
            backgroundColor: '#ffebee',
            borderRadius: '16px',
            margin: designSystem.spacing.lg,
            border: `2px solid #ffcdd2`
          }}>
            <div style={{ fontSize: '4em', marginBottom: designSystem.spacing.lg }}>😞</div>
            <p style={{ 
              color: designSystem.cores.perigo, 
              marginBottom: designSystem.spacing.lg,
              fontSize: designSystem.fontSizes.lg,
              ...estilosBase.texto
            }}>
              {erro}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: designSystem.cores.primaria,
                color: designSystem.cores.textoClaro,
                border: 'none',
                padding: designSystem.spacing.lg,
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: designSystem.fontSizes.lg,
                ...estilosBase.botao
              }}
            >
              Recarregar Página
            </button>
          </div>
        ) : carregando ? (
          <div style={{ textAlign: 'center', padding: designSystem.spacing['3xl'] }}>
            <div style={{ fontSize: '4em', marginBottom: designSystem.spacing.lg }}>⏳</div>
            <p style={{ ...estilosBase.texto, fontSize: designSystem.fontSizes.lg }}>Carregando mesas...</p>
          </div>
        ) : (
          <div>
            {/* ✅ CORREÇÃO: Painel de status atualizado */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: designSystem.spacing.lg, 
              marginBottom: designSystem.spacing['2xl'],
              flexWrap: 'wrap'
            }}>
              <div style={{ 
                backgroundColor: designSystem.cores.sucesso,
                color: designSystem.cores.textoClaro, 
                padding: designSystem.spacing.md,
                borderRadius: '25px',
                fontSize: designSystem.fontSizes.lg,
                ...estilosBase.botao,
                minHeight: 'auto'
              }}>
                🟢 Livres: {estatisticas.livres}
              </div>
              <div style={{ 
                backgroundColor: designSystem.cores.emUso,
                color: designSystem.cores.textoClaro, 
                padding: designSystem.spacing.md,
                borderRadius: '25px',
                fontSize: designSystem.fontSizes.lg,
                ...estilosBase.botao,
                minHeight: 'auto'
              }}>
                🟡 Em Uso: {estatisticas.emUso}
              </div>
              <div style={{ 
                backgroundColor: designSystem.cores.primaria,
                color: designSystem.cores.textoClaro, 
                padding: designSystem.spacing.md,
                borderRadius: '25px',
                fontSize: designSystem.fontSizes.lg,
                ...estilosBase.botao,
                minHeight: 'auto'
              }}>
                🔴 Ocupadas: {estatisticas.ocupadas}
              </div>
              <div style={{ 
                backgroundColor: designSystem.cores.aviso,
                color: designSystem.cores.textoClaro, 
                padding: designSystem.spacing.md,
                borderRadius: '25px',
                fontSize: designSystem.fontSizes.lg,
                ...estilosBase.botao,
                minHeight: 'auto'
              }}>
                🧾 Fechadas: {estatisticas.fechadas}
              </div>
            </div>

            {/* MESAS */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: responsive.gridColunasMesas,
              gap: designSystem.spacing.lg,
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {mesas.map(mesa => {
                const status = getStatusMesa(mesa);

                return (
                  <div key={mesa.id} style={{ position: 'relative' }}>
                    <button
                      onClick={() => selecionarMesa(mesa)}
                      style={{
                        backgroundColor: status.cor,
                        color: designSystem.cores.textoClaro,
                        border: 'none',
                        padding: designSystem.spacing.lg,
                        borderRadius: '20px',
                        fontSize: responsive.fontSizeMesa,
                        ...estilosBase.botao,
                        cursor: 'pointer',
                        boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s ease',
                        minHeight: responsive.tamanhoMesa,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
                        Mesa {mesa.numero}
                      </div>
                      <div style={{
                        fontSize: '0.7em',
                        marginTop: '8px',
                        opacity: 0.9
                      }}>
                        {status.emoji} {status.texto}
                      </div>
                      {mesa.garcom_nome && (
                        <div style={{
                          fontSize: '0.6em',
                          marginTop: '4px',
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

            {/* ✅ CORREÇÃO: Legenda atualizada */}
            <div style={{ 
              textAlign: 'center', 
              marginTop: designSystem.spacing['2xl'], 
              color: '#666',
              ...estilosBase.texto
            }}>
              <p style={{ fontSize: designSystem.fontSizes.lg }}>
                <span style={{ color: designSystem.cores.sucesso, fontWeight: 'bold' }}>🟢 Verde</span> = Livre • 
                <span style={{ color: designSystem.cores.emUso, fontWeight: 'bold' }}> 🟡 Laranja</span> = Em Uso • 
                <span style={{ color: designSystem.cores.primaria, fontWeight: 'bold' }}> 🔴 Vermelho</span> = Ocupada • 
                <span style={{ color: designSystem.cores.aviso, fontWeight: 'bold' }}> 🧾 Amarelo</span> = Fechada
              </p>
            </div>
          </div>
        )}

        <footer style={{ 
          marginTop: designSystem.spacing['4xl'], 
          textAlign: 'center', 
          color: '#666',
          padding: designSystem.spacing['2xl']
        }}>
          <p style={{ 
            margin: '0', 
            fontSize: designSystem.fontSizes.lg,
            ...estilosBase.texto
          }}>
            © 2025 Jetro's Lanches - Sistema Garçom
          </p>
        </footer>
      </div>
    );
  }

  // 🔥 MODAL DE OBSERVAÇÕES (mantido igual)
  if (itemComObservacao) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
        padding: responsive.paddingContainer
      }}>
        <div style={{
          backgroundColor: designSystem.cores.card,
          padding: designSystem.spacing['2xl'],
          borderRadius: '20px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          ...estilosBase.fontePrimaria,
          border: `3px solid ${designSystem.cores.borda}`
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0',
            ...estilosBase.titulo,
            textAlign: 'center',
            fontSize: designSystem.fontSizes.xl
          }}>
            {itemComObservacao.produto.nome}
          </h3>
          
          <p style={{ 
            margin: '0 0 20px 0',
            color: designSystem.cores.texto,
            ...estilosBase.texto,
            fontSize: designSystem.fontSizes.lg,
            textAlign: 'center'
          }}>
            Preço: R$ {Number(itemComObservacao.produto.preco).toFixed(2)}
          </p>

          <div style={{ marginBottom: designSystem.spacing.xl }}>
            <label style={{ 
              display: 'block', 
              marginBottom: designSystem.spacing.sm,
              fontWeight: '600',
              ...estilosBase.subtitulo,
              fontSize: designSystem.fontSizes.lg
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
                padding: designSystem.spacing.lg,
                border: `3px solid ${designSystem.cores.borda}`,
                borderRadius: '12px',
                minHeight: '120px',
                resize: 'vertical',
                ...estilosBase.texto,
                fontSize: designSystem.fontSizes.base
              }}
            />
            <div style={{ 
              fontSize: designSystem.fontSizes.sm, 
              color: '#666', 
              marginTop: designSystem.spacing.sm,
              ...estilosBase.texto
            }}>
              💡 Dica: "Cortar ao meio", "Retirar [ingrediente]", "Adicionar [ingrediente]"
            </div>
          </div>

          <div style={{ display: 'flex', gap: designSystem.spacing.md }}>
            <button
              onClick={() => setItemComObservacao(null)}
              style={{
                backgroundColor: '#6c757d',
                color: designSystem.cores.textoClaro,
                border: 'none',
                padding: designSystem.spacing.lg,
                borderRadius: '12px',
                cursor: 'pointer',
                flex: 1,
                ...estilosBase.botao
              }}
            >
              Cancelar
            </button>
            <button
              onClick={confirmarItemComObservacoes}
              style={{
                backgroundColor: designSystem.cores.primaria,
                color: designSystem.cores.textoClaro,
                border: 'none',
                padding: designSystem.spacing.lg,
                borderRadius: '12px',
                cursor: 'pointer',
                flex: 1,
                ...estilosBase.botao
              }}
            >
              Adicionar ao Pedido
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🔥 TELA DE CONFIRMAÇÃO DE PEDIDO (mantido igual)
  if (etapa === 'confirmacao') {
    return (
      <div style={{ 
        padding: responsive.paddingContainer,
        minHeight: '100vh', 
        backgroundColor: designSystem.cores.fundo,
        ...estilosBase.fontePrimaria
      }}>
        <header style={{ 
          backgroundColor: designSystem.cores.sucesso,
          color: designSystem.cores.textoClaro, 
          padding: designSystem.spacing['2xl'],
          textAlign: 'center',
          borderRadius: '20px',
          marginBottom: designSystem.spacing['2xl'],
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
        }}>
          <h1 style={{ 
            margin: '0 0 16px 0', 
            fontSize: designSystem.fontSizes['3xl'],
            ...estilosBase.titulo
          }}>
            ✅ Pedido Enviado!
          </h1>
          <p style={{ 
            margin: '0', 
            fontSize: designSystem.fontSizes.xl,
            ...estilosBase.subtitulo
          }}>
            Mesa {mesaSelecionada.numero} - Garçom: {garcomNome}
          </p>
        </header>

        <div style={{ 
          backgroundColor: designSystem.cores.card, 
          padding: designSystem.spacing['3xl'], 
          borderRadius: '20px',
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          border: `2px solid ${designSystem.cores.borda}`
        }}>
          <div style={{ fontSize: '5em', marginBottom: designSystem.spacing.xl }}>🎉</div>
          <h2 style={{ 
            color: designSystem.cores.sucesso, 
            marginBottom: designSystem.spacing.lg,
            ...estilosBase.titulo,
            fontSize: designSystem.fontSizes['2xl']
          }}>
            Pedido Recebido!
          </h2>
          <p style={{ 
            color: '#666', 
            marginBottom: designSystem.spacing.md,
            ...estilosBase.texto,
            fontSize: designSystem.fontSizes.lg
          }}>
            ✅ Pedido enviado para a cozinha com sucesso!
          </p>
          <p style={{ 
            color: '#666', 
            marginBottom: designSystem.spacing['2xl'],
            ...estilosBase.texto,
            fontSize: designSystem.fontSizes.lg
          }}>
            Aguarde a preparação.
          </p>
          
          <div style={{ display: 'flex', gap: designSystem.spacing.lg, flexDirection: windowWidth < 768 ? 'column' : 'row' }}>
            <button
              onClick={() => setEtapa('cardapio')}
              style={{
                backgroundColor: designSystem.cores.primaria,
                color: designSystem.cores.textoClaro,
                border: 'none',
                padding: designSystem.spacing.lg,
                borderRadius: '12px',
                fontSize: designSystem.fontSizes.lg,
                ...estilosBase.botao,
                cursor: 'pointer',
                flex: 1
              }}
            >
              Continuar com Mesa {mesaSelecionada.numero}
            </button>
            
            <button
              onClick={voltarParaMesas}
              style={{
                backgroundColor: '#6c757d',
                color: designSystem.cores.textoClaro,
                border: 'none',
                padding: designSystem.spacing.lg,
                borderRadius: '12px',
                fontSize: designSystem.fontSizes.lg,
                ...estilosBase.botao,
                cursor: 'pointer',
                flex: 1
              }}
            >
              Voltar para Mesas
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🔥 TELA CONTA FECHADA (mantido igual)
  if (etapa === 'conta-fechada') {
    return (
      <div style={{ 
        padding: responsive.paddingContainer,
        minHeight: '100vh', 
        backgroundColor: designSystem.cores.fundo,
        ...estilosBase.fontePrimaria
      }}>
        <header style={{ 
          backgroundColor: designSystem.cores.aviso,
          color: designSystem.cores.textoClaro, 
          padding: designSystem.spacing['2xl'],
          textAlign: 'center',
          borderRadius: '20px',
          marginBottom: designSystem.spacing['2xl'],
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
        }}>
          <h1 style={{ 
            margin: '0 0 16px 0', 
            fontSize: designSystem.fontSizes['3xl'],
            ...estilosBase.titulo
          }}>
            🧾 Resumo da Conta
          </h1>
          <p style={{ 
            margin: '0', 
            fontSize: designSystem.fontSizes.xl,
            ...estilosBase.subtitulo
          }}>
            Mesa {mesaSelecionada.numero} - Garçom: {garcomNome}
          </p>
          <p style={{ 
            margin: '10px 0 0 0', 
            fontSize: designSystem.fontSizes.lg,
            opacity: 0.9
          }}>
            {mesaSelecionada.status_pagamento === 'fechada' ? '💰 Direcione o cliente ao caixa' : '📊 Visualização do resumo'}
          </p>
        </header>

        <div style={{ 
          backgroundColor: designSystem.cores.card, 
          padding: designSystem.spacing['3xl'], 
          borderRadius: '20px',
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          border: `2px solid ${designSystem.cores.borda}`
        }}>
          {carregandoResumo ? (
            <div style={{ textAlign: 'center', padding: designSystem.spacing['3xl'] }}>
              <div style={{ fontSize: '4em', marginBottom: designSystem.spacing.lg }}>⏳</div>
              <p style={{ ...estilosBase.texto, fontSize: designSystem.fontSizes.lg }}>Carregando resumo...</p>
            </div>
          ) : resumoConta ? (
            <>
              <div style={{ fontSize: '5em', marginBottom: designSystem.spacing.xl }}>💰</div>
              <h2 style={{ 
                color: designSystem.cores.aviso, 
                marginBottom: designSystem.spacing.lg,
                ...estilosBase.titulo,
                fontSize: designSystem.fontSizes['2xl']
              }}>
                Resumo da Conta
              </h2>
              
              <div style={{ 
                backgroundColor: '#fff3cd', 
                padding: designSystem.spacing.xl, 
                borderRadius: '16px',
                marginBottom: designSystem.spacing.xl,
                border: `2px solid #ffeaa7`
              }}>
                <h3 style={{ 
                  color: '#856404', 
                  marginBottom: designSystem.spacing.lg,
                  textAlign: 'center',
                  ...estilosBase.subtitulo
                }}>
                  Total a Pagar
                </h3>
                <div style={{
                  textAlign: 'center',
                  fontSize: designSystem.fontSizes['4xl'],
                  fontWeight: 'bold',
                  color: designSystem.cores.sucesso
                }}>
                  R$ {Number(
                    resumoConta?.total_conta || 
                    resumoConta?.total || 
                    0
                  ).toFixed(2)}
                </div>
                <p style={{
                  textAlign: 'center',
                  color: '#856404',
                  margin: '10px 0 0 0',
                  fontSize: designSystem.fontSizes.sm
                }}>
                  💰 Valor para pagamento no caixa
                </p>
              </div>

              {resumoConta?.pedidos && resumoConta.pedidos.length > 0 ? (
                <div style={{ marginBottom: designSystem.spacing.xl }}>
                  <h3 style={{ 
                    color: designSystem.cores.texto, 
                    marginBottom: designSystem.spacing.lg,
                    ...estilosBase.subtitulo
                  }}>
                    Pedidos da Mesa
                  </h3>
                  {resumoConta.pedidos.map(pedido => (
                    <div key={pedido.id} style={{
                      backgroundColor: designSystem.cores.fundo,
                      padding: designSystem.spacing.lg,
                      borderRadius: '12px',
                      marginBottom: designSystem.spacing.md,
                      border: `1px solid ${designSystem.cores.borda}`
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: designSystem.spacing.sm
                      }}>
                        <span style={{ fontWeight: 'bold' }}>Pedido #{pedido.id}</span>
                        <span style={{ 
                          backgroundColor: designSystem.cores.primaria,
                          color: designSystem.cores.textoClaro,
                          padding: '4px 12px',
                          borderRadius: '25px',
                          fontSize: designSystem.fontSizes.sm
                        }}>
                          {pedido.status}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        color: '#666',
                        fontSize: designSystem.fontSizes.sm
                      }}>
                        <span>{new Date(pedido.created_at).toLocaleString('pt-BR')}</span>
                        <span style={{ fontWeight: 'bold' }}>R$ {Number(pedido.total).toFixed(2)}</span>
                      </div>
                      
                      {/* Itens do pedido */}
                      {pedido.itens && pedido.itens.length > 0 && (
                        <div style={{ marginTop: designSystem.spacing.sm, textAlign: 'left' }}>
                          <div style={{ fontSize: designSystem.fontSizes.sm, fontWeight: 'bold', marginBottom: '5px' }}>
                            Itens:
                          </div>
                          {pedido.itens.map((item, index) => (
                            <div key={index} style={{ 
                              fontSize: designSystem.fontSizes.xs, 
                              color: '#666',
                              marginBottom: '2px'
                            }}>
                              • {item.quantidade}x {item.produto?.nome || 'Produto'} 
                              {item.observacoes && ` (${item.observacoes})`}
                              - R$ {Number(item.preco_unitario * item.quantidade).toFixed(2)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#666', marginBottom: designSystem.spacing.xl }}>
                  Nenhum pedido encontrado para esta mesa.
                </p>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: designSystem.spacing['3xl'] }}>
              <div style={{ fontSize: '4em', marginBottom: designSystem.spacing.lg }}>😞</div>
              <p style={{ ...estilosBase.texto, fontSize: designSystem.fontSizes.lg }}>
                Não foi possível carregar o resumo da conta.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: designSystem.spacing.md, flexDirection: 'column' }}>
            {mesaSelecionada.status_pagamento === 'fechada' && (
              <button
                onClick={reabrirConta}
                style={{
                  backgroundColor: designSystem.cores.aviso,
                  color: designSystem.cores.textoClaro,
                  border: 'none',
                  padding: designSystem.spacing.lg,
                  borderRadius: '12px',
                  fontSize: designSystem.fontSizes.lg,
                  ...estilosBase.botao,
                  cursor: 'pointer'
                }}
              >
                ↩️ Reabrir Conta
              </button>
            )}
            
            <button
              onClick={voltarParaMesas}
              style={{
                backgroundColor: '#6c757d',
                color: designSystem.cores.textoClaro,
                border: 'none',
                padding: designSystem.spacing.lg,
                borderRadius: '12px',
                fontSize: designSystem.fontSizes.lg,
                ...estilosBase.botao,
                cursor: 'pointer'
              }}
            >
              Voltar para Mesas
            </button>
          </div>

          <div style={{
            marginTop: designSystem.spacing.xl,
            padding: designSystem.spacing.lg,
            backgroundColor: '#e8f5e8',
            borderRadius: '12px',
            border: `1px solid #c8e6c9`
          }}>
            <p style={{ 
              margin: '0', 
              color: designSystem.cores.sucesso,
              fontSize: designSystem.fontSizes.sm,
              textAlign: 'center'
            }}>
              💡 <strong>Fluxo correto:</strong><br />
              1. Fechar conta → 2. Cliente paga no caixa → 3. Caixa confirma pagamento
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 🔥 TELA DO CARDÁPIO (etapa === 'cardapio')
  return (
    <div style={{ 
      padding: responsive.paddingContainer,
      minHeight: '100vh', 
      backgroundColor: designSystem.cores.fundo, 
      paddingBottom: '120px',
      ...estilosBase.fontePrimaria
    }}>
      {/* HEADER */}
      <header style={{ 
        backgroundColor: designSystem.cores.primaria, 
        color: designSystem.cores.textoClaro, 
        padding: designSystem.spacing.xl,
        textAlign: 'center',
        borderRadius: '20px',
        marginBottom: designSystem.spacing.xl,
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <button
            onClick={voltarParaMesas}
            style={{
              backgroundColor: 'transparent',
              color: designSystem.cores.textoClaro,
              border: `2px solid ${designSystem.cores.textoClaro}`,
              padding: designSystem.spacing.sm,
              borderRadius: '25px',
              cursor: 'pointer',
              ...estilosBase.botao,
              fontSize: designSystem.fontSizes.sm,
              minHeight: 'auto',
              minWidth: 'auto'
            }}
          >
            ← Trocar Mesa
          </button>
          <h1 style={{ 
            margin: '0', 
            fontSize: designSystem.fontSizes.xl,
            ...estilosBase.titulo
          }}>
            🍔 Jetro's Lanches
          </h1>
          <div style={{ width: '100px' }}></div>
        </div>
        <p style={{ 
          margin: '0', 
          fontSize: designSystem.fontSizes.lg,
          ...estilosBase.subtitulo
        }}>
          Mesa {mesaSelecionada.numero} - Garçom: {garcomNome}
        </p>
      </header>

      {/* STATUS DA MESA */}
      <StatusMesaInfo 
        mesaSelecionada={mesaSelecionada}
        verResumoConta={verResumoConta}
        reabrirConta={reabrirConta}
      />

      {/* CARRINHO FLUTUANTE */}
      {carrinho.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: designSystem.cores.sucesso,
          color: designSystem.cores.textoClaro,
          padding: designSystem.spacing.lg,
          borderRadius: '50px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: designSystem.spacing.md,
          ...estilosBase.botao,
          minWidth: '200px',
          fontSize: designSystem.fontSizes.lg
        }}
        onClick={() => setEtapa('carrinho')}
        >
          <span style={{ fontSize: '1.5em' }}>🛒</span>
          <span>{carrinho.reduce((total, item) => total + item.quantidade, 0)} itens</span>
          <span>R$ {calcularTotal().toFixed(2)}</span>
        </div>
      )}

      {/* BOTÃO FECHAR CONTA NO CARDÁPIO */}
      {mesaSelecionada.status_pagamento !== 'fechada' && mesaSelecionada.status_pagamento !== 'paga' && (
        <div style={{ textAlign: 'center', marginBottom: designSystem.spacing.xl }}>
          <button
            onClick={fecharConta}
            style={{
              backgroundColor: designSystem.cores.aviso,
              color: designSystem.cores.textoClaro,
              border: 'none',
              padding: designSystem.spacing.lg,
              borderRadius: '12px',
              fontSize: designSystem.fontSizes.lg,
              ...estilosBase.botao,
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }}
          >
            🧾 Fechar Conta
          </button>
        </div>
      )}

      {/* LISTA DE CATEGORIAS E PRODUTOS */}
      {categorias.map(categoria => (
        <div key={categoria.id} style={{ 
          marginBottom: designSystem.spacing.xl,
          backgroundColor: designSystem.cores.card,
          borderRadius: '20px',
          padding: designSystem.spacing.xl,
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          border: `2px solid ${designSystem.cores.borda}`
        }}>
          <h3 style={{ 
            color: designSystem.cores.primaria, 
            borderBottom: `3px solid ${designSystem.cores.primaria}`,
            paddingBottom: designSystem.spacing.lg,
            marginBottom: designSystem.spacing.lg,
            fontSize: designSystem.fontSizes.xl,
            ...estilosBase.titulo
          }}>
            {categoria.nome}
          </h3>
          
          {categoria.descricao && (
            <p style={{ 
              color: '#666', 
              fontStyle: 'italic', 
              fontSize: designSystem.fontSizes.lg,
              marginBottom: designSystem.spacing.lg,
              ...estilosBase.texto
            }}>
              {categoria.descricao}
            </p>
          )}

          {/* PRODUTOS DESTA CATEGORIA */}
          <div style={{ display: 'grid', gap: designSystem.spacing.lg }}>
            {categoria.produtos && categoria.produtos.map(produto => (
              <div key={produto.id} style={{
                backgroundColor: designSystem.cores.fundo,
                padding: designSystem.spacing.lg,
                borderRadius: '16px',
                border: `2px solid ${designSystem.cores.borda}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: designSystem.spacing.lg,
                minHeight: '120px'
              }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ 
                    margin: '0 0 8px 0', 
                    color: designSystem.cores.texto,
                    fontSize: designSystem.fontSizes.lg,
                    ...estilosBase.subtitulo
                  }}>
                    {produto.nome}
                  </h4>
                  {produto.descricao && (
                    <p style={{ 
                      margin: '0', 
                      color: '#666', 
                      fontSize: designSystem.fontSizes.base,
                      lineHeight: '1.4',
                      ...estilosBase.texto
                    }}>
                      {produto.descricao}
                    </p>
                  )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.lg }}>
                  <span style={{ 
                    backgroundColor: designSystem.cores.sucesso, 
                    color: designSystem.cores.textoClaro, 
                    padding: designSystem.spacing.md,
                    borderRadius: '25px',
                    ...estilosBase.botao,
                    fontSize: designSystem.fontSizes.base,
                    minWidth: '100px',
                    textAlign: 'center',
                    minHeight: 'auto'
                  }}>
                    R$ {Number(produto.preco).toFixed(2)}
                  </span>
                  
                  <button
                    onClick={() => adicionarAoCarrinho(produto)}
                    disabled={mesaSelecionada.status_pagamento === 'fechada' || mesaSelecionada.status_pagamento === 'paga'}
                    style={{
                      backgroundColor: (mesaSelecionada.status_pagamento === 'fechada' || mesaSelecionada.status_pagamento === 'paga') 
                        ? '#ccc' 
                        : designSystem.cores.primaria,
                      color: designSystem.cores.textoClaro,
                      border: 'none',
                      padding: designSystem.spacing.lg,
                      borderRadius: '12px',
                      cursor: (mesaSelecionada.status_pagamento === 'fechada' || mesaSelecionada.status_pagamento === 'paga') 
                        ? 'not-allowed' 
                        : 'pointer',
                      ...estilosBase.botao,
                      fontSize: designSystem.fontSizes.xl,
                      minWidth: '60px',
                      minHeight: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
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

      {/* MODAL DO CARRINHO */}
      {etapa === 'carrinho' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: responsive.paddingContainer
        }}>
          <div style={{
            backgroundColor: designSystem.cores.card,
            padding: designSystem.spacing['2xl'],
            borderRadius: '20px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            ...estilosBase.fontePrimaria,
            border: `3px solid ${designSystem.cores.borda}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: designSystem.spacing.xl }}>
              <h2 style={{ 
                margin: 0, 
                color: designSystem.cores.texto,
                ...estilosBase.titulo,
                fontSize: designSystem.fontSizes.xl
              }}>
                Seu Pedido - Mesa {mesaSelecionada.numero}
              </h2>
              <button
                onClick={() => setEtapa('cardapio')}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: designSystem.fontSizes['2xl'],
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
                padding: designSystem.spacing['3xl'],
                ...estilosBase.texto,
                fontSize: designSystem.fontSizes.lg
              }}>
                Seu carrinho está vazio
              </p>
            ) : (
              <>
                <div style={{ marginBottom: designSystem.spacing.xl }}>
                  {carrinho.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: designSystem.spacing.lg,
                      borderBottom: `2px solid ${designSystem.cores.borda}`,
                      backgroundColor: designSystem.cores.fundo,
                      borderRadius: '12px',
                      marginBottom: designSystem.spacing.md
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: '600', 
                          marginBottom: designSystem.spacing.xs,
                          ...estilosBase.subtitulo,
                          fontSize: designSystem.fontSizes.lg
                        }}>
                          {item.nome}
                        </div>
                        {item.observacoes && (
                          <div style={{ 
                            color: '#666', 
                            fontSize: designSystem.fontSizes.sm,
                            fontStyle: 'italic',
                            marginBottom: designSystem.spacing.xs,
                            ...estilosBase.texto
                          }}>
                            📝 {item.observacoes}
                          </div>
                        )}
                        <div style={{ 
                          color: '#666', 
                          fontSize: designSystem.fontSizes.base,
                          ...estilosBase.texto
                        }}>
                          R$ {Number(item.preco).toFixed(2)} cada
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.sm }}>
                        <button
                          onClick={() => atualizarQuantidade(item.produto_id, item.quantidade - 1, item.observacoes)}
                          style={{
                            backgroundColor: designSystem.cores.fundo,
                            border: `2px solid ${designSystem.cores.borda}`,
                            padding: designSystem.spacing.sm,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            ...estilosBase.botao,
                            fontSize: designSystem.fontSizes.lg,
                            minHeight: '40px',
                            minWidth: '40px'
                          }}
                        >
                          -
                        </button>
                        
                        <span style={{ 
                          minWidth: '40px', 
                          textAlign: 'center',
                          ...estilosBase.texto,
                          fontWeight: '600',
                          fontSize: designSystem.fontSizes.lg
                        }}>
                          {item.quantidade}
                        </span>
                        
                        <button
                          onClick={() => atualizarQuantidade(item.produto_id, item.quantidade + 1, item.observacoes)}
                          style={{
                            backgroundColor: designSystem.cores.fundo,
                            border: `2px solid ${designSystem.cores.borda}`,
                            padding: designSystem.spacing.sm,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            ...estilosBase.botao,
                            fontSize: designSystem.fontSizes.lg,
                            minHeight: '40px',
                            minWidth: '40px'
                          }}
                        >
                          +
                        </button>
                        
                        <button
                          onClick={() => removerDoCarrinho(item.produto_id, item.observacoes)}
                          style={{
                            backgroundColor: '#ffebee',
                            color: designSystem.cores.perigo,
                            border: 'none',
                            padding: designSystem.spacing.sm,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            marginLeft: designSystem.spacing.sm,
                            ...estilosBase.botao,
                            fontSize: designSystem.fontSizes.base,
                            minHeight: '40px',
                            minWidth: '40px'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  borderTop: `3px solid ${designSystem.cores.borda}`,
                  paddingTop: designSystem.spacing.xl,
                  marginBottom: designSystem.spacing.xl
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    ...estilosBase.titulo,
                    fontSize: designSystem.fontSizes.xl
                  }}>
                    <span>Total:</span>
                    <span>R$ {calcularTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: designSystem.spacing.md, flexDirection: windowWidth < 768 ? 'column' : 'row' }}>
                  <button
                    onClick={() => setEtapa('cardapio')}
                    style={{
                      backgroundColor: '#6c757d',
                      color: designSystem.cores.textoClaro,
                      border: 'none',
                      padding: designSystem.spacing.lg,
                      borderRadius: '12px',
                      fontSize: designSystem.fontSizes.lg,
                      ...estilosBase.botao,
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
                      backgroundColor: enviandoPedido ? '#ccc' : designSystem.cores.sucesso,
                      color: designSystem.cores.textoClaro,
                      border: 'none',
                      padding: designSystem.spacing.lg,
                      borderRadius: '12px',
                      fontSize: designSystem.fontSizes.lg,
                      ...estilosBase.botao,
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
        marginTop: designSystem.spacing['4xl'], 
        textAlign: 'center', 
        color: '#666',
        padding: designSystem.spacing['2xl']
      }}>
        <p style={{ 
          margin: '0', 
          fontSize: designSystem.fontSizes.lg,
          ...estilosBase.texto
        }}>
          © 2025 Jetro's Lanches - Sistema Garçom
        </p>
      </footer>
    </div>
  );
}

export default App;