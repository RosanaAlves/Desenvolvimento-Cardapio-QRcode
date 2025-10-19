import React, { useState, useEffect } from 'react';
import axios from 'axios'; // ✅ Importa o Axios

// =========================================================================
// CONFIGURAÇÃO E FUNÇÕES AUXILIARES (NO TOPO DO ARQUIVO)
// =========================================================================

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  // ✅ REMOVEMOS withCredentials: true - não precisa mais para tokens
});

// ✅ INTERCEPTOR PARA ADICIONAR TOKEN AUTOMATICAMENTE
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ INTERCEPTOR PARA TRATAR ERROS DE AUTENTICAÇÃO
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido - faz logout automático
      localStorage.removeItem('auth_token');
      window.location.reload(); // Força voltar para tela de login
    }
    return Promise.reject(error);
  }
);

// =========================================================================
// ✅ FUNÇÃO fetchAPI (ADICIONAR ESTA FUNÇÃO QUE ESTÁ FALTANDO)
// =========================================================================
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await api({
      url: endpoint,
      method: options.method || 'GET',
      data: options.body,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (response.data.success === false) {
      throw new Error(response.data.message || 'API retornou um erro');
    }
    return response.data;
  } catch (error) {
    console.error(`❌ Erro na requisição para ${endpoint}:`, error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

// =========================================================================
// ✅ FUNÇÃO renderSafe (PARA EVITAR ERROS DE VALORES NULOS)
// =========================================================================
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
// 🔐 COMPONENTES DE PÁGINA, MODAIS E LOGIN
// =========================================================================
// =========================================================================
// 🔐 COMPONENTE DA TELA DE LOGIN
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
      // ✅ MUDANÇA: Login direto sem CSRF cookie
      const response = await fetchAPI('/login', {
        method: 'POST',
        body: { email, password } // ✅ MUDANÇA: objeto direto, sem JSON.stringify
      });

      if (response.success && response.token) {
        // ✅ Salva o token no localStorage
        localStorage.setItem('auth_token', response.token);
        onLoginSuccess(response.user);
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
// ✅ AQUI FICAM TODOS OS SEUS COMPONENTES DE PÁGINA E MODAIS
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

// Encontre e substitua este componente inteiro no seu App.js

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
      // Reseta para um formulário limpo ao criar um novo produto
      setForm({ nome: '', descricao: '', preco: '', categoria_id: '', disponivel: true, imagem: '' });
    }
  }, [produto, mostrar]); // Roda o efeito quando o produto ou a visibilidade do modal muda

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form); // Envia o estado local do formulário para a função 'salvarProduto'
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
              {categorias.map(cat => <option key={cat.id} value={cat.id}>{renderSafe(cat.nome)}</option>)}
            </select>
          </div>

          <div style={estilos.formGroup}>
            <label style={estilos.label} htmlFor="imagem">URL da Imagem:</label>
            <input id="imagem" type="url" name="imagem" value={form.imagem} onChange={handleChange} style={estilos.input} placeholder="https://exemplo.com/imagem.jpg" />
          </div>

          <div style={estilos.formGroup}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" name="disponivel" checked={form.disponivel} onChange={handleChange} style={{ transform: 'scale(1.2)' }} />
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Produto disponível</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" style={{ ...estilos.button, ...estilos.buttonSuccess, padding: '12px 24px', fontSize: '16px', flex: 1 }}>💾 {produto ? 'Atualizar Produto' : 'Criar Produto'}</button>
            <button type="button" onClick={onClose} style={{ ...estilos.button, backgroundColor: '#6c757d', color: 'white', padding: '12px 24px', fontSize: '16px', flex: 1 }}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ModalRelatorioDia = ({ mostrar, onClose, relatorio }) => {
  if (!mostrar || !relatorio) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '500px' }}>
        <h3>📊 Relatório do Dia</h3>
        <p>Pedidos Hoje: {renderSafe(relatorio.pedidos_hoje, 0)}</p>
        <p>Vendas Hoje: R$ {Number(renderSafe(relatorio.vendas_hoje, 0)).toFixed(2)}</p>
        <button type="button" onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
};


