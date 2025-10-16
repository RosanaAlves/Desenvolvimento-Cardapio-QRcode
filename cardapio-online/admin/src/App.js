import React, { useState, useEffect } from 'react';

// Configuração da API
const API_BASE_URL = 'http://localhost:8000/api';

// Função para fetch com tratamento de erro
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // ✅ CORREÇÃO: Verificar se a resposta tem success: true
    if (data.success === false) {
      throw new Error(data.message || 'Erro na API');
    }

    return data;
  } catch (error) {
    console.error('❌ Erro na API:', error);
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
  
  // 🔥 NOVOS ESTADOS
  const [configuracoes, setConfiguracoes] = useState(null);
  const [expedienteStatus, setExpedienteStatus] = useState(null);
  const [mostrarModalConfig, setMostrarModalConfig] = useState(false);
  const [mostrarModalExpediente, setMostrarModalExpediente] = useState(false);

  // ✅ CORREÇÃO: Carregar dados do dashboard
  const carregarDashboard = async () => {
    try {
      setCarregando(true);
      const data = await fetchAPI('/admin/dashboard');
      setDashboardData(data.data || data); // ✅ Compatível com ambas as estruturas
    } catch (erro) {
      console.error('Erro ao carregar dashboard:', erro);
      alert('Erro ao carregar dashboard');
    } finally {
      setCarregando(false);
    }
  };

  // ✅ CORREÇÃO: Carregar pedidos
  const carregarPedidos = async () => {
    try {
      setCarregando(true);
      const data = await fetchAPI('/admin/pedidos');
      setPedidos(data.data || data || []); // ✅ Compatível com diferentes estruturas
    } catch (erro) {
      console.error('Erro ao carregar pedidos:', erro);
      setPedidos([]); // ✅ Define array vazio em caso de erro
    } finally {
      setCarregando(false);
    }
  };

  // ✅ CORREÇÃO: Carregar produtos
  const carregarProdutos = async () => {
    try {
      setCarregando(true);
      const data = await fetchAPI('/admin/produtos');
      setProdutos(data.data || data || []); // ✅ Compatível com diferentes estruturas
    } catch (erro) {
      console.error('Erro ao carregar produtos:', erro);
      setProdutos([]); // ✅ Define array vazio em caso de erro
    } finally {
      setCarregando(false);
    }
  };

  // ✅ CORREÇÃO: Carregar mesas
  const carregarMesas = async () => {
    try {
      setCarregando(true);
      const data = await fetchAPI('/garcom/mesas/status'); // ✅ Usar rota do garçom que existe
      setMesas(data.data || data || []); // ✅ Compatível com diferentes estruturas
    } catch (erro) {
      console.error('Erro ao carregar mesas:', erro);
      setMesas([]); // ✅ Define array vazio em caso de erro
    } finally {
      setCarregando(false);
    }
  };

  // 🔥 NOVO: Carregar configurações
  const carregarConfiguracoes = async () => {
    try {
      const data = await fetchAPI('/admin/configuracoes');
      setConfiguracoes(data.data);
    } catch (erro) {
      console.error('Erro ao carregar configurações:', erro);
      // Configurações padrão caso não consiga carregar
      setConfiguracoes({
        nome_estabelecimento: "Jetro's Lanches",
        numero_mesas: 10,
        taxa_servico: 0,
        expediente_aberto: false
      });
    }
  };

  // 🔥 NOVO: Carregar status do expediente
  const carregarExpedienteStatus = async () => {
    try {
      const data = await fetchAPI('/admin/expediente/status');
      setExpedienteStatus(data.data);
    } catch (erro) {
      console.error('Erro ao carregar status do expediente:', erro);
    }
  };

  // 🔥 NOVO: Atualizar configurações
  const atualizarConfiguracoes = async (novasConfigs) => {
    try {
      const data = await fetchAPI('/admin/configuracoes', {
        method: 'PUT',
        body: JSON.stringify(novasConfigs)
      });
      
      setConfiguracoes(data.data);
      alert('Configurações atualizadas com sucesso!');
      setMostrarModalConfig(false);
    } catch (erro) {
      console.error('Erro ao atualizar configurações:', erro);
      alert('Erro ao atualizar configurações');
    }
  };

  // 🔥 NOVO: Abrir expediente
  const abrirExpediente = async () => {
    try {
      await fetchAPI('/admin/expediente/abrir', {
        method: 'POST'
      });
      
      alert('Expediente aberto com sucesso!');
      carregarExpedienteStatus();
      carregarDashboard();
    } catch (erro) {
      console.error('Erro ao abrir expediente:', erro);
      alert(erro.message || 'Erro ao abrir expediente');
    }
  };

  // 🔥 NOVO: Fechar expediente
  const fecharExpediente = async () => {
    try {
      const data = await fetchAPI('/admin/expediente/fechar', {
        method: 'POST'
      });
      
      alert('Expediente fechado com sucesso!');
      setMostrarModalExpediente(true);
      carregarExpedienteStatus();
      carregarDashboard();
    } catch (erro) {
      console.error('Erro ao fechar expediente:', erro);
      alert(erro.message || 'Erro ao fechar expediente');
    }
  };

  // 🔥 NOVO: Reiniciar sistema
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
      alert('Erro ao reiniciar sistema');
    }
  };

  // ✅ CORREÇÃO: Atualizar status do pedido
  const atualizarStatusPedido = async (pedidoId, novoStatus) => {
    try {
      await fetchAPI(`/admin/pedidos/${pedidoId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: novoStatus })
      });
      
      alert(`Pedido ${pedidoId} atualizado para: ${novoStatus}`);
      carregarPedidos(); // Recarregar lista
    } catch (erro) {
      console.error('Erro ao atualizar pedido:', erro);
      alert('Erro ao atualizar pedido');
    }
  };

  // ✅ CORREÇÃO: Pagar conta da mesa
  const pagarContaMesa = async (mesaId) => {
    try {
      await fetchAPI(`/garcom/mesas/${mesaId}/pagar-conta`, { // ✅ Usar rota do garçom
        method: 'POST'
      });
      
      alert(`Conta da mesa ${mesaId} paga com sucesso!`);
      carregarMesas();
      carregarDashboard();
    } catch (erro) {
      console.error('Erro ao pagar conta:', erro);
      alert('Erro ao pagar conta');
    }
  };

  // ✅ CORREÇÃO: Carregar dados quando mudar de página
  useEffect(() => {
    switch (paginaAtiva) {
      case 'dashboard':
        carregarDashboard();
        carregarMesas();
        carregarExpedienteStatus();
        carregarConfiguracoes();
        break;
      case 'pedidos':
        carregarPedidos();
        break;
      case 'produtos':
        carregarProdutos();
        break;
      case 'mesas':
        carregarMesas();
        break;
    }
  }, [paginaAtiva]);

  // Estilos
  const estilos = {
    container: {
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    },
    header: {
      backgroundColor: '#1a237e',
      color: 'white',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    nav: {
      display: 'flex',
      gap: '10px',
      marginTop: '15px',
      flexWrap: 'wrap'
    },
    navButton: {
      backgroundColor: 'transparent',
      color: 'white',
      border: '1px solid white',
      padding: '10px 20px',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    navButtonAtivo: {
      backgroundColor: 'white',
      color: '#1a237e',
      border: '1px solid white',
      padding: '10px 20px',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold'
    },
    main: {
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      textAlign: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '14px'
    },
    th: {
      backgroundColor: '#f8f9fa',
      padding: '12px',
      textAlign: 'left',
      borderBottom: '2px solid #dee2e6',
      fontWeight: 'bold'
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #dee2e6'
    },
    badge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    badgePendente: { backgroundColor: '#fff3cd', color: '#856404' },
    badgePreparando: { backgroundColor: '#cce7ff', color: '#004085' },
    badgePronto: { backgroundColor: '#d4edda', color: '#155724' },
    badgeEntregue: { backgroundColor: '#d1ecf1', color: '#0c5460' },
    badgeSuccess: { backgroundColor: '#d4edda', color: '#155724' },
    badgeWarning: { backgroundColor: '#fff3cd', color: '#856404' },
    badgeDanger: { backgroundColor: '#f8d7da', color: '#721c24' },
    button: {
      padding: '6px 12px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      margin: '2px'
    },
    buttonPrimary: { backgroundColor: '#007bff', color: 'white' },
    buttonSuccess: { backgroundColor: '#28a745', color: 'white' },
    buttonWarning: { backgroundColor: '#ffc107', color: '#212529' },
    buttonDanger: { backgroundColor: '#dc3545', color: 'white' },
    buttonInfo: { backgroundColor: '#17a2b8', color: 'white' }
  };

  // 🔥 NOVO: Componente de Controle de Expediente
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
            onClick={() => setMostrarModalConfig(true)}
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

  // 🔥 NOVO: Modal de Configurações
  const ModalConfiguracoes = () => {
    const [formData, setFormData] = useState(configuracoes || {});

    useEffect(() => {
      setFormData(configuracoes || {});
    }, [configuracoes]);

    const handleSubmit = (e) => {
      e.preventDefault();
      atualizarConfiguracoes(formData);
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
                value={formData.nome_estabelecimento || ''}
                onChange={(e) => setFormData({...formData, nome_estabelecimento: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                required
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
                value={formData.numero_mesas || 10}
                onChange={(e) => setFormData({...formData, numero_mesas: parseInt(e.target.value)})}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                required
              />
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
                value={formData.taxa_servico || 0}
                onChange={(e) => setFormData({...formData, taxa_servico: parseFloat(e.target.value)})}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Telefone:
              </label>
              <input
                type="text"
                value={formData.telefone || ''}
                onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                type="submit"
                style={{ ...estilos.button, ...estilos.buttonSuccess, padding: '10px 20px' }}
              >
                💾 Salvar Configurações
              </button>
              <button
                type="button"
                onClick={() => setMostrarModalConfig(false)}
                style={{ ...estilos.button, backgroundColor: '#6c757d', color: 'white', padding: '10px 20px' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // 🔥 NOVO: Modal de Relatório do Dia
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

  // ✅ CORREÇÃO: Componente do Dashboard
  const Dashboard = () => {
    if (!dashboardData) return <div>Carregando dashboard...</div>;

    // ✅ CORREÇÃO: Dados padrão para evitar erros
    const dados = dashboardData.data || dashboardData || {};
    
    return (
      <div>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>📊 Dashboard</h2>
        
        {/* 🔥 NOVO: Controle de Expediente */}
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
          <h3 style={{ marginBottom: '15px' }}>🪑 Mesas Atuais</h3>
          {mesas.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              Nenhuma mesa carregada
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              {mesas.map(mesa => (
                <div key={mesa.id} style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: mesa.status === 'ocupada' ? '#fff3cd' : '#f8f9fa'
                }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>Mesa {mesa.numero}</h4>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    <strong>Status:</strong> 
                    <span style={{
                      ...estilos.badge,
                      ...(mesa.status === 'livre' || mesa.status === 'disponivel' ? estilos.badgeSuccess : 
                           mesa.status === 'ocupada' ? estilos.badgeWarning : 
                           estilos.badgeDanger)
                    }}>
                      {mesa.status}
                    </span>
                  </p>
                  {mesa.garcom_nome && (
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>
                      <strong>Garçom:</strong> {mesa.garcom_nome}
                    </p>
                  )}
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    <strong>Pagamento:</strong> 
                    <span style={{
                      ...estilos.badge,
                      ...(mesa.status_pagamento === 'aberta' ? estilos.badgeWarning : 
                           mesa.status_pagamento === 'fechada' ? estilos.badgeDanger : 
                           estilos.badgeSuccess)
                    }}>
                      {mesa.status_pagamento || 'aberta'}
                    </span>
                  </p>
                  {mesa.status_pagamento === 'fechada' && (
                    <button
                      onClick={() => pagarContaMesa(mesa.id)}
                      style={{ ...estilos.button, ...estilos.buttonSuccess, marginTop: '10px' }}
                    >
                      ✅ Marcar como Paga
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ✅ CORREÇÃO: Componente de Pedidos
  const Pedidos = () => {
    const getBadgeStyle = (status) => {
      switch (status) {
        case 'pendente': return { ...estilos.badge, ...estilos.badgePendente };
        case 'preparando': return { ...estilos.badge, ...estilos.badgePreparando };
        case 'pronto': return { ...estilos.badge, ...estilos.badgePronto };
        case 'entregue': return { ...estilos.badge, ...estilos.badgeEntregue };
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
                    <td style={estilos.td}>Mesa {pedido.mesa_id || 'N/A'}</td>
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
                      <button
                        onClick={() => setPedidoSelecionado(pedido)}
                        style={{ ...estilos.button, backgroundColor: '#6c757d', color: 'white' }}
                      >
                        👀 Ver
                      </button>
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
              
              <p><strong>Mesa:</strong> {pedidoSelecionado.mesa_id || 'N/A'}</p>
              <p><strong>Garçom:</strong> {pedidoSelecionado.garcom_nome || 'N/A'}</p>
              <p><strong>Total:</strong> R$ {Number(pedidoSelecionado.total || 0).toFixed(2)}</p>
              <p><strong>Status:</strong> {pedidoSelecionado.status || 'pendente'}</p>
              <p><strong>Data:</strong> {pedidoSelecionado.created_at ? new Date(pedidoSelecionado.created_at).toLocaleString('pt-BR') : 'N/A'}</p>
              
              <h4 style={{ marginTop: '20px' }}>Itens do Pedido:</h4>
              {pedidoSelecionado.itens && pedidoSelecionado.itens.length > 0 ? (
                <ul>
                  {pedidoSelecionado.itens.map((item, index) => (
                    <li key={index}>
                      {item.quantidade}x {item.produto?.nome || 'Produto'} - R$ {Number(item.preco_unitario || 0).toFixed(2)} cada
                      {item.observacoes && ` (${item.observacoes})`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhum item encontrado</p>
              )}
              
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => window.print()}
                  style={{ ...estilos.button, ...estilos.buttonPrimary }}
                >
                  🖨️ Imprimir
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

  // ✅ CORREÇÃO: Componente de Produtos (versão simplificada)
  const Produtos = () => {
    return (
      <div>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>🍔 Produtos</h2>
        
        <div style={estilos.card}>
          {produtos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p>Nenhum produto cadastrado.</p>
              <p style={{ fontSize: '12px', marginTop: '10px' }}>
                Os produtos aparecerão aqui quando forem cadastrados no sistema.
              </p>
            </div>
          ) : (
            <table style={estilos.table}>
              <thead>
                <tr>
                  <th style={estilos.th}>Nome</th>
                  <th style={estilos.th}>Descrição</th>
                  <th style={estilos.th}>Preço</th>
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
                      <span style={{
                        ...estilos.badge,
                        ...(produto.disponivel ? estilos.badgeSuccess : estilos.badgeDanger)
                      }}>
                        {produto.disponivel ? '✅ Sim' : '❌ Não'}
                      </span>
                    </td>
                    <td style={estilos.td}>
                      <button 
                        style={{ ...estilos.button, ...estilos.buttonPrimary }}
                      >
                        ✏️ Editar
                      </button>
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

  // Renderização Principal
  return (
    <div style={estilos.container}>
      {/* Header */}
      <header style={estilos.header}>
        <h1 style={{ margin: 0 }}>🍔 Jetro's Lanches - Painel Admin</h1>
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
            {paginaAtiva === 'mesas' && (
              <div>
                <h2 style={{ marginBottom: '20px', color: '#333' }}>🪑 Mesas</h2>
                <div style={estilos.card}>
                  {mesas.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                      Nenhuma mesa carregada
                    </p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                      {mesas.map(mesa => (
                        <div key={mesa.id} style={{
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          padding: '15px',
                          backgroundColor: mesa.status === 'ocupada' ? '#fff3cd' : '#f8f9fa'
                        }}>
                          <h4 style={{ margin: '0 0 10px 0' }}>Mesa {mesa.numero}</h4>
                          <p style={{ margin: '5px 0', fontSize: '14px' }}>
                            <strong>Status:</strong> 
                            <span style={{
                              ...estilos.badge,
                              ...(mesa.status === 'livre' || mesa.status === 'disponivel' ? estilos.badgeSuccess : 
                                   mesa.status === 'ocupada' ? estilos.badgeWarning : 
                                   estilos.badgeDanger)
                            }}>
                              {mesa.status}
                            </span>
                          </p>
                          {mesa.garcom_nome && (
                            <p style={{ margin: '5px 0', fontSize: '14px' }}>
                              <strong>Garçom:</strong> {mesa.garcom_nome}
                            </p>
                          )}
                          <p style={{ margin: '5px 0', fontSize: '14px' }}>
                            <strong>Pagamento:</strong> 
                            <span style={{
                              ...estilos.badge,
                              ...(mesa.status_pagamento === 'aberta' ? estilos.badgeWarning : 
                                   mesa.status_pagamento === 'fechada' ? estilos.badgeDanger : 
                                   estilos.badgeSuccess)
                            }}>
                              {mesa.status_pagamento || 'aberta'}
                            </span>
                          </p>
                          {mesa.status_pagamento === 'fechada' && (
                            <button
                              onClick={() => pagarContaMesa(mesa.id)}
                              style={{ ...estilos.button, ...estilos.buttonSuccess, marginTop: '10px' }}
                            >
                              ✅ Marcar como Paga
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* 🔥 NOVOS MODAIS */}
      <ModalConfiguracoes />
      <ModalRelatorioDia />
    </div>
  );
}

export default App;