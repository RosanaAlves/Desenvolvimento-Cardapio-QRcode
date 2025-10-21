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
  },
  fontSizes: {
    xs: '0.875rem', sm: '1rem', base: '1.125rem', lg: '1.25rem', xl: '1.5rem',
    '2xl': '1.875rem', '3xl': '2.25rem', '4xl': '3rem',
  },
  spacing: {
    xs: '8px', sm: '12px', md: '16px', lg: '20px', xl: '24px',
    '2xl': '32px', '3xl': '48px', '4xl': '64px'
  },
  botao: { minHeight: '60px', minWidth: '120px', padding: '16px 24px' },
  breakpoints: {
    sm: '640px', md: '768px', lg: '1024px',
  }
};

const estilosBase = {
  container: {
    minHeight: '100vh',
    padding: designSystem.spacing['2xl'],
    backgroundColor: designSystem.cores.fundo,
    fontFamily: 'Inter, sans-serif',
  },
  card: {
    backgroundColor: designSystem.cores.card,
    borderRadius: '16px',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
    padding: designSystem.spacing['2xl'],
    marginBottom: designSystem.spacing['2xl'],
  },
  titulo: {
    color: designSystem.cores.primaria,
    textAlign: 'center',
    marginBottom: designSystem.spacing['3xl'],
    fontSize: designSystem.fontSizes['3xl'],
  },
  texto: {
    color: designSystem.cores.texto,
  },
  botao: {
    transition: 'background-color 0.3s ease, transform 0.1s ease',
    userSelect: 'none',
    border: 'none',
  },
  grid: {
    display: 'grid',
    gap: designSystem.spacing.md,
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    marginBottom: designSystem.spacing['2xl'],
  }
};

// =========================================================================
// VARIÁVEIS DE AMBIENTE
// =========================================================================
const API_BASE_URL = window.location.origin + '/api';

// =========================================================================
// COMPONENTE DE ENTRADA DE NOME (SUBSTITUI O LOGIN)
// =========================================================================
const GarcomNameInput = ({ setGarcomNome }) => {
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');

  const handleSetNome = () => {
    if (nome.trim().length < 2) {
      setErro('Por favor, digite seu nome completo ou apelido.');
      return;
    }
    localStorage.setItem('garcom_nome', nome.trim());
    setGarcomNome(nome.trim());
  };

  return (
    <div style={{ 
      ...estilosBase.card, 
      maxWidth: '400px', 
      margin: '80px auto', 
      textAlign: 'center' 
    }}>
      <h2 style={{ color: designSystem.cores.primaria, fontSize: designSystem.fontSizes['2xl'] }}>
        Identificação do Garçom
      </h2>
      <p style={{ ...estilosBase.texto, marginBottom: designSystem.spacing.lg }}>
        Digite seu nome para começar o atendimento.
      </p>
      <input
        type="text"
        placeholder="Seu Nome/Apelido"
        value={nome}
        onChange={(e) => {
          setNome(e.target.value);
          setErro('');
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSetNome();
        }}
        style={{ width: '100%', padding: designSystem.spacing.md, margin: `${designSystem.spacing.md} 0`, borderRadius: '8px', border: `1px solid ${designSystem.cores.borda}` }}
      />
      
      <button
        onClick={handleSetNome}
        style={{ 
          ...estilosBase.botao,
          width: '100%',
          backgroundColor: designSystem.cores.secundaria,
          color: designSystem.cores.textoClaro,
          padding: designSystem.spacing.md,
          borderRadius: '8px',
          marginTop: designSystem.spacing.md,
          cursor: 'pointer'
        }}
      >
        Iniciar Atendimento
      </button>
      {erro && <p style={{ color: designSystem.cores.perigo, marginTop: designSystem.spacing.md }}>{erro}</p>}
    </div>
  );
};