// =========================================================================
// 🔒 PAINEL DE ADMIN (AGORA CONTÉM TODA A LÓGICA DO SEU SISTEMA)
// =========================================================================

const AdminPanel = ({ user, onLogout }) => {
  const [paginaAtiva, setPaginaAtiva] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [configuracoes, setConfiguracoes] = useState(null);
  const [expedienteStatus, setExpedienteStatus] = useState(null);
  const [mostrarModalConfig, setMostrarModalConfig] = useState(false);
  const [mostrarModalExpediente, setMostrarModalExpediente] = useState(false);
  const [mostrarModalProduto, setMostrarModalProduto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [formConfig, setFormConfig] = useState({ nome_estabelecimento: '', telefone: '', numero_mesas: 10, taxa_servico: 0 });

  const carregarDashboard = async () => { try { const data = await fetchAPI('/admin/dashboard'); setDashboardData(data.data); } catch (e) { console.error(e); }};
  const carregarPedidos = async () => { try { const res = await fetchAPI('/admin/pedidos'); setPedidos(res.data || []); } catch (e) { console.error(e); setPedidos([]); }};
  const carregarProdutos = async () => { try { const res = await fetchAPI('/admin/produtos'); setProdutos(res.data || []); const catRes = await fetchAPI('/admin/categorias'); setCategorias(catRes.data || []); } catch (e) { console.error(e); setProdutos([]); }};
  const carregarMesas = async () => { try { const res = await fetchAPI('/admin/mesas'); setMesas(res.data || []); } catch (e) { console.error(e); setMesas([]); }};
  const carregarConfiguracoes = async () => { try { const data = await fetchAPI('/admin/configuracoes'); if (data.data) { setConfiguracoes(data.data); setFormConfig(data.data); }} catch (e) { console.error(e); }};
  const carregarExpedienteStatus = async () => { try { const data = await fetchAPI('/admin/expediente/status'); setExpedienteStatus(data.data); } catch (e) { console.error(e); }};

  const handleConfigSubmit = async (e) => { e.preventDefault(); try { await fetchAPI('/admin/configuracoes', { method: 'PUT', body: JSON.stringify(formConfig) }); alert('✅ Configurações salvas!'); setMostrarModalConfig(false); carregarConfiguracoes(); } catch (e) { alert('❌ Erro: ' + e.message); }};
  const atualizarStatusPedido = async (id, status) => { try { await fetchAPI(`/admin/pedidos/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }); alert(`✅ Pedido #${id} atualizado!`); carregarPedidos(); } catch (e) { alert('❌ Erro: ' + e.message); }};
  const cancelarPedido = async (id) => { if (window.confirm('Certeza?')) { try { await fetchAPI(`/admin/pedidos/${id}/cancelar`, { method: 'POST' }); alert(`✅ Pedido #${id} cancelado!`); carregarPedidos(); } catch (e) { alert('❌ Erro: ' + e.message); }}};
  const pagarContaMesa = async (id) => { if (window.confirm('Confirmar pagamento?')) { try { await fetchAPI(`/admin/mesas/${id}/pagar-conta`, { method: 'POST' }); alert(`✅ Conta paga!`); carregarMesas(); carregarDashboard(); } catch (e) { alert('❌ Erro: ' + e.message); }}};
  const liberarMesa = async (id) => { if (window.confirm('Liberar esta mesa?')) { try { await fetchAPI(`/admin/mesas/${id}/liberar`, { method: 'POST' }); alert(`✅ Mesa liberada!`); carregarMesas(); } catch (e) { alert('❌ Erro: ' + e.message); }}};
  const abrirModalProduto = (produto = null) => { setProdutoEditando(produto); setMostrarModalProduto(true); };
  const salvarProduto = async (produtoData) => { try { const url = produtoEditando ? `/admin/produtos/${produtoEditando.id}` : '/admin/produtos'; const method = produtoEditando ? 'PUT' : 'POST'; await fetchAPI(url, { method, body: JSON.stringify(produtoData) }); alert('✅ Produto salvo!'); setMostrarModalProduto(false); carregarProdutos(); } catch (e) { alert('❌ Erro: ' + e.message); }};
  const excluirProduto = async (id) => { if (window.confirm('Excluir este produto?')) { try { await fetchAPI(`/admin/produtos/${id}`, { method: 'DELETE' }); alert('✅ Produto excluído!'); carregarProdutos(); } catch (e) { alert('❌ Erro: ' + e.message); }}};
  const imprimirPedidoController = async (pedido, tipo, configs) => { try { const endpoint = `/admin/impressao/pedido/${pedido.id}/${tipo}`; const data = await fetchAPI(endpoint); const win = window.open('', '_blank'); win.document.write(data.data.conteudo_impressao); win.document.close(); setTimeout(() => { win.print(); win.close(); }, 500); } catch (e) { alert('❌ Erro de impressão: ' + e.message); }};
  const abrirExpediente = async () => { try { await fetchAPI('/admin/expediente/abrir', { method: 'POST' }); alert('✅ Expediente aberto!'); carregarExpedienteStatus(); carregarDashboard(); carregarMesas(); } catch (e) { alert('❌ Erro: ' + e.message); }};
  const fecharExpediente = async () => { try { const res = await fetchAPI('/admin/expediente/fechar', { method: 'POST' }); alert('✅ Expediente fechado!'); setExpedienteStatus(res.data); setMostrarModalExpediente(true); carregarDashboard(); } catch (e) { alert('❌ Erro: ' + e.message); }};
  const reiniciarSistema = async () => { if (window.confirm('⚠️ ATENÇÃO! Reiniciar o sistema?')) { try { await fetchAPI('/admin/configuracoes/reiniciar-sistema', { method: 'POST' }); alert('✅ Sistema reiniciado!'); carregarDashboard(); carregarMesas(); carregarPedidos(); } catch (e) { alert('❌ Erro: ' + e.message); }}};

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      setCarregando(true);
      await carregarDashboard();
      await carregarExpedienteStatus();
      await carregarConfiguracoes();
      setCarregando(false);
    };
    carregarDadosIniciais();
  }, []);

  useEffect(() => {
    if (paginaAtiva === 'pedidos') carregarPedidos();
    if (paginaAtiva === 'produtos') carregarProdutos();
    if (paginaAtiva === 'mesas') carregarMesas();
  }, [paginaAtiva]);

  const ControleExpediente = () => (
    <div style={estilos.card}>
      <h3 style={{ marginBottom: '15px' }}>🕒 Controle de Expediente</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {expedienteStatus && !expedienteStatus.expediente_aberto ? (
          <button onClick={abrirExpediente} style={{ ...estilos.button, ...estilos.buttonSuccess }}>🟢 Iniciar</button>
        ) : (
          <button onClick={fecharExpediente} style={{ ...estilos.button, ...estilos.buttonDanger }}>🔴 Fechar</button>
        )}
        <button onClick={() => setMostrarModalConfig(true)} style={{ ...estilos.button, ...estilos.buttonPrimary }}>⚙️ Configs</button>
        <button onClick={reiniciarSistema} style={{ ...estilos.button, ...estilos.buttonWarning }}>🔄 Reiniciar</button>
      </div>
    </div>
  );

// Dentro do seu arquivo, substitua o return da função "AdminPanel" por este:

  return (
      <div style={estilos.container}>
        <header style={estilos.header}>
          <div>
            <h1 style={{ margin: 0 }}>🍔 {configuracoes?.nome_estabelecimento || "Painel Admin"}</h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.8 }}>Bem-vindo, {user.name}!</p>
          </div>
          <button onClick={onLogout} style={{ ...estilos.navButton, backgroundColor: '#c82333' }}>Sair</button>
        </header>

        <div style={{ padding: '0 20px', backgroundColor: '#e8eaf6' }}>
          <nav style={{ ...estilos.nav, maxWidth: '1200px', margin: '0 auto', padding: '10px 0' }}>
            <button onClick={() => setPaginaAtiva('dashboard')} style={paginaAtiva === 'dashboard' ? estilos.navButtonAtivo : estilos.navButton}>📊 Dashboard</button>
            <button onClick={() => setPaginaAtiva('pedidos')} style={paginaAtiva === 'pedidos' ? estilos.navButtonAtivo : estilos.navButton}>📦 Pedidos</button>
            <button onClick={() => setPaginaAtiva('produtos')} style={paginaAtiva === 'produtos' ? estilos.navButtonAtivo : estilos.navButton}>🍔 Produtos</button>
            <button onClick={() => setPaginaAtiva('mesas')} style={paginaAtiva === 'mesas' ? estilos.navButtonAtivo : estilos.navButton}>🪑 Mesas</button>
          </nav>
        </div>

        <main style={estilos.main}>
          {carregando ? <p>Carregando...</p> : (
            <>
              {paginaAtiva === 'dashboard' && <Dashboard dashboardData={dashboardData} ControleExpediente={ControleExpediente} MesasComponent={() => <Mesas mesas={mesas} pagarContaMesa={pagarContaMesa} liberarMesa={liberarMesa} />} />}
              {paginaAtiva === 'pedidos' && <Pedidos pedidos={pedidos} setPedidoSelecionado={setPedidoSelecionado} pedidoSelecionado={pedidoSelecionado} atualizarStatusPedido={atualizarStatusPedido} cancelarPedido={cancelarPedido} imprimirPedidoController={imprimirPedidoController} configuracoes={configuracoes} />}
              {paginaAtiva === 'produtos' && <Produtos produtos={produtos} abrirModalProduto={abrirModalProduto} excluirProduto={excluirProduto} />}
              {paginaAtiva === 'mesas' && <Mesas mesas={mesas} pagarContaMesa={pagarContaMesa} liberarMesa={liberarMesa} />}
            </>
          )}
        </main>

        {/* Os Modais são chamados aqui no final, para aparecerem sobre todo o conteúdo */}
        <ModalConfiguracoes mostrar={mostrarModalConfig} onClose={() => setMostrarModalConfig(false)} form={formConfig} setForm={setFormConfig} onSubmit={handleConfigSubmit} />
        <ModalProduto mostrar={mostrarModalProduto} onClose={() => setMostrarModalProduto(false)} produto={produtoEditando} onSubmit={salvarProduto} categorias={categorias} />
        <ModalRelatorioDia mostrar={mostrarModalExpediente} onClose={() => setMostrarModalExpediente(false)} relatorio={expedienteStatus} />
      </div>
    );

  }

// =========================================================================
// 🚀 COMPONENTE PRINCIPAL APP (AGORA É O "ROTEADOR" DE AUTENTICAÇÃO)
// =========================================================================

function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetchAPI('/user');
        if (response.user) {
          setUser(response.user);
        }
      } catch (error) {
        console.log('Nenhum usuário logado, exibindo tela de login.');
      } finally {
        setLoadingAuth(false);
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetchAPI('/logout', { method: 'POST' });
      setUser(null);
    } catch(err) {
      console.error('Erro no logout', err);
      alert('Não foi possível fazer logout.');
    }
  };

  if (loadingAuth) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Verificando sessão...</div>;
  }

  return user ? (
    <AdminPanel user={user} onLogout={handleLogout} />
  ) : (
    <LoginPage onLoginSuccess={setUser} />
  );
}

export default App;