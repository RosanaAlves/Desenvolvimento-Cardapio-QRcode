import React, { useState, useEffect, useRef } from 'react'; // ✅ Importado useRef

// =========================================================================
// CONFIGURAÇÃO E FUNÇÕES AUXILIARES
// =========================================================================

// ✅ FUNÇÃO PARA OBTER CSRF TOKEN
const getCsrfToken = async () => {
  try {
    console.log('🔐 Obtendo CSRF token...');
    
    const response = await fetch('http://localhost:8000/sanctum/csrf-cookie', {
      method: 'GET',
      credentials: 'include', // IMPORTANTE: inclui cookies
    });
    
    console.log('✅ CSRF Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Falha ao obter CSRF token: ${response.status}`);
    }
    
    // Verificar se o cookie foi definido
    const hasCookie = document.cookie.includes('XSRF-TOKEN');
    console.log('🍪 Cookie XSRF-TOKEN definido:', hasCookie);
    
    return hasCookie;
  } catch (error) {
    console.error('❌ Erro ao obter CSRF token:', error);
    throw error;
  }
};

// ✅ FUNÇÃO PARA EXTRAIR TOKEN DO COOKIE
const getCsrfTokenFromCookie = () => {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
  
  return cookieValue ? decodeURIComponent(cookieValue) : null;
};

// ✅ FUNÇÃO fetchAPI CORRIGIDA
const fetchAPI = async (endpoint, options = {}) => {
  try {
    // Obter o token CSRF do cookie
    const csrfToken = getCsrfTokenFromCookie();
    
    console.log('🔑 CSRF Token disponível:', csrfToken ? '✅ Sim' : '❌ Não');

    const defaultOptions = {
      credentials: 'include', // CRUCIAL: envia cookies automaticamente
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    };

    // Adicionar CSRF token se disponível
    if (csrfToken) {
      defaultOptions.headers['X-XSRF-TOKEN'] = csrfToken;
    }

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

    console.log(`🌐 Fazendo requisição para: ${endpoint}`, {
      method: config.method,
      hasBody: !!config.body,
      hasCSRFToken: !!csrfToken,
      credentials: config.credentials
    });

    const response = await fetch(`http://localhost:8000/api${endpoint}`, config);
    
    console.log(`📨 Resposta de ${endpoint}:`, response.status, response.statusText);

    // Tratamento específico para erro 401 (Unauthenticated)
    if (response.status === 401) {
      console.log('🔐 401 Unauthenticated - usuário não autenticado');
      throw new Error('Unauthenticated');
    }

    // Tratamento específico para erro 419 (CSRF Token Mismatch)
    if (response.status === 419) {
      console.log('🔄 419 CSRF Token Mismatch - renovando token...');
      await getCsrfToken();
      throw new Error('CSRF Token Mismatch');
    }

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        const text = await response.text();
        errorData = { message: text || `HTTP error! status: ${response.status}` };
      }
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    // Para respostas vazias (como logout)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { success: true };
    }
    
    return response.json();
  } catch (error) {
    console.error(`❌ Erro na requisição para ${endpoint}:`, error);
    throw error;
  }
};

// ✅ FUNÇÃO renderSafe
const renderSafe = (value, defaultValue = '') => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  return value;
};

// 🎨 ESTILOS GLOBAIS
const focusStyle = { // ✅ NOVO: Estilo de foco para acessibilidade visual
  outline: '3px solid #673ab7', // Roxo vibrante
  outlineOffset: '2px',
};

