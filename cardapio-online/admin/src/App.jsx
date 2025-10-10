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

    return await response.json();
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

  // Carregar dados do dashboard
  const carregarDashboard = async () => {
    try {
      setCarregando(true);
      const data = await fetchAPI('/admin/dashboard');
      setDashboardData(data.data); // Acessa a propriedade data
    } catch (erro) {
      console.error('Erro ao carregar dashboard:', erro);
      alert('Erro ao carregar dashboard');
    } finally {
      setCarregando(false);
    }
  };

  // Carregar pedidos
  const carregarPedidos = async () => {
    try {
      setCarregando(true);
      const data = await fetchAPI('/admin/pedidos');
      setPedidos(data);
    } catch (erro) {
      console.error('Erro ao carregar pedidos:', erro);
      alert('Erro ao carregar pedidos');
    } finally {
      setCarregando(false);
    }
  };

  // Carregar produtos
  const carregarProdutos = async () => {
    try {
      setCarregando(true);
      const data = await fetchAPI('/admin/produtos');
      setProdutos(data);
    } catch (erro) {
      console.error('Erro ao carregar produtos:', erro);
      alert('Erro ao carregar produtos');
    } finally {
      setCarregando(false);
    }
  };

  // Carregar mesas
  const carregarMesas = async () => {
    try {
      setCarregando(true);
      const data = await fetchAPI('/mesas');
      setMesas(data);
    } catch (erro) {
      console.error('Erro ao carregar mesas:', erro);
      alert('Erro ao carregar mesas');
    } finally {
      setCarregando(false);
    }
  };

  // Atualizar status do pedido
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

  // Pagar conta da mesa
  const pagarContaMesa = async (mesaId) => {
    try {
      await fetchAPI(`/mesas/${mesaId}/pagar-conta`, {
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

  // Carregar dados quando mudar de página
  useEffect(() => {
    switch (paginaAtiva) {
      case 'dashboard':
        carregarDashboard();
        carregarMesas();
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
      marginTop: '15px'
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
    buttonDanger: { backgroundColor: '#dc3545', color: 'white' }
  };

  // Componente do Dashboard
  const Dashboard = () => {
    if (!dashboardData) return <div>Carregando...</div>;

    return (
      <div>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>📊 Dashboard</h2>
        
        <div style={estilos.grid}>
          <div style={estilos.statCard}>
            <h3 style={{ color: '#007bff', margin: '0 0 10px 0' }}>🛒 Pedidos Hoje</h3>
            <p style={{ fontSize: '2em', fontWeight: 'bold', margin: 0 }}>{dashboardData.pedidos_hoje}</p>
          </div>
          
          <div style={estilos.statCard}>
            <h3 style={{ color: '#ff6b35', margin: '0 0 10px 0' }}>⏳ Pendentes</h3>
            <p style={{ fontSize: '2em', fontWeight: 'bold', margin: 0 }}>{dashboardData.pedidos_pendentes}</p>
          </div>
          
          <div style={estilos.statCard}>
            <h3 style={{ color: '#28a745', margin: '0 0 10px 0' }}>👨‍🍳 Preparando</h3>
            <p style={{ fontSize: '2em', fontWeight: 'bold', margin: 0 }}>{dashboardData.pedidos_preparando}</p>
          </div>
          
          <div style={estilos.statCard}>
            <h3 style={{ color: '#6f42c1', margin: '0 0 10px 0' }}>🪑 Mesas Ocupadas</h3>
            <p style={{ fontSize: '2em', fontWeight: 'bold', margin: 0 }}>{dashboardData.mesas_ocupadas}</p>
          </div>
        </div>

        <div style={estilos.card}>
          <h3 style={{ marginBottom: '15px' }}>🪑 Mesas Atuais</h3>
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
                    ...(mesa.status === 'livre' ? estilos.badgeSuccess : 
                         mesa.status === 'ocupada' ? estilos.badgeWarning : 
                         estilos.badgeDanger)
                  }}>
                    {mesa.status}
                  </span>
                </p>
                {mesa.cliente_nome && (
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    <strong>Cliente:</strong> {mesa.cliente_nome}
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
                    {mesa.status_pagamento}
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
        </div>
      </div>
    );
  };

  // Componente de Pedidos
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
          <table style={estilos.table}>
            <thead>
              <tr>
                <th style={estilos.th}>ID</th>
                <th style={estilos.th}>Mesa</th>
                <th style={estilos.th}>Cliente</th>
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
                  <td style={estilos.td}>Mesa {pedido.mesa_numero}</td>
                  <td style={estilos.td}>{pedido.cliente_nome || 'N/A'}</td>
                  <td style={estilos.td}>R$ {Number(pedido.total).toFixed(2)}</td>
                  <td style={estilos.td}>
                    <span style={getBadgeStyle(pedido.status)}>
                      {pedido.status}
                    </span>
                  </td>
                  <td style={estilos.td}>
                    {new Date(pedido.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td style={estilos.td}>
                    {pedido.status === 'pendente' && (
                      <button
                        onClick={() => atualizarStatusPedido(pedido.id, 'preparando')}
                        style={{ ...estilos.button, ...estilos.buttonPrimary }}
                      >
                        👨‍🍳 Preparar
                      </button>
                    )}
                    {pedido.status === 'preparando' && (
                      <button
                        onClick={() => atualizarStatusPedido(pedido.id, 'pronto')}
                        style={{ ...estilos.button, ...estilos.buttonSuccess }}
                      >
                        ✅ Pronto
                      </button>
                    )}
                    {pedido.status === 'pronto' && (
                      <button
                        onClick={() => atualizarStatusPedido(pedido.id, 'entregue')}
                        style={{ ...estilos.button, ...estilos.buttonWarning }}
                      >
                        🎉 Entregue
                      </button>
                    )}
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
              
              <p><strong>Mesa:</strong> {pedidoSelecionado.mesa_numero}</p>
              <p><strong>Cliente:</strong> {pedidoSelecionado.cliente_nome || 'N/A'}</p>
              <p><strong>Total:</strong> R$ {Number(pedidoSelecionado.total).toFixed(2)}</p>
              <p><strong>Status:</strong> {pedidoSelecionado.status}</p>
              <p><strong>Data:</strong> {new Date(pedidoSelecionado.created_at).toLocaleString('pt-BR')}</p>
              
              <h4 style={{ marginTop: '20px' }}>Itens do Pedido:</h4>
              <ul>
                {pedidoSelecionado.itens && pedidoSelecionado.itens.map((item, index) => (
                  <li key={index}>
                    {item.quantidade}x {item.produto_nome} - R$ {Number(item.preco_unitario).toFixed(2)} cada
                    {item.observacoes && ` (${item.observacoes})`}
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => window.print()}
                style={{ ...estilos.button, ...estilos.buttonPrimary, marginTop: '20px' }}
              >
                🖨️ Imprimir para Cozinha
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

 // Componente de Produtos
const Produtos = () => {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria_id: '',
    disponivel: true,
    imagem: ''
  });

  // Carregar categorias para o select
  const carregarCategorias = async () => {
    try {
      const data = await fetchAPI('/admin/categorias');
      setCategorias(data);
    } catch (erro) {
      console.error('Erro ao carregar categorias:', erro);
    }
  };

  // Abrir formulário para novo produto
  const abrirFormNovoProduto = () => {
    setFormData({
      nome: '',
      descricao: '',
      preco: '',
      categoria_id: '',
      disponivel: true,
      imagem: ''
    });
    setProdutoEditando(null);
    setMostrarForm(true);
  };

  // Abrir formulário para editar produto
  const abrirFormEditarProduto = (produto) => {
    setFormData({
      nome: produto.nome,
      descricao: produto.descricao || '',
      preco: produto.preco,
      categoria_id: produto.categoria_id,
      disponivel: produto.disponivel,
      imagem: produto.imagem || ''
    });
    setProdutoEditando(produto);
    setMostrarForm(true);
  };

  // Fechar formulário
  const fecharForm = () => {
    setMostrarForm(false);
    setProdutoEditando(null);
  };

  // Manipular mudanças no formulário
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Submeter formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setCarregando(true);

      if (produtoEditando) {
        // Editar produto existente
        await fetchAPI(`/admin/produtos/${produtoEditando.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        alert('✅ Produto atualizado com sucesso!');
      } else {
        // Criar novo produto
        await fetchAPI('/admin/produtos', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        alert('✅ Produto criado com sucesso!');
      }

      fecharForm();
      carregarProdutos(); // Recarregar lista
    } catch (erro) {
      console.error('Erro ao salvar produto:', erro);
      alert('❌ Erro ao salvar produto');
    } finally {
      setCarregando(false);
    }
  };

  // Excluir produto
  const excluirProduto = async (produtoId, produtoNome) => {
    if (window.confirm(`Tem certeza que deseja excluir o produto "${produtoNome}"?`)) {
      try {
        await fetchAPI(`/admin/produtos/${produtoId}`, {
          method: 'DELETE'
        });
        alert('✅ Produto excluído com sucesso!');
        carregarProdutos(); // Recarregar lista
      } catch (erro) {
        console.error('Erro ao excluir produto:', erro);
        alert('❌ Erro ao excluir produto');
      }
    }
  };

  // Toggle disponibilidade
  const toggleDisponibilidade = async (produto) => {
    try {
      await fetchAPI(`/admin/produtos/${produto.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          disponivel: !produto.disponivel
        })
      });
      alert(`✅ Produto ${!produto.disponivel ? 'ativado' : 'desativado'} com sucesso!`);
      carregarProdutos(); // Recarregar lista
    } catch (erro) {
      console.error('Erro ao atualizar produto:', erro);
      alert('❌ Erro ao atualizar produto');
    }
  };

  // Carregar categorias quando o componente montar
  useEffect(() => {
    carregarCategorias();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#333', margin: 0 }}>🍔 Produtos</h2>
        <button
          onClick={abrirFormNovoProduto}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          ➕ Novo Produto
        </button>
      </div>

      {/* Formulário Modal */}
      {mostrarForm && (
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
              <h3>{produtoEditando ? '✏️ Editar Produto' : '➕ Novo Produto'}</h3>
              <button
                onClick={fecharForm}
                style={{ backgroundColor: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  name="preco"
                  value={formData.preco}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Categoria *
                </label>
                <select
                  name="categoria_id"
                  value={formData.categoria_id}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  URL da Imagem
                </label>
                <input
                  type="url"
                  name="imagem"
                  value={formData.imagem}
                  onChange={handleInputChange}
                  placeholder="https://exemplo.com/imagem.jpg"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    name="disponivel"
                    checked={formData.disponivel}
                    onChange={handleInputChange}
                  />
                  <span style={{ fontWeight: 'bold' }}>Produto disponível</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={fecharForm}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={carregando}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    cursor: carregando ? 'not-allowed' : 'pointer',
                    opacity: carregando ? 0.6 : 1
                  }}
                >
                  {carregando ? 'Salvando...' : (produtoEditando ? 'Atualizar' : 'Criar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Produtos */}
      <div style={estilos.card}>
        {produtos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>Nenhum produto cadastrado.</p>
            <button
              onClick={abrirFormNovoProduto}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
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
                <th style={estilos.th}>Categoria</th>
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
                    {produto.imagem && (
                      <div style={{ marginTop: '5px' }}>
                        <img 
                          src={produto.imagem} 
                          alt={produto.nome}
                          style={{ 
                            width: '50px', 
                            height: '50px', 
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </td>
                  <td style={estilos.td}>{produto.descricao || '-'}</td>
                  <td style={estilos.td}>{produto.categoria_nome}</td>
                  <td style={estilos.td}>
                    <strong>R$ {Number(produto.preco).toFixed(2)}</strong>
                  </td>
                  <td style={estilos.td}>
                    <button
                      onClick={() => toggleDisponibilidade(produto)}
                      style={{
                        ...estilos.badge,
                        ...(produto.disponivel ? estilos.badgeSuccess : estilos.badgeDanger),
                        cursor: 'pointer',
                        border: 'none'
                      }}
                    >
                      {produto.disponivel ? '✅ Sim' : '❌ Não'}
                    </button>
                  </td>
                  <td style={estilos.td}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <button 
                        onClick={() => abrirFormEditarProduto(produto)}
                        style={{ ...estilos.button, ...estilos.buttonPrimary }}
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        onClick={() => excluirProduto(produto.id, produto.nome)}
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
                            ...(mesa.status === 'livre' ? estilos.badgeSuccess : 
                                 mesa.status === 'ocupada' ? estilos.badgeWarning : 
                                 estilos.badgeDanger)
                          }}>
                            {mesa.status}
                          </span>
                        </p>
                        {mesa.cliente_nome && (
                          <p style={{ margin: '5px 0', fontSize: '14px' }}>
                            <strong>Cliente:</strong> {mesa.cliente_nome}
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
                            {mesa.status_pagamento}
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
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;