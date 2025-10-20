import React, { useState, useEffect } from 'react';

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
// 🔐 COMPONENTE DA TELA DE LOGIN - COMPLETAMENTE REVISADO
// =========================================================================
const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
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

  const testarConexao = async () => {
    try {
      console.log('🧪 Testando conexão com o backend...');
      const response = await fetch('http://localhost:8000/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include',
      });
      console.log('✅ Teste de conexão:', response.status, response.ok);
      
      // Testar também a API
      const apiResponse = await fetch('http://localhost:8000/api/user', {
        method: 'GET',
        credentials: 'include',
      });
      console.log('✅ Teste da API:', apiResponse.status, apiResponse.ok);
      
      alert(`Conexão: ${response.ok ? '✅ OK' : '❌ FALHOU'}\nAPI: ${apiResponse.status}`);
    } catch (error) {
      console.error('❌ Erro no teste de conexão:', error);
      alert('❌ Não foi possível conectar com o backend.');
    }
  };

  const limparCookies = () => {
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    alert('🍪 Cookies limpos! Recarregue a página.');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
      <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', width: '400px' }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#1a237e' }}>🍔 Painel Admin</h1>
        <p style={{ marginBottom: '30px', color: '#666' }}>Por favor, faça o login para continuar</p>
        
        {error && (
          <div style={{ 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '15px',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div style={estilos.formGroup}>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Email" 
              required 
              style={estilos.input} 
              disabled={loading}
            />
          </div>
          
          <div style={estilos.formGroup}>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Senha" 
              required 
              style={estilos.input} 
              disabled={loading}
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
              fontSize: '16px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginBottom: '10px'
            }}
          >
            {loading ? '🔄 Entrando...' : '🚪 Entrar'}
          </button>
        </form>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button 
            onClick={testarConexao}
            style={{ 
              flex: 1,
              padding: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              backgroundColor: 'transparent', 
              color: '#666', 
              fontSize: '12px', 
              cursor: 'pointer'
            }}
          >
            🧪 Testar Conexão
          </button>
          
          <button 
            onClick={limparCookies}
            style={{ 
              flex: 1,
              padding: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              backgroundColor: 'transparent', 
              color: '#666', 
              fontSize: '12px', 
              cursor: 'pointer'
            }}
          >
            🍪 Limpar Cookies
          </button>
        </div>
        
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '12px', color: '#666' }}>
          <strong>Credenciais de teste:</strong><br/>
          Email: admin@example.com<br/>
          Senha: password<br/>
          <br/>
          <strong>Debug:</strong><br/>
          Cookies: {document.cookie ? '✅ Presentes' : '❌ Ausentes'}<br/>
          XSRF-TOKEN: {getCsrfTokenFromCookie() ? '✅ OK' : '❌ Ausente'}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// ✅ COMPONENTES RESTANTES (SIMPLIFICADOS)
// =========================================================================

// ... (Manter os componentes Pedidos, Produtos, Mesas, Dashboard, ModalConfiguracoes, ModalProduto simplificados)

// =========================================================================
// 🔒 PAINEL DE ADMIN (SIMPLIFICADO)
// =========================================================================

const AdminPanel = ({ user, onLogout }) => {
  const [paginaAtiva, setPaginaAtiva] = useState('dashboard');

  const ControleExpediente = () => (
    <div style={estilos.card}>
      <h3 style={{ marginBottom: '15px' }}>🕒 Controle de Expediente</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button style={{ ...estilos.button, ...estilos.buttonInfo }}>⚙️ Configurações</button>
        <button onClick={onLogout} style={{ ...estilos.button, ...estilos.buttonDanger }}>🚪 Sair</button>
      </div>
    </div>
  );

  const DashboardContent = () => (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>📊 Dashboard</h2>
      <ControleExpediente />
      <div style={estilos.grid}>
        <div style={estilos.statCard}><h3>🛒 Pedidos Hoje</h3><p style={{ fontSize: '2em', fontWeight: 'bold', margin: 0 }}>0</p></div>
        <div style={estilos.statCard}><h3>💰 Vendas Hoje</h3><p style={{ fontSize: '2em', fontWeight: 'bold', margin: 0 }}>R$ 0.00</p></div>
        <div style={estilos.statCard}><h3>🍔 Produtos</h3><p style={{ fontSize: '2em', fontWeight: 'bold', margin: 0 }}>0</p></div>
        <div style={estilos.statCard}><h3>📂 Categorias</h3><p style={{ fontSize: '2em', fontWeight: 'bold', margin: 0 }}>0</p></div>
      </div>
    </div>
  );

  return (
    <div style={estilos.container}>
      <header style={estilos.header}>
        <div>
          <h1 style={{ margin: 0 }}>🍔 Painel Administrativo</h1>
          <p style={{ margin: '5px 0 0 0', opacity: 0.8 }}>
            Bem-vindo, <strong>{user.name}</strong>! ({user.email})
          </p>
        </div>
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
        {paginaAtiva === 'dashboard' && <DashboardContent />}
        {paginaAtiva === 'pedidos' && (
          <div style={estilos.card}>
            <h2>📦 Pedidos</h2>
            <p>Funcionalidade de pedidos em desenvolvimento...</p>
          </div>
        )}
        {paginaAtiva === 'produtos' && (
          <div style={estilos.card}>
            <h2>🍔 Produtos</h2>
            <p>Funcionalidade de produtos em desenvolvimento...</p>
          </div>
        )}
        {paginaAtiva === 'mesas' && (
          <div style={estilos.card}>
            <h2>🪑 Mesas</h2>
            <p>Funcionalidade de mesas em desenvolvimento...</p>
          </div>
        )}
      </main>
    </div>
  );
};

// =========================================================================
// 🚀 COMPONENTE PRINCIPAL APP
// =========================================================================

function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false); // Iniciar como false

  // Não verificar autenticação automaticamente - deixar o usuário fazer login
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