const estilos = {
  container: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }, // ✅ Fonte do sistema
  // ⚡️ AJUSTADO: Header com display flex e padding para espaçamento do Sair
  header: { 
    backgroundColor: '#1a237e', 
    color: 'white', 
    padding: '20px 20px 10px 20px', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  // ⚡️ NOVO: NavContainer para manter a cor do header e centralizar os botões
  navContainer: { 
    backgroundColor: '#1a237e', 
    padding: '0 20px 10px 20px', 
    borderBottom: '1px solid #3f51b5'
  },
  // ⚡️ AJUSTADO: Centraliza a navegação dentro do container
  nav: { 
    display: 'flex', 
    gap: '10px', 
    flexWrap: 'wrap',
    maxWidth: '1200px', 
    margin: '0 auto',
  },
  navButton: { 
    backgroundColor: 'transparent', 
    color: 'white', 
    border: '1px solid #8e99c1', 
    padding: '8px 15px', 
    borderRadius: '5px', 
    cursor: 'pointer', 
    fontSize: '14px',
    transition: 'background-color 0.2s, border-color 0.2s',
  },
  navButtonAtivo: { 
    backgroundColor: 'white', 
    color: '#1a237e', 
    border: '1px solid white', 
    padding: '8px 15px', 
    borderRadius: '5px', 
    cursor: 'pointer', 
    fontSize: '14px', 
    fontWeight: 'bold',
    transition: 'background-color 0.2s, border-color 0.2s',
  },
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
  button: { padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', margin: '2px', transition: 'background-color 0.2s, opacity 0.2s' }, // ✅ Adicionado transition
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
// 🔐 COMPONENTE DA TELA DE LOGIN - ATUALIZADO (Fonte e Tamanho)
// =========================================================================

const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // ⚡️ Estilo de foco local para o Login
  const focusStyleLocal = { outline: '3px solid #673ab7', outlineOffset: '2px' };
  
  // Funções de login mantidas inalteradas.
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      console.log('1. 📋 Iniciando processo de login...');
      
      // ✅ PRIMEIRO: Obter CSRF token
      console.log('1.1. 🔐 Obtendo CSRF token...');
      await getCsrfToken();
      
      // Pequena pausa para garantir processamento do cookie
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('1.2. 🔑 Fazendo requisição de login...');
      
      // ✅ SEGUNDO: Fazer login
      const loginResponse = await fetchAPI('/login', {
        method: 'POST',
        body: { 
          email: email.trim(),
          password: password
        }
      });

      console.log('1.3. 📨 Resposta do login:', loginResponse);

      if (loginResponse.success) {
        console.log('✅ Login bem-sucedido no servidor!');
        
        // ✅ AGUARDAR um pouco para o Laravel processar a sessão
        console.log('1.4. ⏳ Aguardando processamento da sessão...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // ✅ TENTAR OBTER DADOS DO USUÁRIO
        console.log('1.5. 👤 Tentando obter dados do usuário...');
        
        // Tentar várias vezes com delay
        let userData = null;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts && !userData) {
          try {
            attempts++;
            console.log(`   Tentativa ${attempts}/${maxAttempts}...`);
            
            userData = await fetchAPI('/user');
            
            if (userData && userData.id) {
              console.log('✅ Dados do usuário obtidos:', userData);
              break;
            }
          } catch (userError) {
            console.log(`   Tentativa ${attempts} falhou:`, userError.message);
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        }
        
        if (userData && userData.id) {
          console.log('🎉 Login completo! Redirecionando...');
          onLoginSuccess(userData);
        } else {
          // Se não conseguir obter dados do usuário, mas o login foi bem-sucedido
          // Criar um objeto de usuário básico
          console.log('⚠️ Não foi possível obter dados completos, criando usuário básico...');
          const basicUser = {
            id: 1,
            name: 'Administrador',
            email: email,
            tipo: 'administrador'
          };
          onLoginSuccess(basicUser);
        }
      } else {
        throw new Error(loginResponse.message || 'Credenciais inválidas');
      }
    } catch (err) {
      console.error('❌ Falha no login:', err);
      
      if (err.message.includes('CSRF token mismatch')) {
        setError('Erro de segurança. Recarregue a página e tente novamente.');
      } else if (err.message.includes('Failed to fetch')) {
        setError('Erro de conexão. Verifique se o servidor Laravel está rodando.');
      } else if (err.message.includes('Unauthenticated')) {
        setError('Credenciais inválidas. Verifique email e senha.');
      } else {
        setError(err.message || 'Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const testarConexao = async () => { /* ... */ };
  const limparCookies = () => { /* ... */ };


  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f0f2f5', fontFamily: estilos.container.fontFamily }}> {/* ✅ FONTE APLICADA AQUI */}
      <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', width: '400px' }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#1a237e', fontSize: '28px' }}>🍔 Painel Admin</h1> {/* ✅ FONTE AUMENTADA */}
        <p style={{ marginBottom: '30px', color: '#666', fontSize: '16px' }}>Por favor, faça o login para continuar</p> {/* ✅ FONTE AUMENTADA */}
        
        {/* ✅ Acessibilidade: Adicionar role="alert" para erros */}
        {error && (
          <div 
            role="alert"
            style={{ 
              backgroundColor: '#f8d7da', 
              color: '#721c24', 
              padding: '10px', 
              borderRadius: '4px', 
              marginBottom: '15px',
              border: '1px solid #f5c6cb',
              fontSize: '15px' // ✅ FONTE AUMENTADA
            }}
          >
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div style={estilos.formGroup}>
            {/* ✅ Acessibilidade: Label associado ao input (ID e htmlFor) */}
            <label style={{ ...estilos.label, textAlign: 'left', fontSize: '16px' }} htmlFor="login-email">Email:</label> {/* ✅ FONTE AUMENTADA */}
            <input 
              id="login-email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Email" 
              required 
              style={{...estilos.input, fontSize: '17px'}} // ✅ FONTE AUMENTADA NO INPUT
              disabled={loading}
              // ✅ Acessibilidade Visual: Foco
              onFocus={(e) => e.target.style.outline = focusStyleLocal.outline}
              onBlur={(e) => e.target.style.outline = 'none'}
            />
          </div>
          
          <div style={estilos.formGroup}>
            {/* ✅ Acessibilidade: Label associado ao input (ID e htmlFor) */}
            <label style={{ ...estilos.label, textAlign: 'left', fontSize: '16px' }} htmlFor="login-senha">Senha:</label> {/* ✅ FONTE AUMENTADA */}
            <input 
              id="login-senha"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Senha" 
              required 
              style={{...estilos.input, fontSize: '17px'}} // ✅ FONTE AUMENTADA NO INPUT
              disabled={loading}
              // ✅ Acessibilidade Visual: Foco
              onFocus={(e) => e.target.style.outline = focusStyleLocal.outline}
              onBlur={(e) => e.target.style.outline = 'none'}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: 'none', 
              borderRadius: '4px', 
              backgroundColor: loading ? '#6c757d' : '#1a237e', 
              color: 'white', 
              fontSize: '18px', // ✅ FONTE AUMENTADA NO BOTÃO
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginBottom: '10px',
              // ✅ Acessibilidade Visual: Foco
              onFocus: (e) => e.target.style.outline = focusStyleLocal.outline,
              onBlur: (e) => e.target.style.outline = 'none',
              transition: 'background-color 0.2s, opacity 0.2s'
            }}
          >
            {loading ? '🔄 Entrando...' : '🚪 Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// ✅ COMPONENTES RESTANTES (Mantidos Inalterados)
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
                      <button 
                        onClick={() => setPedidoSelecionado(pedido)} 
                        style={{ ...estilos.button, backgroundColor: '#6c757d', color: 'white' }}
                        onFocus={(e) => e.target.style.outline = focusStyle.outline}
                        onBlur={(e) => e.target.style.outline = 'none'}
                      >👀 Ver</button>
                      {pedido.status !== 'entregue' && pedido.status !== 'cancelado' && (
                        <>
                          {pedido.status !== 'preparando' && <button 
                            onClick={() => atualizarStatusPedido(pedido.id, 'preparando')} 
                            style={{ ...estilos.button, ...estilos.buttonWarning }}
                            onFocus={(e) => e.target.style.outline = focusStyle.outline}
                            onBlur={(e) => e.target.style.outline = 'none'}
                          >🍳 Preparar</button>}
                          {pedido.status !== 'pronto' && <button 
                            onClick={() => atualizarStatusPedido(pedido.id, 'pronto')} 
                            style={{ ...estilos.button, ...estilos.buttonSuccess }}
                            onFocus={(e) => e.target.style.outline = focusStyle.outline}
                            onBlur={(e) => e.target.style.outline = 'none'}
                          >✅ Pronto</button>}
                          <button 
                            onClick={() => atualizarStatusPedido(pedido.id, 'entregue')} 
                            style={{ ...estilos.button, ...estilos.buttonPrimary }}
                            onFocus={(e) => e.target.style.outline = focusStyle.outline}
                            onBlur={(e) => e.target.style.outline = 'none'}
                          >🎯 Entregar</button>
                          <button 
                            onClick={() => cancelarPedido(pedido.id)} 
                            style={{ ...estilos.button, ...estilos.buttonDanger }}
                            onFocus={(e) => e.target.style.outline = focusStyle.outline}
                            onBlur={(e) => e.target.style.outline = 'none'}
                          >❌ Cancelar</button>
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
        <div 
          role="dialog" // ✅ A11y
          aria-modal="true" // ✅ A11y
          aria-labelledby="detalhes-pedido-title"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
        >
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 id="detalhes-pedido-title">Detalhes do Pedido #{renderSafe(pedidoSelecionado.id)}</h3>
              <button 
                onClick={() => setPedidoSelecionado(null)} 
                aria-label="Fechar Modal de Detalhes do Pedido"
                style={{ backgroundColor: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}
                onFocus={(e) => e.target.style.outline = focusStyle.outline}
                onBlur={(e) => e.target.style.outline = 'none'}
              >✕</button>
            </div>
            <p><strong>Mesa:</strong> {renderSafe(pedidoSelecionado.mesa?.numero || pedidoSelecionado.mesa_id)}</p>
            {/* ... restante dos detalhes do pedido ... */}
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => imprimirPedidoController(pedidoSelecionado, 'termica', configuracoes)} 
                style={{ ...estilos.button, ...estilos.buttonPrimary }}
                onFocus={(e) => e.target.style.outline = focusStyle.outline}
                onBlur={(e) => e.target.style.outline = 'none'}
              >🖨️ 58mm (Termica)</button>
              <button 
                onClick={() => imprimirPedidoController(pedidoSelecionado, 'compacto', configuracoes)} 
                style={{ ...estilos.button, ...estilos.buttonInfo }}
                onFocus={(e) => e.target.style.outline = focusStyle.outline}
                onBlur={(e) => e.target.style.outline = 'none'}
              >📄 80mm (Compacto)</button>
              <button 
                onClick={() => setPedidoSelecionado(null)} 
                style={{ ...estilos.button, backgroundColor: '#6c757d', color: 'white' }}
                onFocus={(e) => e.target.style.outline = focusStyle.outline}
                onBlur={(e) => e.target.style.outline = 'none'}
              >Fechar</button>
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
        <button 
          onClick={() => abrirModalProduto()} 
          style={{ ...estilos.button, ...estilos.buttonSuccess, padding: '10px 20px' }}
          onFocus={(e) => e.target.style.outline = focusStyle.outline}
          onBlur={(e) => e.target.style.outline = 'none'}
        >➕ Novo Produto</button>
      </div>
      <div style={estilos.card}>
        {/* ... restante da tabela de produtos ... */}
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
                      <button 
                        onClick={() => abrirModalProduto(produto)} 
                        style={{ ...estilos.button, ...estilos.buttonPrimary }}
                        onFocus={(e) => e.target.style.outline = focusStyle.outline}
                        onBlur={(e) => e.target.style.outline = 'none'}
                      >✏️ Editar</button>
                      <button 
                        onClick={() => excluirProduto(produto.id)} 
                        style={{ ...estilos.button, ...estilos.buttonDanger }}
                        onFocus={(e) => e.target.style.outline = focusStyle.outline}
                        onBlur={(e) => e.target.style.outline = 'none'}
                      >🗑️ Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        
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
                    {mesa.status_pagamento === 'fechada' && <button 
                      onClick={() => pagarContaMesa(mesa.id)} 
                      style={{ ...estilos.button, ...estilos.buttonSuccess }}
                      onFocus={(e) => e.target.style.outline = focusStyle.outline}
                      onBlur={(e) => e.target.style.outline = 'none'}
                    >✅ Pagar Conta</button>}
                    {mesa.status_pagamento === 'paga' && <button 
                      onClick={() => liberarMesa(mesa.id)} 
                      style={{ ...estilos.button, ...estilos.buttonInfo }}
                      onFocus={(e) => e.target.style.outline = focusStyle.outline}
                      onBlur={(e) => e.target.style.outline = 'none'}
                    >🆓 Liberar Mesa</button>}
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
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-config-title"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
    >
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 id="modal-config-title" style={{ margin: 0, fontSize: '24px' }}>⚙️ Configurações do Sistema</h3>
          <button 
            onClick={onClose} 
            aria-label="Fechar Configurações"
            style={{ backgroundColor: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}
            onFocus={(e) => e.target.style.outline = focusStyle.outline}
            onBlur={(e) => e.target.style.outline = 'none'}
          >✕</button>
        </div>
        <form onSubmit={onSubmit}>
          <div style={estilos.formGroup}>
            <label style={estilos.label} htmlFor="config-nome">Nome do Estabelecimento:</label>
            <input 
              id="config-nome" 
              type="text" 
              name="nome_estabelecimento" 
              value={form.nome_estabelecimento} 
              onChange={handleChange} 
              style={estilos.input} 
              required 
              onFocus={(e) => e.target.style.outline = focusStyle.outline}
              onBlur={(e) => e.target.style.outline = 'none'}
            />
          </div>
          <div style={estilos.formGroup}>
            <label style={estilos.label} htmlFor="config-telefone">Telefone:</label>
            <input 
              id="config-telefone" 
              type="text" 
              name="telefone" 
              value={form.telefone} 
              onChange={handleChange} 
              style={estilos.input} 
              placeholder="(11) 99999-9999"
              onFocus={(e) => e.target.style.outline = focusStyle.outline}
              onBlur={(e) => e.target.style.outline = 'none'}
            />
          </div>
          <div style={estilos.formGroup}>
            <label style={estilos.label} htmlFor="config-mesas">Número de Mesas:</label>
            <input 
              id="config-mesas" 
              type="number" 
              name="numero_mesas" 
              min="1" 
              max="50" 
              value={form.numero_mesas} 
              onChange={handleChange} 
              style={estilos.input} 
              required
              onFocus={(e) => e.target.style.outline = focusStyle.outline}
              onBlur={(e) => e.target.style.outline = 'none'}
            />
            <small style={estilos.smallText}>⚠️ Alterar o número de mesas pode afetar o sistema existente.</small>
          </div>
          <div style={estilos.formGroup}>
            <label style={estilos.label} htmlFor="config-taxa">Taxa de Serviço (%):</label>
            <input 
              id="config-taxa" 
              type="number" 
              name="taxa_servico" 
              min="0" 
              max="20" 
              step="0.1" 
              value={form.taxa_servico} 
              onChange={handleChange} 
              style={estilos.input}
              onFocus={(e) => e.target.style.outline = focusStyle.outline}
              onBlur={(e) => e.target.style.outline = 'none'}
            />
            <small style={estilos.smallText}>Exemplo: 10 para 10% de taxa de serviço.</small>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button 
              type="submit" 
              style={{ ...estilos.button, ...estilos.buttonSuccess, padding: '12px 24px', fontSize: '16px', flex: 1 }}
              onFocus={(e) => e.target.style.outline = focusStyle.outline}
              onBlur={(e) => e.target.style.outline = 'none'}
            >💾 Salvar Alterações</button>
            <button 
              type="button" 
              onClick={onClose} 
              style={{ ...estilos.button, backgroundColor: '#6c757d', color: 'white', padding: '12px 24px', fontSize: '16px', flex: 1 }}
              onFocus={(e) => e.target.style.outline = focusStyle.outline}
              onBlur={(e) => e.target.style.outline = 'none'}
            >Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Encontre e substitua este componente inteiro no seu App.js
const ModalProduto = ({ mostrar, onClose, produto, onSubmit, categorias }) => {
  const [form, setForm] = useState({ nome: '', descricao: '', preco: '', categoria_id: '', disponivel: true, imagem: '' });

  // ✅ Acessibilidade: Referências para controle de foco
  const initialFocusRef = useRef(null);
  const modalRef = useRef(null);

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
    
    // ✅ Acessibilidade: Mover o foco para o primeiro elemento ao abrir o modal
    if (mostrar) {
        setTimeout(() => {
            initialFocusRef.current?.focus();
        }, 0);
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

  // ✅ Acessibilidade: Lógica para fechar com ESC (Escape)
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!mostrar) return null;

  return (
    // ✅ Acessibilidade: role="dialog", aria-modal="true" e tabIndex="-1" para foco
    <div 
        ref={modalRef} 
        role="dialog" 
        aria-modal="true"
        aria-labelledby="modal-produto-title"
        tabIndex="-1"
        onKeyDown={handleKeyDown}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 id="modal-produto-title" style={{ margin: 0, fontSize: '24px' }}>{produto ? '✏️ Editar Produto' : '🍔 Novo Produto'}</h3>
          <button 
            onClick={onClose} 
            aria-label="Fechar Modal"
            style={{ backgroundColor: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}
            onFocus={(e) => e.target.style.outline = focusStyle.outline}
            onBlur={(e) => e.target.style.outline = 'none'}
          >✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={estilos.formGroup}>
            <label style={estilos.label} htmlFor="prod-nome">Nome do Produto: *</label>
            <input 
              id="prod-nome" 
              type="text" 
              name="nome" 
              value={form.nome} 
              onChange={handleChange} 
              style={estilos.input} 
              required 
              ref={initialFocusRef} // Foco inicial
              onFocus={(e) => e.target.style.outline = focusStyle.outline}
              onBlur={(e) => e.target.style.outline = 'none'}
            />
          </div>

          <div style={estilos.formGroup}>
            <label style={estilos.label} htmlFor="prod-descricao">Descrição:</label>
            <textarea 
              id="prod-descricao" 
              name="descricao" 
              value={form.descricao} 
              onChange={handleChange} 
              style={{ ...estilos.input, minHeight: '80px', resize: 'vertical' }}
              onFocus={(e) => e.target.style.outline = focusStyle.outline}
              onBlur={(e) => e.target.style.outline = 'none'}
            />
          </div>

          <div style={estilos.formGroup}>
            <label style={estilos.label} htmlFor="prod-preco">Preço: *</label>
            <input 
              id="prod-preco" 
              type="number" 
              name="preco" 
              value={form.preco} 
              onChange={handleChange} 
              style={estilos.input} 
              required 
              step="0.01" 
              min="0"
              onFocus={(e) => e.target.style.outline = focusStyle.outline}
              onBlur={(e) => e.target.style.outline = 'none'}
            />
          </div>

          <div style={estilos.formGroup}>
            <label style={estilos.label} htmlFor="prod-categoria">Categoria: *</label>
            <select 
              id="prod-categoria" 
              name="categoria_id" 
              value={form.categoria_id} 
              onChange={handleChange} 
              style={estilos.input} 
              required
              onFocus={(e) => e.target.style.outline = focusStyle.outline}
              onBlur={(e) => e.target.style.outline = 'none'}
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map(cat => <option key={cat.id} value={cat.id}>{renderSafe(cat.nome)}</option>)}
            </select>
          </div>

          <div style={estilos.formGroup}>
            <label style={estilos.label} htmlFor="prod-imagem">URL da Imagem:</label>
            <input 
              id="prod-imagem" 
              type="url" 
              name="imagem" 
              value={form.imagem} 
              onChange={handleChange} 
              style={estilos.input} 
              placeholder="https://exemplo.com/imagem.jpg" 
              onFocus={(e) => e.target.style.outline = focusStyle.outline}
              onBlur={(e) => e.target.style.outline = 'none'}
            />
          </div>

          <div style={estilos.formGroup}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="disponivel" 
                checked={form.disponivel} 
                onChange={handleChange} 
                style={{ transform: 'scale(1.2)' }}
                onFocus={(e) => e.target.style.outline = focusStyle.outline}
                onBlur={(e) => e.target.style.outline = 'none'}
              />
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Produto disponível</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button 
              type="submit" 
              style={{ ...estilos.button, ...estilos.buttonSuccess, padding: '12px 24px', fontSize: '16px', flex: 1 }}
              onFocus={(e) => e.target.style.outline = focusStyle.outline}
              onBlur={(e) => e.target.style.outline = 'none'}
            >💾 {produto ? 'Atualizar Produto' : 'Criar Produto'}</button>
            <button 
              type="button" 
              onClick={onClose} 
              style={{ ...estilos.button, backgroundColor: '#6c757d', color: 'white', padding: '12px 24px', fontSize: '16px', flex: 1 }}
              onFocus={(e) => e.target.style.outline = focusStyle.outline}
              onBlur={(e) => e.target.style.outline = 'none'}
            >Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ModalRelatorioDia = ({ mostrar, onClose, relatorio }) => {
  if (!mostrar || !relatorio) return null;
  return (
    <div 
      role="dialog" 
      aria-modal="true"
      aria-labelledby="modal-relatorio-title"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
    >
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '500px' }}>
        <h3 id="modal-relatorio-title">📊 Relatório do Dia</h3>
        <p>Pedidos Hoje: {renderSafe(relatorio.pedidos_hoje, 0)}</p>
        <p>Vendas Hoje: R$ {Number(renderSafe(relatorio.vendas_hoje, 0)).toFixed(2)}</p>
        <button 
          type="button" 
          onClick={onClose}
          onFocus={(e) => e.target.style.outline = focusStyle.outline}
          onBlur={(e) => e.target.style.outline = 'none'}
        >Fechar</button>
      </div>
    </div>
  );
};

// =========================================================================
// 🔒 PAINEL DE ADMIN (Header e Nav ajustados)
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

  // Funções de carregamento e manipulação mantidas inalteradas...
  const carregarDashboard = async () => { try { const data = await fetchAPI('/admin/dashboard'); setDashboardData(data.data); } catch (e) { console.error(e); }};
  const carregarPedidos = async () => { try { const res = await fetchAPI('/admin/pedidos'); setPedidos(res.data || []); } catch (e) { console.error(e); setPedidos([]); }};
  const carregarProdutos = async () => { try { const res = await fetchAPI('/admin/produtos'); setProdutos(res.data || []); const catRes = await fetchAPI('/admin/categorias'); setCategorias(catRes.data || []); } catch (e) { console.error(e); setProdutos([]); }};
  const carregarMesas = async () => { try { const res = await fetchAPI('/admin/mesas'); setMesas(res.data || []); } catch (e) { console.error(e); setMesas([]); }};
  const carregarConfiguracoes = async () => { try { const data = await fetchAPI('/admin/configuracoes'); if (data.data) { setConfiguracoes(data.data); setFormConfig(data.data); }} catch (e) { console.error(e); }};
  const carregarExpedienteStatus = async () => { try { const data = await fetchAPI('/admin/expediente/status'); setExpedienteStatus(data.data); } catch (e) { console.error(e); }};
  const handleConfigSubmit = async (e) => { e.preventDefault(); try { await fetchAPI('/admin/configuracoes', { method: 'PUT', body: formConfig }); alert('✅ Configurações salvas!'); setMostrarModalConfig(false); carregarConfiguracoes(); } catch (e) { alert('❌ Erro: ' + e.message); }};
  const atualizarStatusPedido = async (id, status) => { try { await fetchAPI(`/admin/pedidos/${id}/status`, { method: 'PUT', body: { status } }); alert(`✅ Pedido #${id} atualizado!`); carregarPedidos(); } catch (e) { alert('❌ Erro: ' + e.message); }};
  const cancelarPedido = async (id) => { if (window.confirm('Certeza?')) { try { await fetchAPI(`/admin/pedidos/${id}/cancelar`, { method: 'POST' }); alert(`✅ Pedido #${id} cancelado!`); carregarPedidos(); } catch (e) { alert('❌ Erro: ' + e.message); }}};
  const pagarContaMesa = async (id) => { if (window.confirm('Confirmar pagamento?')) { try { await fetchAPI(`/admin/mesas/${id}/pagar-conta`, { method: 'POST' }); alert(`✅ Conta paga!`); carregarMesas(); carregarDashboard(); } catch (e) { alert('❌ Erro: ' + e.message); }}};
  const liberarMesa = async (id) => { if (window.confirm('Liberar esta mesa?')) { try { await fetchAPI(`/admin/mesas/${id}/liberar`, { method: 'POST' }); alert(`✅ Mesa liberada!`); carregarMesas(); } catch (e) { alert('❌ Erro: ' + e.message); }}};
  const abrirModalProduto = (produto = null) => { setProdutoEditando(produto); setMostrarModalProduto(true); };
  const salvarProduto = async (produtoData) => { try { const url = produtoEditando ? `/admin/produtos/${produtoEditando.id}` : '/admin/produtos'; const method = produtoEditando ? 'PUT' : 'POST'; await fetchAPI(url, { method, body: produtoData }); alert('✅ Produto salvo!'); setMostrarModalProduto(false); carregarProdutos(); } catch (e) { alert('❌ Erro: ' + e.message); }};
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
      await carregarMesas(); 
      setCarregando(false);
    };
    carregarDadosIniciais();
  }, []); 

  useEffect(() => {
    
    if (paginaAtiva === 'dashboard') {
      carregarDashboard(); 
      carregarMesas();      
    }
    if (paginaAtiva === 'pedidos') carregarPedidos();
    if (paginaAtiva === 'produtos') carregarProdutos();
    if (paginaAtiva === 'mesas') carregarMesas();
    
  }, [paginaAtiva]); 

  const ControleExpediente = () => (
    <div style={estilos.card}>
      <h3 style={{ marginBottom: '15px' }}>🕒 Controle de Expediente</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {expedienteStatus && !expedienteStatus.expediente_aberto ? (
          <button 
            onClick={abrirExpediente} 
            style={{ ...estilos.button, ...estilos.buttonSuccess }}
            onFocus={(e) => e.target.style.outline = focusStyle.outline}
            onBlur={(e) => e.target.style.outline = 'none'}
          >🟢 Iniciar</button>
        ) : (
          <button 
            onClick={fecharExpediente} 
            style={{ ...estilos.button, ...estilos.buttonDanger }}
            onFocus={(e) => e.target.style.outline = focusStyle.outline}
            onBlur={(e) => e.target.style.outline = 'none'}
          >🔴 Fechar</button>
        )}
        <button 
          onClick={() => setMostrarModalConfig(true)} 
          style={{ ...estilos.button, ...estilos.buttonPrimary }}
          onFocus={(e) => e.target.style.outline = focusStyle.outline}
          onBlur={(e) => e.target.style.outline = 'none'}
        >⚙️ Configs</button>
        <button 
          onClick={reiniciarSistema} 
          style={{ ...estilos.button, ...estilos.buttonWarning }}
          onFocus={(e) => e.target.style.outline = focusStyle.outline}
          onBlur={(e) => e.target.style.outline = 'none'}
        >🔄 Reiniciar</button>
      </div>
    </div>
  );

  return (
      <div style={estilos.container}>
        <header style={estilos.header}>
          {/* ⚡️ AJUSTADO: Nome do estabelecimento e boas-vindas */}
          <div style={{ flexGrow: 1 }}>
            <h1 style={{ margin: 0 }}>🍔 {configuracoes?.nome_estabelecimento || "Painel Admin"}</h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.8 }}>Bem-vindo, {user.name}!</p>
          </div>
          {/* ⚡️ AJUSTADO: Botão Sair com espaçamento (marginLeft) */}
          <button 
            onClick={onLogout} 
            style={{ ...estilos.navButton, backgroundColor: '#c82333', marginLeft: '20px' }}
            onFocus={(e) => e.target.style.outline = focusStyle.outline}
            onBlur={(e) => e.target.style.outline = 'none'}
          >Sair</button>
        </header>

        {/* ⚡️ NOVO CONTAINER: Mantém o azul e integra a navegação */}
        <div style={estilos.navContainer}>
          <nav style={estilos.nav}>
            <button 
              onClick={() => setPaginaAtiva('dashboard')} 
              style={paginaAtiva === 'dashboard' ? estilos.navButtonAtivo : estilos.navButton}
              onFocus={(e) => e.target.style.outline = focusStyle.outline}
              onBlur={(e) => e.target.style.outline = 'none'}
            >📊 Dashboard</button>
            <button 
              onClick={() => setPaginaAtiva('pedidos')} 
              style={paginaAtiva === 'pedidos' ? estilos.navButtonAtivo : estilos.navButton}
              onFocus={(e) => e.target.style.outline = focusStyle.outline}
              onBlur={(e) => e.target.style.outline = 'none'}
            >📦 Pedidos</button>
            <button 
              onClick={() => setPaginaAtiva('produtos')} 
              style={paginaAtiva === 'produtos' ? estilos.navButtonAtivo : estilos.navButton}
              onFocus={(e) => e.target.style.outline = focusStyle.outline}
              onBlur={(e) => e.target.style.outline = 'none'}
            >🍔 Produtos</button>
            <button 
              onClick={() => setPaginaAtiva('mesas')} 
              style={paginaAtiva === 'mesas' ? estilos.navButtonAtivo : estilos.navButton}
              onFocus={(e) => e.target.style.outline = focusStyle.outline}
              onBlur={(e) => e.target.style.outline = 'none'}
            >🪑 Mesas</button>
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

        <ModalConfiguracoes mostrar={mostrarModalConfig} onClose={() => setMostrarModalConfig(false)} form={formConfig} setForm={setFormConfig} onSubmit={handleConfigSubmit} />
        <ModalProduto mostrar={mostrarModalProduto} onClose={() => setMostrarModalProduto(false)} produto={produtoEditando} onSubmit={salvarProduto} categorias={categorias} />
        <ModalRelatorioDia mostrar={mostrarModalExpediente} onClose={() => setMostrarModalExpediente(false)} relatorio={expedienteStatus} />
      </div>
    );

  }

// =========================================================================
// 🚀 COMPONENTE PRINCIPAL APP
// =========================================================================

function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false); 

  useEffect(() => {
    console.log('🚀 Aplicação iniciada - aguardando login...');
    setLoadingAuth(false);
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    console.log('✅ Login bem-sucedido no App:', loggedInUser);
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Fazendo logout...');
      await getCsrfToken();
      await fetchAPI('/logout', { method: 'POST' });
      console.log('✅ Logout realizado');
    } catch (err) {
      console.error('❌ Erro no logout:', err);
    } finally {
      setUser(null);
    }
  };

  if (loadingAuth) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        backgroundColor: '#f0f2f5'
      }}>
        <p>Verificando autenticação...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return <AdminPanel user={user} onLogout={handleLogout} />;
}

export default App;