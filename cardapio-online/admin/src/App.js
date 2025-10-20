import React, { useState, useEffect } from 'react';

// =========================================================================
// CONFIGURAÇÃO E FUNÇÕES AUXILIARES (NO TOPO DO ARQUIVO)
// =========================================================================

// ✅ FUNÇÃO fetchAPI CORRIGIDA PARA SANCTUM
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const defaultOptions = {
      credentials: 'include', // 🔥 IMPORTANTE para cookies
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(`http://localhost:8000/api${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`❌ Erro na requisição para ${endpoint}:`, error);
    throw error;
  }
};

// ✅ FUNÇÃO PARA OBTER CSRF TOKEN
const getCsrfToken = async () => {
  try {
    console.log('🔐 Obtendo CSRF token...');
    const response = await fetch('http://localhost:8000/sanctum/csrf-cookie', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error('Falha ao obter CSRF token');
    }
    
    console.log('✅ CSRF token obtido com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao obter CSRF token:', error);
    throw error;
  }
};

// ✅ FUNÇÃO renderSafe (PARA EVITAR ERROS DE VALORES NULOS)
const renderSafe = (value, defaultValue = '') => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  return value;
};

// 🎨 ESTILOS GLOBAIS
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
  buttonInfo: { backgroundColor: '#17a2b8', color: 'white' },
  formGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' },
  input: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', boxSizing: 'border-box' },
  smallText: { color: '#666', fontSize: '12px', marginTop: '4px' }
};

// =========================================================================
// 🔐 COMPONENTE DA TELA DE LOGIN - CORRIGIDO
// =========================================================================
const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      console.log('1. Obtendo CSRF token...');
      
      // ✅ PRIMEIRO: Pega o CSRF cookie (ESSENCIAL)
      await getCsrfToken();
      
      console.log('2. Fazendo login...');
      
      // ✅ DEPOIS: Faz o login
      const response = await fetchAPI('/login', {
        method: 'POST',
        body: { email, password }
      });

      if (response.success) {
        onLoginSuccess(response.user);
      } else {
        throw new Error(response.message || 'Login falhou');
      }
    } catch (err) {
      setError(err.message || 'Email ou senha inválidos. Tente novamente.');
      console.error('Falha no login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
      <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', width: '400px' }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#1a237e' }}>🍔 Painel Admin</h1>
        <p style={{ marginBottom: '30px', color: '#666' }}>Por favor, faça o login para continuar</p>
        <form onSubmit={handleLogin}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" required style={{ width: '100%', padding: '12px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
          {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '4px', backgroundColor: '#1a237e', color: 'white', fontSize: '16px', cursor: 'pointer' }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// ✅ COMPONENTES DE PÁGINA E MODAIS (MANTIDOS IGUAIS)
// =========================================================================

const Pedidos = ({ pedidos, setPedidoSelecionado, pedidoSelecionado, atualizarStatusPedido, cancelarPedido, imprimirPedidoController, configuracoes }) => {
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
          </div>
        ) : (
          <table style={estilos.table}>
            <thead>
              <tr>
                <th style={estilos.th}>ID</th><th style={estilos.th}>Mesa</th><th style={estilos.th}>Garçom</th><th style={estilos.th}>Total</th><th style={estilos.th}>Status</th><th style={estilos.th}>Data</th><th style={estilos.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(pedido => (
                <tr key={pedido.id}>
                  <td style={estilos.td}>#{renderSafe(pedido.id)}</td>
                  <td style={estilos.td}>Mesa {renderSafe(pedido.mesa?.numero || pedido.mesa_id)}</td>
                  <td style={estilos.td}>{renderSafe(pedido.garcom_nome)}</td>
                  <td style={estilos.td}>R$ {Number(renderSafe(pedido.total, 0)).toFixed(2)}</td>
                  <td style={estilos.td}><span style={getBadgeStyle(renderSafe(pedido.status))}>{renderSafe(pedido.status)}</span></td>
                  <td style={estilos.td}>{pedido.created_at ? new Date(pedido.created_at).toLocaleString('pt-BR') : 'N/A'}</td>
                  <td style={estilos.td}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <button onClick={() => setPedidoSelecionado(pedido)} style={{ ...estilos.button, backgroundColor: '#6c757d', color: 'white' }}>👀 Ver</button>
                      {pedido.status !== 'entregue' && pedido.status !== 'cancelado' && (
                        <>
                          {pedido.status !== 'preparando' && <button onClick={() => atualizarStatusPedido(pedido.id, 'preparando')} style={{ ...estilos.button, ...estilos.buttonWarning }}>🍳 Preparar</button>}
                          {pedido.status !== 'pronto' && <button onClick={() => atualizarStatusPedido(pedido.id, 'pronto')} style={{ ...estilos.button, ...estilos.buttonSuccess }}>✅ Pronto</button>}
                          <button onClick={() => atualizarStatusPedido(pedido.id, 'entregue')} style={{ ...estilos.button, ...estilos.buttonPrimary }}>🎯 Entregar</button>
                          <button onClick={() => cancelarPedido(pedido.id)} style={{ ...estilos.button, ...estilos.buttonDanger }}>❌ Cancelar</button>
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

      {pedidoSelecionado && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Detalhes do Pedido #{renderSafe(pedidoSelecionado.id)}</h3>
              <button onClick={() => setPedidoSelecionado(null)} style={{ backgroundColor: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <p><strong>Mesa:</strong> {renderSafe(pedidoSelecionado.mesa?.numero || pedidoSelecionado.mesa_id)}</p>
            <p><strong>Garçom:</strong> {renderSafe(pedidoSelecionado.garcom_nome)}</p>
            <p><strong>Total:</strong> R$ {Number(renderSafe(pedidoSelecionado.total, 0)).toFixed(2)}</p>
            <p><strong>Status:</strong> <span style={getBadgeStyle(renderSafe(pedidoSelecionado.status))}>{renderSafe(pedidoSelecionado.status)}</span></p>
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
            ) : <p>Nenhum item encontrado</p>}
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => imprimirPedidoController(pedidoSelecionado, 'termica', configuracoes)} style={{ ...estilos.button, ...estilos.buttonPrimary }}>🖨️ 58mm (Termica)</button>
              <button onClick={() => imprimirPedidoController(pedidoSelecionado, 'compacto', configuracoes)} style={{ ...estilos.button, ...estilos.buttonInfo }}>📄 80mm (Compacto)</button>
              <button onClick={() => setPedidoSelecionado(null)} style={{ ...estilos.button, backgroundColor: '#6c757d', color: 'white' }}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Produtos = ({ produtos, abrirModalProduto, excluirProduto }) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#333' }}>🍔 Produtos</h2>
        <button onClick={() => abrirModalProduto()} style={{ ...estilos.button, ...estilos.buttonSuccess, padding: '10px 20px' }}>➕ Novo Produto</button>
      </div>
      <div style={estilos.card}>
        {produtos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>Nenhum produto cadastrado.</p>
          </div>
        ) : (
          <table style={estilos.table}>
            <thead>
              <tr>
                <th style={estilos.th}>Nome</th><th style={estilos.th}>Descrição</th><th style={estilos.th}>Preço</th><th style={estilos.th}>Categoria</th><th style={estilos.th}>Disponível</th><th style={estilos.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map(produto => (
                <tr key={produto.id}>
                  <td style={estilos.td}><div style={{ fontWeight: 'bold' }}>{renderSafe(produto.nome)}</div></td>
                  <td style={estilos.td}>{renderSafe(produto.descricao, '-')}</td>
                  <td style={estilos.td}><strong>R$ {Number(renderSafe(produto.preco, 0)).toFixed(2)}</strong></td>
                  <td style={estilos.td}>{renderSafe(produto.categoria?.nome, 'Sem categoria')}</td>
                  <td style={estilos.td}><span style={{ ...estilos.badge, ...(produto.disponivel ? estilos.badgeSuccess : estilos.badgeDanger) }}>{produto.disponivel ? '✅ Sim' : '❌ Não'}</span></td>
                  <td style={estilos.td}>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      <button onClick={() => abrirModalProduto(produto)} style={{ ...estilos.button, ...estilos.buttonPrimary }}>✏️ Editar</button>
                      <button onClick={() => excluirProduto(produto.id)} style={{ ...estilos.button, ...estilos.buttonDanger }}>🗑️ Excluir</button>
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

const Mesas = ({ mesas, pagarContaMesa, liberarMesa }) => {
  const getCorMesa = (mesa) => {
    if (mesa.status_pagamento === 'paga') return '#4caf50';
    if (mesa.status_pagamento === 'fechada') return '#ff9800';
    if (mesa.status === 'ocupada') return '#f44336';
    return '#4caf50';
  };

  const getTextoStatusMesa = (mesa) => {
    if (mesa.status_pagamento === 'paga') return 'Paga';
    if (mesa.status_pagamento === 'fechada') return 'Fechada';
    if (mesa.status === 'ocupada') return 'Ocupada';
    return 'Livre';
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>🪑 Mesas</h2>
      <div style={estilos.card}>
        {mesas.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Nenhuma mesa carregada</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            {mesas.map(mesa => {
              const corMesa = getCorMesa(mesa);
              const textoStatus = getTextoStatusMesa(mesa);
              return (
                <div key={mesa.id} style={{ border: `2px solid ${corMesa}`, borderRadius: '8px', padding: '15px', backgroundColor: `${corMesa}15` }}>
                  <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: corMesa }}></span>Mesa {mesa.numero}</h4>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Status:</strong> <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', marginLeft: '8px', backgroundColor: corMesa, color: 'white' }}>{textoStatus}</span></p>
                  {mesa.garcom_nome && <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Garçom:</strong> {mesa.garcom_nome}</p>}
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Pedidos ativos:</strong> {renderSafe(mesa.pedidos_ativos_count || mesa.pedidos_ativos, 0)}</p>
                  {mesa.total_conta > 0 && <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Total conta:</strong> R$ {Number(mesa.total_conta).toFixed(2)}</p>}
                  <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {mesa.status_pagamento === 'fechada' && <button onClick={() => pagarContaMesa(mesa.id)} style={{ ...estilos.button, ...estilos.buttonSuccess }}>✅ Pagar Conta</button>}
                    {mesa.status_pagamento === 'paga' && <button onClick={() => liberarMesa(mesa.id)} style={{ ...estilos.button, ...estilos.buttonInfo }}>🆓 Liberar Mesa</button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = ({ dashboardData, ControleExpediente, MesasComponent }) => {
  if (!dashboardData) return <div style={{ textAlign: 'center', padding: '50px' }}><p>Carregando dashboard...</p></div>;
  const dados = dashboardData || {};
  const estatisticas = {
    pedidosHoje: Number(dados.pedidos_hoje) || 0, vendasHoje: Number(dados.vendas_hoje) || 0, totalProdutos: Number(dados.total_produtos) || 0,
    totalCategorias: Number(dados.total_categorias) || 0, pedidosPendentes: Number(dados.pedidos_pendentes) || 0,
    pedidosPreparando: Number(dados.pedidos_preparando) || 0, pedidosProntos: Number(dados.pedidos_prontos) || 0, pedidosEntregues: Number(dados.pedidos_entregues) || 0
  };
  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>📊 Dashboard</h2>
      <ControleExpediente />
      <div style={estilos.grid}>
        <div style={estilos.statCard}><h3 style={{ color: '#007bff', margin: '0 0 10px 0' }}>🛒 Pedidos Hoje</h3><p style={{ fontSize: '2em', fontWeight: 'bold', margin: 0 }}>{estatisticas.pedidosHoje}</p></div>
        <div style={estilos.statCard}><h3 style={{ color: '#28a745', margin: '0 0 10px 0' }}>💰 Vendas Hoje</h3><p style={{ fontSize: '2em', fontWeight: 'bold', margin: 0 }}>R$ {estatisticas.vendasHoje.toFixed(2)}</p></div>
        <div style={estilos.statCard}><h3 style={{ color: '#6f42c1', margin: '0 0 10px 0' }}>🍔 Produtos</h3><p style={{ fontSize: '2em', fontWeight: 'bold', margin: 0 }}>{estatisticas.totalProdutos}</p></div>
        <div style={estilos.statCard}><h3 style={{ color: '#ff6b35', margin: '0 0 10px 0' }}>📂 Categorias</h3><p style={{ fontSize: '2em', fontWeight: 'bold', margin: 0 }}>{estatisticas.totalCategorias}</p></div>
      </div>
      <div style={estilos.card}>
        <h3 style={{ marginBottom: '15px' }}>📈 Estatísticas de Pedidos</h3>
        <div style={estilos.grid}>
          <div style={estilos.statCard}><h4>⏳ Pendentes</h4><p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#856404' }}>{estatisticas.pedidosPendentes}</p></div>
          <div style={estilos.statCard}><h4>👨‍🍳 Preparando</h4><p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#004085' }}>{estatisticas.pedidosPreparando}</p></div>
          <div style={estilos.statCard}><h4>✅ Prontos</h4><p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#155724' }}>{estatisticas.pedidosProntos}</p></div>
          <div style={estilos.statCard}><h4>🎯 Entregues</h4><p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#0c5460' }}>{estatisticas.pedidosEntregues}</p></div>
        </div>
      </div>
      <MesasComponent />
    </div>
  );
};

const ModalConfiguracoes = ({ mostrar, onClose, form, setForm, onSubmit }) => {
  if (!mostrar) return null;
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '24px' }}>⚙️ Configurações do Sistema</h3>
          <button onClick={onClose} style={{ backgroundColor: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>✕</button>
        </div>
        <form onSubmit={onSubmit}>
          <div style={estilos.formGroup}>
            <label style={estilos.label} htmlFor="nome_estabelecimento">Nome do Estabelecimento:</label>
            <input id="nome_estabelecimento" type="text" name="nome_estabelecimento" value={form.nome_estabelecimento} onChange={handleChange} style={estilos.input} required />
          </div>
          <div style={estilos.formGroup}>
            <label style={estilos.label} htmlFor="telefone">Telefone:</label>
            <input id="telefone" type="text" name="telefone" value={form.telefone} onChange={handleChange} style={estilos.input} placeholder="(11) 99999-9999" />
          </div>
          <div style={estilos.formGroup}>
            <label style={estilos.label} htmlFor="numero_mesas">Número de Mesas:</label>
            <input id="numero_mesas" type="number" name="numero_mesas" min="1" max="50" value={form.numero_mesas} onChange={handleChange} style={estilos.input} required />
            <small style={estilos.smallText}>⚠️ Alterar o número de mesas pode afetar o sistema existente.</small>
          </div>
          <div style={estilos.formGroup}>
            <label style={estilos.label} htmlFor="taxa_servico">Taxa de Serviço (%):</label>
            <input id="taxa_servico" type="number" name="taxa_servico" min="0" max="20" step="0.1" value={form.taxa_servico} onChange={handleChange} style={estilos.input} />
            <small style={estilos.smallText}>Exemplo: 10 para 10% de taxa de serviço.</small>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" style={{ ...estilos.button, ...estilos.buttonSuccess, padding: '12px 24px', fontSize: '16px', flex: 1 }}>💾 Salvar Alterações</button>
            <button type="button" onClick={onClose} style={{ ...estilos.button, backgroundColor: '#6c757d', color: 'white', padding: '12px 24px', fontSize: '16px', flex: 1 }}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ModalProduto = ({ mostrar, onClose, produto, onSubmit, categorias }) => {
  const [form, setForm] = useState({ nome: '', descricao: '', preco: '', categoria_id: '', disponivel: true, imagem: '' });

  useEffect(() => {
    if (produto) {
      setForm({
        nome: produto.nome || '',
        descricao: produto.descricao || '',
        preco: produto.preco || '',
        categoria_id: produto.categoria_id || '',
        disponivel: produto.disponivel !== undefined ? produto.disponivel : true,
        imagem: produto.imagem || ''
      });
    } else {
      setForm({ nome: '', descricao: '', preco: '', categoria_id: '', disponivel: true, imagem: '' });
    }
  }, [produto, mostrar]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!mostrar) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '24px' }}>{produto ? '✏️ Editar Produto' : '🍔 Novo Produto'}</h3>
          <button onClick={onClose} style={{ backgroundColor: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={estilos.formGroup}>
            <label style={estilos.label} htmlFor="nome">Nome do Produto: *</label>
            <input id="nome" type="text" name="nome" value={form.nome} onChange={handleChange} style={estilos.input} required autoFocus />
          </div>

          <div style={estilos.formGroup}>
            <label style={estilos.label} htmlFor="descricao">Descrição:</label>
            <textarea id="descricao" name="descricao" value={form.descricao} onChange={handleChange} style={{ ...estilos.input, minHeight: '80px', resize: 'vertical' }} />
          </div>

          <div style={estilos.formGroup}>
            <label style={estilos.label} htmlFor="preco">Preço: *</label>
            <input id="preco" type="number" name="preco" value={form.preco} onChange={handleChange} style={estilos.input} required step="0.01" min="0" />
          </div>

          <div style={estilos.formGroup}>
            <label style={estilos.label} htmlFor="categoria_id">Categoria: *</label>
            <select id="categoria_id" name="categoria_id" value={form.categoria_id} onChange={handleChange} style={estilos.input} required>
              <option value="">Selecione uma categoria</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
              ))}
            </select>
          </div>

          <div style={estilos.formGroup}>
            <label style={estilos.label} htmlFor="imagem">URL da Imagem:</label>
            <input id="imagem" type="text" name="imagem" value={form.imagem} onChange={handleChange} style={estilos.input} placeholder="https://exemplo.com/imagem.jpg" />
          </div>

          <div style={estilos.formGroup}>
            <label style={{ ...estilos.label, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input id="disponivel" type="checkbox" name="disponivel" checked={form.disponivel} onChange={handleChange} style={{ width: 'auto' }} />
              Produto Disponível
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" style={{ ...estilos.button, ...estilos.buttonSuccess, padding: '12px 24px', fontSize: '16px', flex: 1 }}>
              {produto ? '💾 Atualizar' : '➕ Criar'}
            </button>
            <button type="button" onClick={onClose} style={{ ...estilos.button, backgroundColor: '#6c757d', color: 'white', padding: '12px 24px', fontSize: '16px', flex: 1 }}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// ✅ COMPONENTE PRINCIPAL APP - CORRIGIDO
// =========================================================================
const App = () => {
  const [usuario, setUsuario] = useState(null);
  const [paginaAtiva, setPaginaAtiva] = useState('dashboard');
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [mostrarModalConfig, setMostrarModalConfig] = useState(false);
  const [mostrarModalProduto, setMostrarModalProduto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [configuracoes, setConfiguracoes] = useState({ nome_estabelecimento: 'Meu Restaurante', telefone: '', numero_mesas: 10, taxa_servico: 0 });

  // ✅ INICIALIZAÇÃO - OBTER CSRF TOKEN AO CARREGAR
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🔄 Inicializando aplicação...');
        await getCsrfToken();
        
        // Verificar se já está logado
        const token = localStorage.getItem('auth_token');
        if (token) {
          console.log('🔑 Token encontrado, verificando autenticação...');
          await verificarAutenticacao();
        }
      } catch (error) {
        console.error('❌ Erro na inicialização:', error);
      }
    };

    initializeApp();
  }, []);

  // ✅ VERIFICAR AUTENTICAÇÃO
  const verificarAutenticacao = async () => {
    try {
      const response = await fetchAPI('/user');
      if (response.user) {
        setUsuario(response.user);
        await carregarDados();
      }
    } catch (error) {
      console.error('❌ Falha na verificação de autenticação:', error);
      localStorage.removeItem('auth_token');
      setUsuario(null);
    }
  };

  // ✅ LOGIN CORRIGIDO
  const handleLogin = async (userData) => {
    setUsuario(userData);
    localStorage.setItem('auth_token', userData.token || 'demo-token');
    await carregarDados();
  };

  // ✅ LOGOUT
  const handleLogout = async () => {
    try {
      await fetchAPI('/logout', { method: 'POST' });
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setUsuario(null);
      setPedidos([]);
      setProdutos([]);
      setMesas([]);
      setDashboardData(null);
    }
  };

  // ✅ CARREGAR DADOS
  const carregarDados = async () => {
    try {
      console.log('📦 Carregando dados...');
      const [pedidosRes, produtosRes, categoriasRes, mesasRes, dashboardRes] = await Promise.all([
        fetchAPI('/pedidos').catch(() => ({ pedidos: [] })),
        fetchAPI('/produtos').catch(() => ({ produtos: [] })),
        fetchAPI('/categorias').catch(() => ({ categorias: [] })),
        fetchAPI('/mesas').catch(() => ({ mesas: [] })),
        fetchAPI('/dashboard').catch(() => null)
      ]);

      setPedidos(pedidosRes.pedidos || []);
      setProdutos(produtosRes.produtos || []);
      setCategorias(categoriasRes.categorias || []);
      setMesas(mesasRes.mesas || []);
      setDashboardData(dashboardRes);
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    }
  };

  // ✅ ATUALIZAR STATUS DO PEDIDO
  const atualizarStatusPedido = async (pedidoId, novoStatus) => {
    try {
      const response = await fetchAPI(`/pedidos/${pedidoId}/status`, {
        method: 'PUT',
        body: { status: novoStatus }
      });

      if (response.success) {
        setPedidos(pedidos.map(pedido => 
          pedido.id === pedidoId ? { ...pedido, status: novoStatus } : pedido
        ));
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do pedido: ' + error.message);
    }
  };

  // ✅ CANCELAR PEDIDO
  const cancelarPedido = async (pedidoId) => {
    if (!confirm('Tem certeza que deseja cancelar este pedido?')) return;
    
    try {
      const response = await fetchAPI(`/pedidos/${pedidoId}/cancelar`, {
        method: 'PUT'
      });

      if (response.success) {
        setPedidos(pedidos.map(pedido => 
          pedido.id === pedidoId ? { ...pedido, status: 'cancelado' } : pedido
        ));
      }
    } catch (error) {
      console.error('❌ Erro ao cancelar pedido:', error);
      alert('Erro ao cancelar pedido: ' + error.message);
    }
  };

  // ✅ IMPRIMIR PEDIDO
  const imprimirPedidoController = async (pedido, tipoImpressao, config) => {
    try {
      const response = await fetchAPI(`/pedidos/${pedido.id}/imprimir`, {
        method: 'POST',
        body: { tipo_impressao: tipoImpressao }
      });

      if (response.success) {
        alert(`✅ Pedido #${pedido.id} enviado para impressão!`);
      } else {
        throw new Error(response.message || 'Erro ao imprimir');
      }
    } catch (error) {
      console.error('❌ Erro ao imprimir pedido:', error);
      alert('Erro ao imprimir pedido: ' + error.message);
    }
  };

  // ✅ PAGAR CONTA DA MESA
  const pagarContaMesa = async (mesaId) => {
    try {
      const response = await fetchAPI(`/mesas/${mesaId}/pagar`, {
        method: 'PUT'
      });

      if (response.success) {
        setMesas(mesas.map(mesa => 
          mesa.id === mesaId ? { ...mesa, status_pagamento: 'paga' } : mesa
        ));
        await carregarDados();
      }
    } catch (error) {
      console.error('❌ Erro ao pagar conta:', error);
      alert('Erro ao pagar conta: ' + error.message);
    }
  };

  // ✅ LIBERAR MESA
  const liberarMesa = async (mesaId) => {
    try {
      const response = await fetchAPI(`/mesas/${mesaId}/liberar`, {
        method: 'PUT'
      });

      if (response.success) {
        setMesas(mesas.map(mesa => 
          mesa.id === mesaId ? { ...mesa, status: 'livre', status_pagamento: null, garcom_nome: null, total_conta: 0 } : mesa
        ));
        await carregarDados();
      }
    } catch (error) {
      console.error('❌ Erro ao liberar mesa:', error);
      alert('Erro ao liberar mesa: ' + error.message);
    }
  };

  // ✅ SALVAR/EDITAR PRODUTO
  const salvarProduto = async (dadosProduto) => {
    try {
      const endpoint = produtoEditando ? `/produtos/${produtoEditando.id}` : '/produtos';
      const method = produtoEditando ? 'PUT' : 'POST';

      const response = await fetchAPI(endpoint, {
        method,
        body: dadosProduto
      });

      if (response.success) {
        await carregarDados();
        setMostrarModalProduto(false);
        setProdutoEditando(null);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar produto:', error);
      alert('Erro ao salvar produto: ' + error.message);
    }
  };

  // ✅ EXCLUIR PRODUTO
  const excluirProduto = async (produtoId) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    
    try {
      const response = await fetchAPI(`/produtos/${produtoId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        setProdutos(produtos.filter(produto => produto.id !== produtoId));
      }
    } catch (error) {
      console.error('❌ Erro ao excluir produto:', error);
      alert('Erro ao excluir produto: ' + error.message);
    }
  };

  // ✅ ABRIR MODAL PRODUTO
  const abrirModalProduto = (produto = null) => {
    setProdutoEditando(produto);
    setMostrarModalProduto(true);
  };

  // ✅ CONTROLE EXPEDIENTE
  const ControleExpediente = () => (
    <div style={estilos.card}>
      <h3 style={{ marginBottom: '15px' }}>🕒 Controle de Expediente</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button style={{ ...estilos.button, ...estilos.buttonSuccess }}>🟢 Iniciar Expediente</button>
        <button style={{ ...estilos.button, ...estilos.buttonWarning }}>🟡 Pausar Expediente</button>
        <button style={{ ...estilos.button, ...estilos.buttonDanger }}>🔴 Encerrar Expediente</button>
        <button style={{ ...estilos.button, ...estilos.buttonInfo }}>📊 Relatório do Dia</button>
      </div>
    </div>
  );

  // ✅ RENDERIZAÇÃO CONDICIONAL
  if (!usuario) {
    return <LoginPage onLoginSuccess={handleLogin} />;
  }

  return (
    <div style={estilos.container}>
      {/* HEADER */}
      <header style={estilos.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px' }}>🍔 {configuracoes.nome_estabelecimento || 'Painel Admin'}</h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.8 }}>Bem-vindo, {usuario.name || 'Administrador'}!</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setMostrarModalConfig(true)} style={{ ...estilos.button, ...estilos.buttonInfo }}>⚙️ Configurações</button>
            <button onClick={handleLogout} style={{ ...estilos.button, ...estilos.buttonDanger }}>🚪 Sair</button>
          </div>
        </div>
        
        <nav style={estilos.nav}>
          {['dashboard', 'pedidos', 'produtos', 'mesas'].map(pagina => (
            <button key={pagina} onClick={() => setPaginaAtiva(pagina)} style={paginaAtiva === pagina ? estilos.navButtonAtivo : estilos.navButton}>
              {pagina === 'dashboard' && '📊 Dashboard'}
              {pagina === 'pedidos' && '📦 Pedidos'}
              {pagina === 'produtos' && '🍔 Produtos'}
              {pagina === 'mesas' && '🪑 Mesas'}
            </button>
          ))}
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <main style={estilos.main}>
        {paginaAtiva === 'dashboard' && <Dashboard dashboardData={dashboardData} ControleExpediente={ControleExpediente} MesasComponent={() => <Mesas mesas={mesas} pagarContaMesa={pagarContaMesa} liberarMesa={liberarMesa} />} />}
        {paginaAtiva === 'pedidos' && <Pedidos pedidos={pedidos} setPedidoSelecionado={setPedidoSelecionado} pedidoSelecionado={pedidoSelecionado} atualizarStatusPedido={atualizarStatusPedido} cancelarPedido={cancelarPedido} imprimirPedidoController={imprimirPedidoController} configuracoes={configuracoes} />}
        {paginaAtiva === 'produtos' && <Produtos produtos={produtos} abrirModalProduto={abrirModalProduto} excluirProduto={excluirProduto} />}
        {paginaAtiva === 'mesas' && <Mesas mesas={mesas} pagarContaMesa={pagarContaMesa} liberarMesa={liberarMesa} />}
      </main>

      {/* MODAIS */}
      <ModalConfiguracoes mostrar={mostrarModalConfig} onClose={() => setMostrarModalConfig(false)} form={configuracoes} setForm={setConfiguracoes} onSubmit={() => {}} />
      <ModalProduto mostrar={mostrarModalProduto} onClose={() => { setMostrarModalProduto(false); setProdutoEditando(null); }} produto={produtoEditando} onSubmit={salvarProduto} categorias={categorias} />
    </div>
  );
};

export default App;