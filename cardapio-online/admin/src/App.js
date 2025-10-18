import React, { useState, useEffect } from 'react';

// Configuração da API
const API_BASE_URL = 'http://localhost:8000/api';

// ✅ CORREÇÃO: Função fetchAPI melhorada
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
      console.error(`❌ HTTP ${response.status} para ${endpoint}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (data === null || data === undefined) {
      throw new Error('Resposta da API vazia');
    }

    // ✅ CORREÇÃO: Verificar success false mas não lançar erro (deixar o componente tratar)
    if (data.success === false) {
      console.warn(`⚠️ API retornou success=false para ${endpoint}:`, data.message);
      // Não lançar erro aqui, deixar o componente decidir
    }

    return data;
  } catch (error) {
    console.error(`❌ Erro na requisição para ${endpoint}:`, error);
    throw error;
  }
};

function App() {
  // Estados do sistema
  const [paginaAtiva, setPaginaAtiva] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  
  // Estados para modais e formulários
  const [configuracoes, setConfiguracoes] = useState({
    nome_estabelecimento: "Jetro's Lanches",
    numero_mesas: 10,
    taxa_servico: 0,
    expediente_aberto: false,
    telefone: ""
  });
  const [expedienteStatus, setExpedienteStatus] = useState(null);
  const [mostrarModalConfig, setMostrarModalConfig] = useState(false);
  const abrirModalConfiguracoes = () => {
  setMostrarModalConfig(true);
  };
  const [mostrarModalExpediente, setMostrarModalExpediente] = useState(false);
  const [mostrarModalProduto, setMostrarModalProduto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [formProduto, setFormProduto] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria_id: '',
    disponivel: true,
    imagem: ''
  });
  
  // ✅ CORREÇÃO: Estado local para configurações
  const [formConfig, setFormConfig] = useState({
    nome_estabelecimento: '',
    telefone: '',
    numero_mesas: 10,
    taxa_servico: 0
  });

  // ✅ CARREGAR DADOS
  const carregarDashboard = async () => {
    try {
      setCarregando(true);
      const data = await fetchAPI('/admin/dashboard');
      setDashboardData(data.data || data);
    } catch (erro) {
      console.error('Erro ao carregar dashboard:', erro);
      alert('Erro ao carregar dashboard');
    } finally {
      setCarregando(false);
    }
  };

  const carregarPedidos = async () => {
    try {
      setCarregando(true);
      const data = await fetchAPI('/admin/pedidos');
      setPedidos(data.data || data || []);
    } catch (erro) {
      console.error('Erro ao carregar pedidos:', erro);
      setPedidos([]);
    } finally {
      setCarregando(false);
    }
  };

  const carregarProdutos = async () => {
    try {
      setCarregando(true);
      const data = await fetchAPI('/admin/produtos');
      setProdutos(data.data || data || []);
      
      // Carregar categorias também
      const catData = await fetchAPI('/admin/categorias');
      setCategorias(catData.data || catData || []);
    } catch (erro) {
      console.error('Erro ao carregar produtos:', erro);
      setProdutos([]);
    } finally {
      setCarregando(false);
    }
  };

  // ✅ CORREÇÃO: Carregar mesas com tratamento melhorado
  const carregarMesas = async () => {
    try {
      setCarregando(true);
      const data = await fetchAPI('/admin/mesas');
      
      if (data && data.data) {
        setMesas(data.data);
      } else {
        setMesas([]);
      }
    } catch (erro) {
      console.error('Erro ao carregar mesas:', erro);
      setMesas([]);
    } finally {
      setCarregando(false);
    }
  };

  // ✅ CORREÇÃO: Carregar configurações de forma robusta
  const carregarConfiguracoes = async () => {
    try {
      console.log('🔄 Carregando configurações...');
      const data = await fetchAPI('/admin/configuracoes');
      console.log('✅ Resposta da API configurações:', data);
      
      if (data && data.data) {
        setConfiguracoes(data.data);
        setFormConfig({
          nome_estabelecimento: data.data.nome_estabelecimento || '',
          telefone: data.data.telefone || '',
          numero_mesas: data.data.numero_mesas || 10,
          taxa_servico: data.data.taxa_servico || 0
        });
        console.log('✅ Configurações carregadas com sucesso');
      } else {
        console.warn('⚠️ Resposta de configurações vazia ou inválida');
        // Usar valores padrão
        setConfiguracoes({
          nome_estabelecimento: "Jetro's Lanches",
          numero_mesas: 10,
          taxa_servico: 0,
          expediente_aberto: false,
          telefone: ""
        });
      }
    } catch (erro) {
      console.error('❌ Erro ao carregar configurações:', erro);
      // Configurações padrão em caso de erro
      setConfiguracoes({
        nome_estabelecimento: "Jetro's Lanches",
        numero_mesas: 10,
        taxa_servico: 0,
        expediente_aberto: false,
        telefone: ""
      });
    }
  };

  // ✅ CORREÇÃO: Atualizar configurações de forma robusta
  const atualizarConfiguracoes = async (novasConfigs) => {
    try {
      console.log('🔄 Iniciando atualização de configurações:', novasConfigs);
      
      // Garantir que os dados estejam no formato correto
      const configParaEnviar = {
        nome_estabelecimento: novasConfigs.nome_estabelecimento?.trim() || '',
        telefone: novasConfigs.telefone?.trim() || '',
        numero_mesas: parseInt(novasConfigs.numero_mesas) || 1,
        taxa_servico: parseFloat(novasConfigs.taxa_servico) || 0
      };

      console.log('📤 Enviando configurações:', configParaEnviar);

      const data = await fetchAPI('/admin/configuracoes', {
        method: 'PUT',
        body: JSON.stringify(configParaEnviar)
      });
      
      console.log('✅ Resposta da atualização:', data);
      
      if (data && data.data) {
        // Atualizar o estado local
        setConfiguracoes(data.data);
        setFormConfig({
          nome_estabelecimento: data.data.nome_estabelecimento || '',
          telefone: data.data.telefone || '',
          numero_mesas: data.data.numero_mesas || 10,
          taxa_servico: data.data.taxa_servico || 0
        });
        
        alert('✅ Configurações atualizadas com sucesso!');
        setMostrarModalConfig(false);
      } else {
        throw new Error('Resposta inválida da API');
      }
      
    } catch (erro) {
      console.error('❌ Erro ao atualizar configurações:', erro);
      
      let mensagemErro = 'Erro ao atualizar configurações: ' + erro.message;
      
      // Tratamento específico de erros
      if (erro.message.includes('500')) {
        mensagemErro = 'Erro interno do servidor. Verifique os logs do backend.';
      } else if (erro.message.includes('Network Error')) {
        mensagemErro = 'Erro de conexão. Verifique se o servidor está rodando.';
      }
      
      alert('❌ ' + mensagemErro);
    }
  };

  // ✅ CORREÇÃO: Carregar status do expediente
  const carregarExpedienteStatus = async () => {
    try {
      const data = await fetchAPI('/admin/expediente/status');
      // Ajuste para a estrutura correta do response
      setExpedienteStatus(data.data || data);
    } catch (erro) {
      console.error('Erro ao carregar status do expediente:', erro);
    }
  };

  // ✅ ATUALIZAR STATUS DO PEDIDO
  const atualizarStatusPedido = async (pedidoId, novoStatus) => {
    try {
      await fetchAPI(`/admin/pedidos/${pedidoId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: novoStatus })
      });
      
      alert(`✅ Pedido #${pedidoId} atualizado para: ${novoStatus}`);
      carregarPedidos();
    } catch (erro) {
      console.error('Erro ao atualizar pedido:', erro);
      alert('❌ Erro ao atualizar pedido: ' + erro.message);
    }
  };

  // ✅ CANCELAR PEDIDO
  const cancelarPedido = async (pedidoId) => {
    if (!window.confirm('Tem certeza que deseja cancelar este pedido?')) {
      return;
    }

    try {
      await fetchAPI(`/admin/pedidos/${pedidoId}/cancelar`, {
        method: 'POST'
      });
      
      alert(`✅ Pedido #${pedidoId} cancelado com sucesso!`);
      carregarPedidos();
    } catch (erro) {
      console.error('Erro ao cancelar pedido:', erro);
      alert('❌ Erro ao cancelar pedido: ' + erro.message);
    }
  };

  // ✅ CORREÇÃO: Pagar conta da mesa com tratamento melhor
  const pagarContaMesa = async (mesaId) => {
    if (!window.confirm('Confirmar pagamento da conta desta mesa?\n\nIsso irá:\n- Marcar a conta como paga\n- Liberar a mesa\n- Marcar pedidos como entregues')) {
      return;
    }

    try {
      const resultado = await fetchAPI(`/admin/mesas/${mesaId}/pagar-conta`, {
        method: 'POST'
      });

      if (resultado.success) {
        alert(`✅ Conta da mesa paga com sucesso! Mesa liberada.`);
        carregarMesas();
        carregarDashboard();
      } else {
        throw new Error(resultado.message || 'Erro ao pagar conta');
      }
    } catch (erro) {
      console.error('Erro ao pagar conta:', erro);
      
      if (erro.message.includes('não possui conta fechada')) {
        alert('❌ ' + erro.message);
      } else {
        alert('❌ Erro ao pagar conta: ' + erro.message);
      }
    }
  };

  // ✅ CORREÇÃO: Função para obter cor da mesa baseada no status
  const getCorMesa = (mesa) => {
    // Prioridade: Status pagamento > Status mesa
    if (mesa.status_pagamento === 'paga') {
      return '#4caf50'; // Verde - Paga
    } else if (mesa.status_pagamento === 'fechada') {
      return '#ff9800'; // Laranja - Fechada
    } else if (mesa.status === 'ocupada') {
      return '#f44336'; // Vermelho - Ocupada
    } else if (mesa.status === 'em_uso') {
      return '#ff9800'; // Laranja - Em Uso
    } else {
      return '#4caf50'; // Verde - Livre
    }
  };

  // ✅ CORREÇÃO: Função para obter texto do status
  const getTextoStatusMesa = (mesa) => {
    if (mesa.status_pagamento === 'paga') {
      return 'Paga';
    } else if (mesa.status_pagamento === 'fechada') {
      return 'Fechada';
    } else if (mesa.status === 'ocupada') {
      return 'Ocupada';
    } else if (mesa.status === 'em_uso') {
      return 'Em Uso';
    } else {
      return 'Livre';
    }
  };

  // ✅ GERENCIAMENTO DE PRODUTOS - CORRIGIDO
  const abrirModalProduto = (produto = null) => {
    if (produto) {
      setProdutoEditando(produto);
      setFormProduto({
        nome: produto.nome || '',
        descricao: produto.descricao || '',
        preco: produto.preco || '',
        categoria_id: produto.categoria_id || '',
        disponivel: produto.disponivel !== undefined ? produto.disponivel : true,
        imagem: produto.imagem || ''
      });
    } else {
      setProdutoEditando(null);
      setFormProduto({
        nome: '',
        descricao: '',
        preco: '',
        categoria_id: '',
        disponivel: true,
        imagem: ''
      });
    }
    setMostrarModalProduto(true);
  };

  const salvarProduto = async (e) => {
    e.preventDefault();
    
    try {
      const produtoData = {
        ...formProduto,
        preco: parseFloat(formProduto.preco) || 0
      };

      if (produtoEditando) {
        await fetchAPI(`/admin/produtos/${produtoEditando.id}`, {
          method: 'PUT',
          body: JSON.stringify(produtoData)
        });
        alert('✅ Produto atualizado com sucesso!');
      } else {
        await fetchAPI('/admin/produtos', {
          method: 'POST',
          body: JSON.stringify(produtoData)
        });
        alert('✅ Produto criado com sucesso!');
      }

      setMostrarModalProduto(false);
      carregarProdutos();
    } catch (erro) {
      console.error('Erro ao salvar produto:', erro);
      alert('❌ Erro ao salvar produto: ' + erro.message);
    }
  };

  const excluirProduto = async (produtoId) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      await fetchAPI(`/admin/produtos/${produtoId}`, {
        method: 'DELETE'
      });
      
      alert('✅ Produto excluído com sucesso!');
      carregarProdutos();
    } catch (erro) {
      console.error('Erro ao excluir produto:', erro);
      alert('❌ Erro ao excluir produto: ' + erro.message);
    }
  };

  // ✅ CORREÇÃO: IMPRESSÃO VIA CONTROLLER - ROTAS CORRIGIDAS
  const imprimirPedidoController = async (pedido, tipo = 'termica') => {
    try {
      // ✅ CORREÇÃO: Endpoints corrigidos para corresponder ao Laravel
      const endpoint = tipo === 'termica' 
        ? `/admin/impressao/pedido/${pedido.id}/termica`
        : `/admin/impressao/pedido/${pedido.id}/compacto`;
      
      const data = await fetchAPI(endpoint);
      
      const janelaImpressao = window.open('', '_blank', 'width=300,height=500,left=200,top=100');
      janelaImpressao.document.write(data.data.conteudo_impressao);
      janelaImpressao.document.close();
      
      setTimeout(() => {
        janelaImpressao.focus();
        janelaImpressao.print();
        setTimeout(() => janelaImpressao.close(), 1000);
      }, 300);
      
    } catch (erro) {
      console.error('Erro na impressão:', erro);
      // Fallback para impressão local
      imprimirPedidoFallback(pedido);
    }
  };

  // ✅ IMPRESSÃO DE FALLBACK
  const imprimirPedidoFallback = (pedido) => {
    const conteudoImpressao = `
<!DOCTYPE html>
<html>
<head>
  <title>Pedido #${pedido.id}</title>
  <style>
    body { font-family: 'Courier New', monospace; margin: 0; padding: 2mm; font-size: 9px; width: 58mm; }
    .header { text-align: center; margin-bottom: 3mm; border-bottom: 1px dashed #000; padding-bottom: 2mm; }
    .empresa { font-weight: bold; font-size: 11px; margin-bottom: 1mm; }
    .info { margin-bottom: 3mm; font-size: 8px; }
    .info-line { display: flex; justify-content: space-between; margin: 1mm 0; }
    .itens { width: 100%; border-collapse: collapse; margin: 2mm 0; font-size: 8px; }
    .itens th, .itens td { padding: 1mm; text-align: left; border-bottom: 1px dashed #ddd; }
    .itens th { border-bottom: 1px solid #000; }
    .item-nome { width: 60%; }
    .item-qtd { width: 15%; text-align: center; }
    .item-preco { width: 25%; text-align: right; }
    .total { font-weight: bold; font-size: 10px; margin-top: 3mm; border-top: 2px solid #000; padding-top: 2mm; text-align: center; }
    .footer { text-align: center; margin-top: 4mm; font-size: 7px; color: #666; }
    @media print { body { margin: 0; padding: 2mm; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="empresa">${configuracoes.nome_estabelecimento}</div>
    <div>PEDIDO #${pedido.id}</div>
  </div>
  
  <div class="info">
    <div class="info-line">
      <span>Mesa: ${pedido.mesa?.numero || pedido.mesa_id}</span>
      <span>${new Date(pedido.created_at).toLocaleDateString('pt-BR')}</span>
    </div>
    <div class="info-line">
      <span>Garçom: ${pedido.garcom_nome || 'SISTEMA'}</span>
      <span>${new Date(pedido.created_at).toLocaleTimeString('pt-BR')}</span>
    </div>
  </div>
  
  <table class="itens">
    <thead>
      <tr>
        <th class="item-nome">ITEM</th>
        <th class="item-qtd">QTD</th>
        <th class="item-preco">VALOR</th>
      </tr>
    </thead>
    <tbody>
      ${pedido.itens ? pedido.itens.map(item => `
        <tr>
          <td class="item-nome">${item.produto?.nome || 'PRODUTO'}</td>
          <td class="item-qtd">${item.quantidade}</td>
          <td class="item-preco">R$ ${Number(item.preco_unitario).toFixed(2)}</td>
        </tr>
      `).join('') : ''}
    </tbody>
  </table>
  
  <div class="total">
    TOTAL: R$ ${Number(pedido.total).toFixed(2)}
  </div>
  
  <div class="footer">
    ${new Date().toLocaleString('pt-BR')}
  </div>
</body>
</html>`;

    const janelaImpressao = window.open('', '_blank');
    janelaImpressao.document.write(conteudoImpressao);
    janelaImpressao.document.close();
    setTimeout(() => {
      janelaImpressao.print();
      setTimeout(() => janelaImpressao.close(), 500);
    }, 250);
  };

  // 🔥 FUNÇÕES DE EXPEDIENTE - CORRIGIDAS
  const abrirExpediente = async () => {
    try {
      await fetchAPI('/admin/expediente/abrir', {
        method: 'POST'
      });
      
      alert('✅ Expediente aberto com sucesso! Sistema reiniciado.');
      carregarExpedienteStatus();
      carregarDashboard();
      carregarMesas(); // Recarregar mesas após reset
    } catch (erro) {
      console.error('Erro ao abrir expediente:', erro);
      alert(erro.message || '❌ Erro ao abrir expediente');
    }
  };

  const fecharExpediente = async () => {
    try {
      const data = await fetchAPI('/admin/expediente/fechar', {
        method: 'POST'
      });
      
      alert('✅ Expediente fechado com sucesso!');
      setMostrarModalExpediente(true);
      carregarExpedienteStatus();
      carregarDashboard();
    } catch (erro) {
      console.error('Erro ao fechar expediente:', erro);
      alert(erro.message || '❌ Erro ao fechar expediente');
    }
  };

  const reiniciarSistema = async () => {
    if (!window.confirm('⚠️ ATENÇÃO!\n\nIsso irá reiniciar todo o sistema:\n- Liberar todas as mesas\n- Cancelar pedidos em aberto\n- Zerar estatísticas do dia\n\nContinuar?')) {
      return;
    }

    try {
      await fetchAPI('/admin/configuracoes/reiniciar-sistema', {
        method: 'POST'
      });
      
      alert('✅ Sistema reiniciado com sucesso!');
      carregarDashboard();
      carregarMesas();
      carregarPedidos();
    } catch (erro) {
      console.error('Erro ao reiniciar sistema:', erro);
      alert('❌ Erro ao reiniciar sistema');
    }
  };

  // ✅ CORREÇÃO: Effect para carregar dados
  useEffect(() => {
    const carregarDados = async () => {
      switch (paginaAtiva) {
        case 'dashboard':
          await carregarDashboard();
          await carregarMesas();
          await carregarExpedienteStatus();
          await carregarConfiguracoes(); // ✅ AGORA CARREGA CONFIGURAÇÕES
          break;
        case 'pedidos':
          await carregarPedidos();
          break;
        case 'produtos':
          await carregarProdutos();
          break;
        case 'mesas':
          await carregarMesas();
          break;
      }
    };

    carregarDados();
  }, [paginaAtiva]);

  // 🎨 ESTILOS
  const estilos = {
    container: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' },
    header: { backgroundColor: '#1a237e', color: 'white', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    nav: { display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' },
    navButton: { backgroundColor: 'transparent', color: 'white', border: '1px solid white', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' },
    navButtonAtivo: { backgroundColor: 'white', color: '#1a237e', border: '1px solid white', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
    main: { padding: '20px', maxWidth: '1200px', margin: '0 auto' },
    card: { backgroundColor: 'white', borderRadius: '8px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' },
    statCard: { backgroundColor: 'white', borderRadius: '8px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    th: { backgroundColor: '#f8f9fa', padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' },
    td: { padding: '12px', borderBottom: '1px solid #dee2e6' },
    badge: { padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
    badgePendente: { backgroundColor: '#fff3cd', color: '#856404' },
    badgePreparando: { backgroundColor: '#cce7ff', color: '#004085' },
    badgePronto: { backgroundColor: '#d4edda', color: '#155724' },
    badgeEntregue: { backgroundColor: '#d1ecf1', color: '#0c5460' },
    badgeSuccess: { backgroundColor: '#d4edda', color: '#155724' },
    badgeWarning: { backgroundColor: '#fff3cd', color: '#856404' },
    badgeDanger: { backgroundColor: '#f8d7da', color: '#721c24' },
    button: { padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', margin: '2px' },
    buttonPrimary: { backgroundColor: '#007bff', color: 'white' },
    buttonSuccess: { backgroundColor: '#28a745', color: 'white' },
    buttonWarning: { backgroundColor: '#ffc107', color: '#212529' },
    buttonDanger: { backgroundColor: '#dc3545', color: 'white' },
    buttonInfo: { backgroundColor: '#17a2b8', color: 'white' }
  };

  // 🔥 COMPONENTE CONTROLE EXPEDIENTE
  const ControleExpediente = () => {
    if (!expedienteStatus) return null;

    return (
      <div style={estilos.card}>
        <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🕒 Controle de Expediente
          <span style={{
            ...estilos.badge,
            ...(expedienteStatus.expediente_aberto ? estilos.badgeSuccess : estilos.badgeDanger)
          }}>
            {expedienteStatus.expediente_aberto ? '🟢 ABERTO' : '🔴 FECHADO'}
          </span>
        </h3>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {!expedienteStatus.expediente_aberto ? (
            <button
              onClick={abrirExpediente}
              style={{ ...estilos.button, ...estilos.buttonSuccess, padding: '10px 20px' }}
            >
              🟢 Iniciar Expediente
            </button>
          ) : (
            <button
              onClick={fecharExpediente}
              style={{ ...estilos.button, ...estilos.buttonDanger, padding: '10px 20px' }}
            >
              🔴 Fechar Expediente
            </button>
          )}
          
          <button
            onClick={abrirModalConfiguracoes}
            style={{ ...estilos.button, ...estilos.buttonPrimary, padding: '10px 20px' }}
          >
            ⚙️ Configurações
          </button>
          
          <button
            onClick={reiniciarSistema}
            style={{ ...estilos.button, ...estilos.buttonWarning, padding: '10px 20px' }}
          >
            🔄 Reiniciar Sistema
          </button>
        </div>

        {expedienteStatus.expediente_aberto && (
          <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '5px' }}>
            <p style={{ margin: '0', fontWeight: 'bold', color: '#155724' }}>
              📊 Hoje: {expedienteStatus.pedidos_hoje || 0} pedidos • 
              R$ {Number(expedienteStatus.vendas_hoje || 0).toFixed(2)} em vendas
            </p>
          </div>
        )}
      </div>
    );
  };

 // 🔥 MODAL CONFIGURAÇÕES - CORRIGIDO
const ModalConfiguracoes = ({ configuracoes, mostrarModalConfig, setMostrarModalConfig, atualizarConfiguracoes, estilos }) => {
  // Estado local para o formulário
  const [localForm, setLocalForm] = useState({
    nome_estabelecimento: '',
    telefone: '',
    numero_mesas: 10,
    taxa_servico: 0
  });

  // Carregar configurações quando o modal abrir
  useEffect(() => {
    if (configuracoes && mostrarModalConfig) {
      console.log('📱 Carregando configurações no modal:', configuracoes);
      setLocalForm({
        nome_estabelecimento: configuracoes.nome_estabelecimento ?? '',
        telefone: configuracoes.telefone ?? '',
        numero_mesas: configuracoes.numero_mesas ?? 10,
        taxa_servico: configuracoes.taxa_servico ?? 0
      });
    }
  }, [configuracoes, mostrarModalConfig]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📤 Enviando configurações:', localForm);
    
    try {
      // Garantir que os números sejam corretos
      const configParaEnviar = {
        ...localForm,
        numero_mesas: Math.max(1, parseInt(localForm.numero_mesas) || 1),
        taxa_servico: Math.max(0, parseFloat(localForm.taxa_servico) || 0)
      };
      
      await atualizarConfiguracoes(configParaEnviar);
      setMostrarModalConfig(false);
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
      // Aqui você pode adicionar um toast de erro ou alerta
    }
  };

  const handleInputChange = (field, value) => {
    setLocalForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!mostrarModalConfig) return null;

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
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>⚙️ Configurações do Sistema</h3>
          <button
            onClick={() => setMostrarModalConfig(false)}
            style={{ backgroundColor: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Nome do Estabelecimento:
            </label>
            <input
              type="text"
              value={localForm.nome_estabelecimento}
              onChange={(e) => handleInputChange('nome_estabelecimento', e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Telefone:
            </label>
            <input
              type="text"
              value={localForm.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Número de Mesas:
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={localForm.numero_mesas}
              onChange={(e) => handleInputChange('numero_mesas', e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              required
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              ⚠️ Alterar o número de mesas pode afetar o sistema existente
            </small>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Taxa de Serviço (%):
            </label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.1"
              value={localForm.taxa_servico}
              onChange={(e) => handleInputChange('taxa_servico', e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              Exemplo: 10 para 10% de taxa de serviço
            </small>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              type="submit"
              style={{ 
                ...estilos.button, 
                ...estilos.buttonSuccess, 
                padding: '12px 24px', 
                fontSize: '16px',
                flex: 1
              }}
            >
              💾 Salvar Configurações
            </button>
            <button
              type="button"
              onClick={() => setMostrarModalConfig(false)}
              style={{ 
                ...estilos.button, 
                backgroundColor: '#6c757d', 
                color: 'white', 
                padding: '12px 24px', 
                fontSize: '16px',
                flex: 1
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
  // 🔥 MODAL PRODUTO - CORRIGIDO
  const ModalProduto = () => {
    // Estado local para controlar os inputs
    const [localForm, setLocalForm] = useState({
      nome: '',
      descricao: '',
      preco: '',
      categoria_id: '',
      disponivel: true,
      imagem: ''
    });

    // Quando o modal abrir ou o produtoEditando mudar, atualizar o estado local
    useEffect(() => {
      if (produtoEditando) {
        setLocalForm({
          nome: produtoEditando.nome || '',
          descricao: produtoEditando.descricao || '',
          preco: produtoEditando.preco || '',
          categoria_id: produtoEditando.categoria_id || '',
          disponivel: produtoEditando.disponivel !== undefined ? produtoEditando.disponivel : true,
          imagem: produtoEditando.imagem || ''
        });
      } else {
        setLocalForm({
          nome: '',
          descricao: '',
          preco: '',
          categoria_id: '',
          disponivel: true,
          imagem: ''
        });
      }
    }, [produtoEditando, mostrarModalProduto]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        const produtoData = {
          ...localForm,
          preco: parseFloat(localForm.preco) || 0
        };

        if (produtoEditando) {
          await fetchAPI(`/admin/produtos/${produtoEditando.id}`, {
            method: 'PUT',
            body: JSON.stringify(produtoData)
          });
          alert('✅ Produto atualizado com sucesso!');
        } else {
          await fetchAPI('/admin/produtos', {
            method: 'POST',
            body: JSON.stringify(produtoData)
          });
          alert('✅ Produto criado com sucesso!');
        }

        setMostrarModalProduto(false);
        carregarProdutos();
      } catch (erro) {
        console.error('Erro ao salvar produto:', erro);
        alert('❌ Erro ao salvar produto: ' + erro.message);
      }
    };

    const handleInputChange = (field, value) => {
      setLocalForm(prev => ({
        ...prev,
        [field]: value
      }));
    };

    if (!mostrarModalProduto) return null;

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
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>{produtoEditando ? '✏️ Editar Produto' : '🍔 Novo Produto'}</h3>
            <button
              onClick={() => setMostrarModalProduto(false)}
              style={{ backgroundColor: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Nome do Produto: *
              </label>
              <input
                type="text"
                value={localForm.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                required
                autoFocus
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Descrição:
              </label>
              <textarea
                value={localForm.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  minHeight: '80px', 
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Preço: *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={localForm.preco}
                onChange={(e) => handleInputChange('preco', e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Categoria: *
              </label>
              <select
                value={localForm.categoria_id}
                onChange={(e) => handleInputChange('categoria_id', e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                required
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={localForm.disponivel}
                  onChange={(e) => handleInputChange('disponivel', e.target.checked)}
                  style={{ transform: 'scale(1.2)' }}
                />
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Produto disponível</span>
              </label>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                URL da Imagem:
              </label>
              <input
                type="url"
                value={localForm.imagem}
                onChange={(e) => handleInputChange('imagem', e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                type="submit"
                style={{ 
                  ...estilos.button, 
                  ...estilos.buttonSuccess, 
                  padding: '12px 24px', 
                  fontSize: '16px',
                  flex: 1
                }}
              >
                💾 {produtoEditando ? 'Atualizar' : 'Criar'} Produto
              </button>
              <button
                type="button"
                onClick={() => setMostrarModalProduto(false)}
                style={{ 
                  ...estilos.button, 
                  backgroundColor: '#6c757d', 
                  color: 'white', 
                  padding: '12px 24px', 
                  fontSize: '16px',
                  flex: 1
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // 🔥 MODAL RELATÓRIO DIA
  const ModalRelatorioDia = () => {
    if (!mostrarModalExpediente || !expedienteStatus) return null;

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
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>📊 Relatório do Expediente</h3>
            <button
              onClick={() => setMostrarModalExpediente(false)}
              style={{ backgroundColor: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          <div style={estilos.grid}>
            <div style={estilos.statCard}>
              <h4>🛒 Pedidos Hoje</h4>
              <p style={{ fontSize: '2em', fontWeight: 'bold', margin: '10px 0', color: '#007bff' }}>
                {expedienteStatus.pedidos_hoje || 0}
              </p>
            </div>
            
            <div style={estilos.statCard}>
              <h4>💰 Vendas Hoje</h4>
              <p style={{ fontSize: '2em', fontWeight: 'bold', margin: '10px 0', color: '#28a745' }}>
                R$ {Number(expedienteStatus.vendas_hoje || 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            <h4 style={{ marginBottom: '10px' }}>✅ Expediente Encerrado</h4>
            <p style={{ margin: 0, color: '#666' }}>
              O expediente foi fechado com sucesso. Todos os dados do dia foram registrados.
            </p>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setMostrarModalExpediente(false)}
              style={{ ...estilos.button, ...estilos.buttonPrimary, padding: '10px 20px' }}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ✅ COMPONENTE PEDIDOS
  const Pedidos = () => {
    const getBadgeStyle = (status) => {
      switch (status) {
        case 'pendente': return { ...estilos.badge, ...estilos.badgePendente };
        case 'preparando': return { ...estilos.badge, ...estilos.badgePreparando };
        case 'pronto': return { ...estilos.badge, ...estilos.badgePronto };
        case 'entregue': return { ...estilos.badge, ...estilos.badgeEntregue };
        case 'cancelado': return { ...estilos.badge, ...estilos.badgeDanger };
        default: return estilos.badge;
      }
    };

    return (
      <div>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>📦 Pedidos</h2>
        
        <div style={estilos.card}>
          {pedidos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p>Nenhum pedido encontrado.</p>
              <p style={{ fontSize: '12px', marginTop: '10px' }}>
                Os pedidos aparecerão aqui quando forem criados pelo sistema do garçom.
              </p>
            </div>
          ) : (
            <table style={estilos.table}>
              <thead>
                <tr>
                  <th style={estilos.th}>ID</th>
                  <th style={estilos.th}>Mesa</th>
                  <th style={estilos.th}>Garçom</th>
                  <th style={estilos.th}>Total</th>
                  <th style={estilos.th}>Status</th>
                  <th style={estilos.th}>Data</th>
                  <th style={estilos.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map(pedido => (
                  <tr key={pedido.id}>
                    <td style={estilos.td}>#{pedido.id}</td>
                    <td style={estilos.td}>Mesa {pedido.mesa?.numero || pedido.mesa_id || 'N/A'}</td>
                    <td style={estilos.td}>{pedido.garcom_nome || 'N/A'}</td>
                    <td style={estilos.td}>R$ {Number(pedido.total || 0).toFixed(2)}</td>
                    <td style={estilos.td}>
                      <span style={getBadgeStyle(pedido.status)}>
                        {pedido.status || 'pendente'}
                      </span>
                    </td>
                    <td style={estilos.td}>
                      {pedido.created_at ? new Date(pedido.created_at).toLocaleString('pt-BR') : 'N/A'}
                    </td>
                    <td style={estilos.td}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <button
                          onClick={() => setPedidoSelecionado(pedido)}
                          style={{ ...estilos.button, backgroundColor: '#6c757d', color: 'white' }}
                        >
                          👀 Ver
                        </button>
                        
                        {/* BOTÕES DE STATUS */}
                        {pedido.status !== 'entregue' && pedido.status !== 'cancelado' && (
                          <>
                            {pedido.status !== 'preparando' && (
                              <button
                                onClick={() => atualizarStatusPedido(pedido.id, 'preparando')}
                                style={{ ...estilos.button, ...estilos.buttonWarning }}
                              >
                                🍳 Preparar
                              </button>
                            )}
                            
                            {pedido.status !== 'pronto' && (
                              <button
                                onClick={() => atualizarStatusPedido(pedido.id, 'pronto')}
                                style={{ ...estilos.button, ...estilos.buttonSuccess }}
                              >
                                ✅ Pronto
                              </button>
                            )}
                            
                            <button
                              onClick={() => atualizarStatusPedido(pedido.id, 'entregue')}
                              style={{ ...estilos.button, ...estilos.buttonPrimary }}
                            >
                              🎯 Entregar
                            </button>
                            
                            <button
                              onClick={() => cancelarPedido(pedido.id)}
                              style={{ ...estilos.button, ...estilos.buttonDanger }}
                            >
                              ❌ Cancelar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal de Detalhes do Pedido */}
        {pedidoSelecionado && (
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
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Detalhes do Pedido #{pedidoSelecionado.id}</h3>
                <button
                  onClick={() => setPedidoSelecionado(null)}
                  style={{ backgroundColor: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
              
              <p><strong>Mesa:</strong> {pedidoSelecionado.mesa?.numero || pedidoSelecionado.mesa_id || 'N/A'}</p>
              <p><strong>Garçom:</strong> {pedidoSelecionado.garcom_nome || 'N/A'}</p>
              <p><strong>Total:</strong> R$ {Number(pedidoSelecionado.total || 0).toFixed(2)}</p>
              <p><strong>Status:</strong> 
                <span style={getBadgeStyle(pedidoSelecionado.status)}>
                  {pedidoSelecionado.status || 'pendente'}
                </span>
              </p>
              <p><strong>Data:</strong> {pedidoSelecionado.created_at ? new Date(pedidoSelecionado.created_at).toLocaleString('pt-BR') : 'N/A'}</p>
              
              <h4 style={{ marginTop: '20px' }}>Itens do Pedido:</h4>
              {pedidoSelecionado.itens && pedidoSelecionado.itens.length > 0 ? (
                <ul style={{ paddingLeft: '20px' }}>
                  {pedidoSelecionado.itens.map((item, index) => (
                    <li key={index} style={{ marginBottom: '8px' }}>
                      <strong>{item.quantidade}x {item.produto?.nome || 'Produto'}</strong><br/>
                      <span>Preço: R$ {Number(item.preco_unitario || 0).toFixed(2)} cada</span>
                      {item.observacoes && <div><small>Obs: {item.observacoes}</small></div>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhum item encontrado</p>
              )}
              
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => imprimirPedidoController(pedidoSelecionado, 'termica')}
                  style={{ ...estilos.button, ...estilos.buttonPrimary }}
                >
                  🖨️ 58mm (Termica)
                </button>
                <button
                  onClick={() => imprimirPedidoController(pedidoSelecionado, 'compacto')}
                  style={{ ...estilos.button, ...estilos.buttonInfo }}
                >
                  📄 80mm (Compacto)
                </button>
                <button
                  onClick={() => setPedidoSelecionado(null)}
                  style={{ ...estilos.button, backgroundColor: '#6c757d', color: 'white' }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ✅ COMPONENTE PRODUTOS
  const Produtos = () => {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#333' }}>🍔 Produtos</h2>
          <button
            onClick={() => abrirModalProduto()}
            style={{ ...estilos.button, ...estilos.buttonSuccess, padding: '10px 20px' }}
          >
            ➕ Novo Produto
          </button>
        </div>
        
        <div style={estilos.card}>
          {produtos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p>Nenhum produto cadastrado.</p>
              <button
                onClick={() => abrirModalProduto()}
                style={{ ...estilos.button, ...estilos.buttonSuccess, marginTop: '10px' }}
              >
                ➕ Cadastrar Primeiro Produto
              </button>
            </div>
          ) : (
            <table style={estilos.table}>
              <thead>
                <tr>
                  <th style={estilos.th}>Nome</th>
                  <th style={estilos.th}>Descrição</th>
                  <th style={estilos.th}>Preço</th>
                  <th style={estilos.th}>Categoria</th>
                  <th style={estilos.th}>Disponível</th>
                  <th style={estilos.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map(produto => (
                  <tr key={produto.id}>
                    <td style={estilos.td}>
                      <div style={{ fontWeight: 'bold' }}>{produto.nome}</div>
                    </td>
                    <td style={estilos.td}>{produto.descricao || '-'}</td>
                    <td style={estilos.td}>
                      <strong>R$ {Number(produto.preco || 0).toFixed(2)}</strong>
                    </td>
                    <td style={estilos.td}>
                      {produto.categoria?.nome || 'Sem categoria'}
                    </td>
                    <td style={estilos.td}>
                      <span style={{
                        ...estilos.badge,
                        ...(produto.disponivel ? estilos.badgeSuccess : estilos.badgeDanger)
                      }}>
                        {produto.disponivel ? '✅ Sim' : '❌ Não'}
                      </span>
                    </td>
                    <td style={estilos.td}>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => abrirModalProduto(produto)}
                          style={{ ...estilos.button, ...estilos.buttonPrimary }}
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          onClick={() => excluirProduto(produto.id)}
                          style={{ ...estilos.button, ...estilos.buttonDanger }}
                        >
                          🗑️ Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  // ✅ CORREÇÃO: Componente Mesas atualizado
  const Mesas = () => {
    return (
      <div>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>🪑 Mesas</h2>
        
        {/* Estatísticas das Mesas */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px', 
          marginBottom: '20px' 
        }}>
          <div style={{ 
            backgroundColor: '#4caf50', 
            color: 'white', 
            padding: '15px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>🟢 Livres</h3>
            <p style={{ fontSize: '1.5em', fontWeight: 'bold', margin: 0 }}>
              {mesas.filter(m => getTextoStatusMesa(m) === 'Livre').length}
            </p>
          </div>
          
          <div style={{ 
            backgroundColor: '#ff9800', 
            color: 'white', 
            padding: '15px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>🟡 Em Uso/Fechadas</h3>
            <p style={{ fontSize: '1.5em', fontWeight: 'bold', margin: 0 }}>
              {mesas.filter(m => getTextoStatusMesa(m) === 'Em Uso' || getTextoStatusMesa(m) === 'Fechada').length}
            </p>
          </div>
          
          <div style={{ 
            backgroundColor: '#f44336', 
            color: 'white', 
            padding: '15px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>🔴 Ocupadas</h3>
            <p style={{ fontSize: '1.5em', fontWeight: 'bold', margin: 0 }}>
              {mesas.filter(m => getTextoStatusMesa(m) === 'Ocupada').length}
            </p>
          </div>
        </div>

        <div style={estilos.card}>
          {mesas.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              Nenhuma mesa carregada
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              {mesas.map(mesa => {
                const corMesa = getCorMesa(mesa);
                const textoStatus = getTextoStatusMesa(mesa);
                const temContaFechada = mesa.status_pagamento === 'fechada';

                return (
                  <div key={mesa.id} style={{
                    border: `2px solid ${corMesa}`,
                    borderRadius: '8px',
                    padding: '15px',
                    backgroundColor: `${corMesa}15` // Cor com transparência
                  }}>
                    <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        backgroundColor: corMesa 
                      }}></span>
                      Mesa {mesa.numero}
                    </h4>
                    
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>
                      <strong>Status:</strong> 
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginLeft: '8px',
                        backgroundColor: corMesa,
                        color: 'white'
                      }}>
                        {textoStatus}
                      </span>
                    </p>
                    
                    {mesa.garcom_nome && (
                      <p style={{ margin: '5px 0', fontSize: '14px' }}>
                        <strong>Garçom:</strong> {mesa.garcom_nome}
                      </p>
                    )}
                    
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>
                      <strong>Pedidos ativos:</strong> {mesa.pedidos_ativos || 0}
                    </p>
                    
                    {mesa.total_conta > 0 && (
                      <p style={{ margin: '5px 0', fontSize: '14px' }}>
                        <strong>Total conta:</strong> R$ {Number(mesa.total_conta).toFixed(2)}
                      </p>
                    )}

                    {temContaFechada && (
                      <button
                        onClick={() => pagarContaMesa(mesa.id)}
                        style={{
                          backgroundColor: '#4caf50',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginTop: '10px',
                          width: '100%',
                          fontSize: '14px'
                        }}
                      >
                        ✅ Pagar Conta
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ✅ COMPONENTE DASHBOARD
  const Dashboard = () => {
    if (!dashboardData) return <div>Carregando dashboard...</div>;

    const dados = dashboardData.data || dashboardData || {};
    
    return (
      <div>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>📊 Dashboard</h2>
        
        <ControleExpediente />
        
        <div style={estilos.grid}>
          <div style={estilos.statCard}>
            <h3 style={{ color: '#007bff', margin: '0 0 10px 0' }}>🛒 Pedidos Hoje</h3>
            <p style={{ fontSize: '2em', fontWeight: 'bold', margin: 0 }}>
              {dados.pedidos_hoje || 0}
            </p>
          </div>
          
          <div style={estilos.statCard}>
            <h3 style={{ color: '#28a745', margin: '0 0 10px 0' }}>💰 Vendas Hoje</h3>
            <p style={{ fontSize: '2em', fontWeight: 'bold', margin: 0 }}>
              R$ {Number(dados.vendas_hoje || 0).toFixed(2)}
            </p>
          </div>
          
          <div style={estilos.statCard}>
            <h3 style={{ color: '#6f42c1', margin: '0 0 10px 0' }}>🍔 Produtos</h3>
            <p style={{ fontSize: '2em', fontWeight: 'bold', margin: 0 }}>
              {dados.total_produtos || 0}
            </p>
          </div>
          
          <div style={estilos.statCard}>
            <h3 style={{ color: '#ff6b35', margin: '0 0 10px 0' }}>📂 Categorias</h3>
            <p style={{ fontSize: '2em', fontWeight: 'bold', margin: 0 }}>
              {dados.total_categorias || 0}
            </p>
          </div>
        </div>

        <div style={estilos.card}>
          <h3 style={{ marginBottom: '15px' }}>📈 Estatísticas de Pedidos</h3>
          <div style={estilos.grid}>
            <div style={estilos.statCard}>
              <h4>⏳ Pendentes</h4>
              <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#856404' }}>
                {dados.pedidos_pendentes || 0}
              </p>
            </div>
            <div style={estilos.statCard}>
              <h4>👨‍🍳 Preparando</h4>
              <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#004085' }}>
                {dados.pedidos_preparando || 0}
              </p>
            </div>
            <div style={estilos.statCard}>
              <h4>✅ Prontos</h4>
              <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#155724' }}>
                {dados.pedidos_prontos || 0}
              </p>
            </div>
            <div style={estilos.statCard}>
              <h4>🎯 Entregues</h4>
              <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#0c5460' }}>
                {dados.pedidos_entregues || 0}
              </p>
            </div>
          </div>
        </div>

        <Mesas />
      </div>
    );
  };

  // 🎯 RENDERIZAÇÃO PRINCIPAL
  return (
    <div style={estilos.container}>
      {/* Header */}
      <header style={estilos.header}>
        <h1 style={{ margin: 0 }}>🍔 {configuracoes.nome_estabelecimento} - Painel Admin</h1>
        <p style={{ margin: '5px 0 0 0', opacity: 0.8 }}>Sistema de Gerenciamento</p>
        
        <nav style={estilos.nav}>
          <button
            onClick={() => setPaginaAtiva('dashboard')}
            style={paginaAtiva === 'dashboard' ? estilos.navButtonAtivo : estilos.navButton}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setPaginaAtiva('pedidos')}
            style={paginaAtiva === 'pedidos' ? estilos.navButtonAtivo : estilos.navButton}
          >
            📦 Pedidos
          </button>
          <button
            onClick={() => setPaginaAtiva('produtos')}
            style={paginaAtiva === 'produtos' ? estilos.navButtonAtivo : estilos.navButton}
          >
            🍔 Produtos
          </button>
          <button
            onClick={() => setPaginaAtiva('mesas')}
            style={paginaAtiva === 'mesas' ? estilos.navButtonAtivo : estilos.navButton}
          >
            🪑 Mesas
          </button>
        </nav>
      </header>

      {/* Conteúdo Principal */}
      <main style={estilos.main}>
        {carregando ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p>Carregando...</p>
          </div>
        ) : (
          <>
            {paginaAtiva === 'dashboard' && <Dashboard />}
            {paginaAtiva === 'pedidos' && <Pedidos />}
            {paginaAtiva === 'produtos' && <Produtos />}
            {paginaAtiva === 'mesas' && <Mesas />}
          </>
        )}
      </main>

      {/* MODAIS */}
      <ModalProduto />
      <ModalConfiguracoes
        configuracoes={configuracoes}
        mostrarModalConfig={mostrarModalConfig}
        setMostrarModalConfig={setMostrarModalConfig}
        atualizarConfiguracoes={atualizarConfiguracoes}
        estilos={estilos}
      />
      <ModalRelatorioDia />
    </div>
  );
}

export default App;