// =========================================================================
// COMPONENTE PRINCIPAL
// =========================================================================
export default function App() {
  // 🔥 ESTADO DE IDENTIFICAÇÃO (SEM AUTENTICAÇÃO)
  const [garcomNome, setGarcomNome] = useState(localStorage.getItem('garcom_nome') || null);

  const [cardapio, setCardapio] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [mesaSelecionada, setMesaSelecionada] = useState(null);
  const [carrinho, setCarrinho] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [observacoes, setObservacoes] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [enviandoPedido, setEnviandoPedido] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);

  // -----------------------------------------------------------------------
  // FUNÇÕES DE UTILIDADE
  // -----------------------------------------------------------------------
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    // ✅ Token removido - APIs do Garçom agora são públicas
  });

  const limparMensagens = () => {
    setMensagemErro('');
    setMensagemSucesso('');
  };

  const formatarMoeda = (valor) => {
    if (typeof valor !== 'number') return 'R$ 0,00';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const calcularTotalCarrinho = () => {
    return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  };

  // -----------------------------------------------------------------------
  // FUNÇÕES DE API (AGORA PÚBLICAS)
  // -----------------------------------------------------------------------

  // ✅ BUSCAR MESAS (PÚBLICA)
  const buscarMesas = async () => {
    if (!garcomNome) return;
    try {
      const response = await fetch(`${API_BASE_URL}/garcom/mesas/status`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setMesas(data.data);
      } else {
        setMensagemErro(data.message || 'Erro ao carregar mesas.');
      }
    } catch (error) {
      console.error('Erro ao buscar mesas:', error);
      setMensagemErro('Falha na comunicação ao buscar mesas.');
    }
  };

  // ✅ BUSCAR CARDÁPIO (PÚBLICO)
  const buscarCardapio = async () => {
    if (!garcomNome) return;
    setCarregandoDados(true);
    limparMensagens();
    try {
      const response = await fetch(`${API_BASE_URL}/garcom/cardapio/categorias`, {
        headers: getHeaders()
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCardapio(data.data);
      } else {
        setMensagemErro(data.message || 'Erro ao carregar cardápio.');
      }
    } catch (error) {
      console.error('Erro ao buscar cardápio:', error);
      setMensagemErro('Falha na comunicação ao buscar cardápio.');
    } finally {
      setCarregandoDados(false);
    }
  };

  // ✅ FINALIZAR PEDIDO (PÚBLICO, REQUER NOME NO BODY)
  const finalizarPedido = async () => {
    if (carrinho.length === 0 || !mesaSelecionada || !garcomNome) {
      setMensagemErro('Selecione a mesa, adicione itens e certifique-se de ter um nome registrado.');
      return;
    }

    setEnviandoPedido(true);
    limparMensagens();

    const pedidoData = {
      mesa_id: mesaSelecionada,
      // ✅ ENVIA O NOME DO GARÇOM REGISTRADO
      garcom_nome: garcomNome, 
      itens: carrinho.map(item => ({
        produto_id: item.id,
        quantidade: item.quantidade,
        observacoes: item.observacoes,
      }))
    };

    try {
      const response = await fetch(`${API_BASE_URL}/garcom/pedidos`, {
        method: 'POST',
        headers: getHeaders(), 
        body: JSON.stringify(pedidoData)
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        setMensagemSucesso(`Pedido enviado com sucesso para a Mesa ${mesaSelecionada} pelo Garçom ${garcomNome}!`);
        setCarrinho([]);
        setMesaSelecionada(null);
        buscarMesas(); 
      } else {
        setMensagemErro(data.message || `Erro ao enviar pedido: ${data.error || 'Verifique o console.'}`);
      }
    } catch (error) {
      console.error('Erro de rede ao finalizar pedido:', error);
      setMensagemErro('Falha na comunicação com o servidor.');
    } finally {
      setEnviandoPedido(false);
    }
  };
  
  // -----------------------------------------------------------------------
  // EFEITOS DE RENDERIZAÇÃO
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (garcomNome) {
      buscarCardapio();
      buscarMesas();
      // Configura polling para atualizar o status das mesas a cada 10s
      const interval = setInterval(buscarMesas, 10000); 
      return () => clearInterval(interval);
    } else {
        setCarregandoDados(false); // Pronto para mostrar a tela de entrada de nome
    }
  }, [garcomNome]); 

  // -----------------------------------------------------------------------
  // LÓGICA DO CARRINHO E MODAL
  // -----------------------------------------------------------------------

  const abrirModal = (produto) => {
    // Implementação da lógica de modal
    setItemSelecionado(produto);
    setQuantidade(1);
    setObservacoes('');
    setModalAberto(true);
  };

  const adicionarAoCarrinho = () => {
    // Implementação da lógica de adicionar ao carrinho
    if (quantidade < 1) {
      setMensagemErro('A quantidade deve ser no mínimo 1.');
      return;
    }

    const itemExistenteIndex = carrinho.findIndex(
      (item) => item.id === itemSelecionado.id && item.observacoes === observacoes
    );

    if (itemExistenteIndex > -1) {
      const novoCarrinho = [...carrinho];
      novoCarrinho[itemExistenteIndex].quantidade += quantidade;
      setCarrinho(novoCarrinho);
    } else {
      setCarrinho([
        ...carrinho,
        {
          ...itemSelecionado,
          quantidade,
          observacoes,
          produto_id: itemSelecionado.id
        },
      ]);
    }

    setModalAberto(false);
  };
  
  const removerDoCarrinho = (index) => {
    const novoCarrinho = carrinho.filter((_, i) => i !== index);
    setCarrinho(novoCarrinho);
  };

  // -----------------------------------------------------------------------
  // RENDERIZAÇÃO
  // -----------------------------------------------------------------------

  if (!garcomNome) {
    return <GarcomNameInput setGarcomNome={setGarcomNome} />;
  }

  return (
    <div style={estilosBase.container}>
      
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingBottom: designSystem.spacing.md,
        borderBottom: `1px solid ${designSystem.cores.borda}`
      }}>
        <h1 style={estilosBase.titulo}>Jetro's Lanches</h1>
        <div style={{ textAlign: 'right' }}>
            <p style={{ ...estilosBase.texto, margin: 0, fontSize: designSystem.fontSizes.lg }}>
                Garçom: <strong style={{ color: designSystem.cores.primaria }}>{garcomNome}</strong>
            </p>
            <button 
                onClick={() => {
                    localStorage.removeItem('garcom_nome');
                    setGarcomNome(null);
                }}
                style={{ 
                    ...estilosBase.botao, 
                    backgroundColor: designSystem.cores.perigo, 
                    color: designSystem.cores.textoClaro, 
                    padding: designSystem.spacing.xs, 
                    borderRadius: '4px',
                    marginTop: designSystem.spacing.xs,
                    fontSize: designSystem.fontSizes.xs
                }}
            >
                Trocar Garçom
            </button>
        </div>
      </header>
      
      {/* MENSAGENS DE FEEDBACK */}
      <div style={{ margin: `${designSystem.spacing.md} 0` }}>
        {mensagemErro && (
          <div style={{ ...estilosBase.card, backgroundColor: designSystem.cores.perigo, color: designSystem.cores.textoClaro }}>
            {mensagemErro}
          </div>
        )}
        {mensagemSucesso && (
          <div style={{ ...estilosBase.card, backgroundColor: designSystem.cores.sucesso, color: designSystem.cores.textoClaro }}>
            {mensagemSucesso}
          </div>
        )}
      </div>

      {carregandoDados && (
        <p style={{ ...estilosBase.texto, textAlign: 'center', fontSize: designSystem.fontSizes.xl }}>
          Carregando Cardápio e Mesas...
        </p>
      )}

      {/* SELEÇÃO DE MESA */}
      <div style={estilosBase.card}>
        <h2 style={{ ...estilosBase.titulo, marginBottom: designSystem.spacing.md }}>
            1. Selecione a Mesa ({mesaSelecionada ? `Mesa ${mesaSelecionada}` : 'Nenhuma'})
        </h2>
        
        <div style={estilosBase.grid}>
          {mesas.map((mesa) => {
            const isOcupada = mesa.status === 'ocupada';
            const isSelecionada = mesa.id === mesaSelecionada;
            
            let corMesa = designSystem.cores.secundaria; // Livre
            if (isOcupada) {
                corMesa = designSystem.cores.perigo; // Ocupada
            }
            if (isSelecionada) {
                corMesa = designSystem.cores.aviso; // Selecionada
            }

            return (
              <button
                key={mesa.id}
                onClick={() => setMesaSelecionada(mesa.id)}
                style={{
                  ...estilosBase.botao,
                  backgroundColor: corMesa,
                  color: designSystem.cores.textoClaro,
                  padding: designSystem.spacing.lg,
                  borderRadius: '12px',
                  border: isSelecionada ? `4px solid ${designSystem.cores.primaria}` : 'none',
                  opacity: isOcupada && !isSelecionada ? 0.9 : 1,
                  fontSize: designSystem.fontSizes.xl,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100px',
                }}
              >
                Mesa {mesa.numero}
                <span style={{ fontSize: designSystem.fontSizes.sm }}>
                    {isOcupada ? `Ocupada por: ${mesa.garcom_nome || 'N/D'}` : 'Livre'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CARDÁPIO */}
      {mesaSelecionada && (
        <div style={estilosBase.card}>
          <h2 style={{ ...estilosBase.titulo, marginBottom: designSystem.spacing.md }}>
            2. Adicione os Itens
          </h2>

          {cardapio.map((categoria) => (
            <div key={categoria.id} style={{ marginBottom: designSystem.spacing['2xl'] }}>
              <h3 style={{ color: designSystem.cores.texto, borderBottom: `2px solid ${designSystem.cores.primaria}`, paddingBottom: designSystem.spacing.sm, fontSize: designSystem.fontSizes['2xl'] }}>
                {categoria.nome}
              </h3>
              
              <div style={estilosBase.grid}>
                {categoria.produtos && categoria.produtos.map((produto) => (
                  <div 
                    key={produto.id} 
                    onClick={() => produto.disponivel && abrirModal(produto)}
                    style={{
                      ...estilosBase.card,
                      padding: designSystem.spacing.md,
                      cursor: produto.disponivel ? 'pointer' : 'not-allowed',
                      opacity: produto.disponivel ? 1 : 0.5,
                      border: produto.disponivel ? `1px solid ${designSystem.cores.borda}` : `1px dashed ${designSystem.cores.perigo}`,
                      transition: 'transform 0.2s ease',
                      ':hover': { transform: produto.disponivel ? 'scale(1.02)' : 'none' },
                    }}
                  >
                    <h4 style={{ margin: 0, color: designSystem.cores.primaria, fontSize: designSystem.fontSizes.lg }}>
                      {produto.nome}
                    </h4>
                    <p style={{ margin: `${designSystem.spacing.xs} 0`, fontSize: designSystem.fontSizes.sm }}>
                      {produto.descricao}
                    </p>
                    <p style={{ margin: 0, fontWeight: 'bold', color: designSystem.cores.secundaria, fontSize: designSystem.fontSizes.base }}>
                      {formatarMoeda(produto.preco)}
                    </p>
                    {!produto.disponivel && (
                      <span style={{ color: designSystem.cores.perigo, fontWeight: 'bold' }}>Indisponível</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE ADIÇÃO DE ITEM */}
      {modalAberto && itemSelecionado && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.7)', 
          zIndex: 1000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center'
        }}>
          <div style={{ 
            ...estilosBase.card, 
            maxWidth: '90%', 
            width: '500px', 
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <h3 style={{ ...estilosBase.titulo, marginBottom: designSystem.spacing.md }}>
              Adicionar: {itemSelecionado.nome}
            </h3>
            
            <label style={{ ...estilosBase.texto, display: 'block', marginBottom: designSystem.spacing.xs }}>
              Quantidade:
            </label>
            <input
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ width: '100%', padding: designSystem.spacing.md, marginBottom: designSystem.spacing.md, borderRadius: '8px', border: `1px solid ${designSystem.cores.borda}` }}
            />
            
            <label style={{ ...estilosBase.texto, display: 'block', marginBottom: designSystem.spacing.xs }}>
              Observações (opcional):
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Sem cebola, ponto da carne, etc."
              style={{ width: '100%', padding: designSystem.spacing.md, minHeight: '80px', marginBottom: designSystem.spacing.xl, borderRadius: '8px', border: `1px solid ${designSystem.cores.borda}` }}
            />

            <div style={{ display: 'flex', gap: designSystem.spacing.md }}>
              <button
                onClick={() => setModalAberto(false)}
                style={{
                  ...estilosBase.botao,
                  backgroundColor: designSystem.cores.perigo,
                  color: designSystem.cores.textoClaro,
                  flex: 1,
                  borderRadius: '8px',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={adicionarAoCarrinho}
                style={{
                  ...estilosBase.botao,
                  backgroundColor: designSystem.cores.secundaria,
                  color: designSystem.cores.textoClaro,
                  flex: 1,
                  borderRadius: '8px',
                }}
              >
                Adicionar ({formatarMoeda(itemSelecionado.preco * quantidade)})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CARRINHO E FINALIZAÇÃO */}
      {mesaSelecionada && (
        <div style={estilosBase.card}>
          <h2 style={{ ...estilosBase.titulo, marginBottom: designSystem.spacing.md }}>
            3. Resumo do Pedido (Mesa {mesaSelecionada})
          </h2>

          <div style={{ 
            border: `1px solid ${designSystem.cores.borda}`, 
            borderRadius: '12px', 
            padding: designSystem.spacing.md, 
            marginBottom: designSystem.spacing['2xl']
          }}>
            {carrinho.length === 0 ? (
              <p style={{ ...estilosBase.texto, textAlign: 'center' }}>Carrinho vazio.</p>
            ) : (
              <>
                {carrinho.map((item, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: `${designSystem.spacing.xs} 0`,
                      borderBottom: `1px dashed ${designSystem.cores.borda}`
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: 'bold', ...estilosBase.texto }}>
                        {item.quantidade}x {item.nome}
                      </p>
                      {item.observacoes && (
                        <p style={{ margin: 0, fontSize: designSystem.fontSizes.xs, color: '#666' }}>
                          Obs: {item.observacoes}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <p style={{ margin: `0 ${designSystem.spacing.md} 0 0`, fontWeight: 'bold', color: designSystem.cores.primaria }}>
                        {formatarMoeda(item.preco * item.quantidade)}
                      </p>
                      <button 
                        onClick={() => removerDoCarrinho(index)}
                        style={{
                          ...estilosBase.botao,
                          backgroundColor: designSystem.cores.perigo,
                          color: designSystem.cores.textoClaro,
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          padding: 0,
                          fontSize: designSystem.fontSizes.xs,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        X
                      </button>
                    </div>
                  </div>
                ))}
                
                <div style={{ textAlign: 'right', marginTop: designSystem.spacing.md }}>
                  <h4 style={{ margin: 0, ...estilosBase.texto }}>
                    Total: <span style={{ color: designSystem.cores.primaria }}>{formatarMoeda(calcularTotalCarrinho())}</span>
                  </h4>
                </div>
                
                <div style={{ display: 'flex', gap: designSystem.spacing.md, marginTop: designSystem.spacing.lg }}>
                  <button
                    onClick={() => { setMesaSelecionada(null); setCarrinho([]); }}
                    style={{
                      ...estilosBase.botao,
                      backgroundColor: designSystem.cores.aviso,
                      color: designSystem.cores.textoClaro,
                      border: 'none',
                      padding: designSystem.spacing.lg,
                      borderRadius: '12px',
                      fontSize: designSystem.fontSizes.lg,
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    Continuar Comprando
                  </button>
                  
                  <button
                    onClick={finalizarPedido}
                    disabled={enviandoPedido || carrinho.length === 0}
                    style={{
                      backgroundColor: (enviandoPedido || carrinho.length === 0) ? '#ccc' : designSystem.cores.sucesso,
                      color: designSystem.cores.textoClaro,
                      border: 'none',
                      padding: designSystem.spacing.lg,
                      borderRadius: '12px',
                      fontSize: designSystem.fontSizes.lg,
                      ...estilosBase.botao,
                      cursor: (enviandoPedido || carrinho.length === 0) ? 'not-allowed' : 'pointer',
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
