import React, { useState, useEffect } from 'react';

// 🔥 SISTEMA DE DESIGN RESPONSIVO E ACESSÍVEL
const designSystem = {
  // Cores com alto contraste
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
    borda: '#e0e0e0'
  },

  // Tamanhos de fonte escaláveis (ACESSIBILIDADE)
  fontSizes: {
    xs: '0.875rem',    // 14px
    sm: '1rem',        // 16px  
    base: '1.125rem',  // 18px - BASE MAIOR
    lg: '1.25rem',     // 20px
    xl: '1.5rem',      // 24px
    '2xl': '1.875rem', // 30px
    '3xl': '2.25rem',  // 36px
    '4xl': '3rem',     // 48px
  },

  // Espaçamentos generosos
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

  // Breakpoints responsivos
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
  }
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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
        fontSizeBase: designSystem.fontSizes.base,
        paddingContainer: designSystem.spacing.md,
        maxWidth: '100%',
        gridGap: designSystem.spacing.md
      };
    } else if (windowWidth < designSystem.breakpoints.tablet) {
      return {
        fontSizeBase: designSystem.fontSizes.lg,
        paddingContainer: designSystem.spacing.lg,
        maxWidth: '90%',
        gridGap: designSystem.spacing.lg
      };
    } else {
      return {
        fontSizeBase: designSystem.fontSizes.xl,
        paddingContainer: designSystem.spacing.xl,
        maxWidth: '1200px',
        gridGap: designSystem.spacing.xl
      };
    }
  };

  const responsive = getResponsiveStyles();

  // 🔥 CARREGAR DADOS DO CARDÁPIO - VERSÃO CORRIGIDA COM SUAS ROTAS
  useEffect(() => {
    const carregarCardapio = async () => {
      try {
        setCarregando(true);
        setErro(null);
        
        // ✅ CORREÇÃO: Usando as rotas do SEU CardapioController
        const [resCategorias, resProdutos] = await Promise.all([
          fetch(`${API_BASE_URL}/api/cliente/categorias`),
          fetch(`${API_BASE_URL}/api/cliente/produtos`)
        ]);

        // ✅ Verificar se as respostas são OK
        if (!resCategorias.ok || !resProdutos.ok) {
          throw new Error('Erro ao carregar dados do servidor');
        }

        const [dadosCategorias, dadosProdutos] = await Promise.all([
          resCategorias.json(),
          resProdutos.json()
        ]);
        
        // ✅ CORREÇÃO: Estrutura baseada no SEU Controller
        // Seu controller retorna { success: true, data: [...] }
        const categoriasFormatadas = dadosCategorias.success ? 
          dadosCategorias.data : 
          (Array.isArray(dadosCategorias) ? dadosCategorias : []);
        
        const produtosFormatados = dadosProdutos.success ? 
          dadosProdutos.data : 
          (Array.isArray(dadosProdutos) ? dadosProdutos : []);

        console.log('Categorias carregadas:', categoriasFormatadas);
        console.log('Produtos carregados:', produtosFormatados);

        setCategorias(categoriasFormatadas);
        setProdutos(produtosFormatados);
        
      } catch (error) {
        console.error('Erro ao carregar cardápio:', error);
        setErro('Não foi possível carregar o cardápio. Tente novamente.');
        
        // ✅ Dados mock para desenvolvimento/demonstração
        const dadosMock = {
          categorias: [
            { 
              id: 1, 
              nome: "Pão de Saladinha", 
              descricao: "Lanches no pão de saladinha",
              produtos: [
                { id: 1, nome: "Saladinha", descricao: "Alface, tomate, hambúrguer, presunto e queijo", preco: 19.00, categoria_id: 1 },
                { id: 2, nome: "Saladinha Frango", descricao: "Alface, tomate, hambúrguer, frango, presunto e queijo", preco: 25.00, categoria_id: 1 }
              ]
            },
            { 
              id: 2, 
              nome: "Bebidas", 
              descricao: "Refrigerantes e sucos",
              produtos: [
                { id: 3, nome: "Coca-Cola Lata", descricao: "350ml", preco: 8.00, categoria_id: 2 },
                { id: 4, nome: "Suco de Laranja", descricao: "Natural", preco: 13.00, categoria_id: 2 }
              ]
            }
          ],
          produtos: [
            { id: 1, nome: "Saladinha", descricao: "Alface, tomate, hambúrguer, presunto e queijo", preco: 19.00, categoria_id: 1 },
            { id: 2, nome: "Saladinha Frango", descricao: "Alface, tomate, hambúrguer, frango, presunto e queijo", preco: 25.00, categoria_id: 1 },
            { id: 3, nome: "Coca-Cola Lata", descricao: "350ml", preco: 8.00, categoria_id: 2 },
            { id: 4, nome: "Suco de Laranja", descricao: "Natural", preco: 13.00, categoria_id: 2 }
          ]
        };

        setCategorias(dadosMock.categorias);
        setProdutos(dadosMock.produtos);
      } finally {
        setCarregando(false);
      }
    };

    carregarCardapio();
  }, []);

  // 🔥 FUNÇÃO PARA OBTER PRODUTOS DA CATEGORIA
  const obterProdutosDaCategoria = (categoria) => {
    // ✅ Se a categoria já vem com produtos (from /api/cliente/categorias)
    if (categoria.produtos && Array.isArray(categoria.produtos)) {
      return categoria.produtos;
    }
    
    // ✅ Se precisa filtrar (from /api/cliente/produtos)
    return produtos.filter(produto => produto.categoria_id === categoria.id);
  };

  // 🔥 COMPONENTE DE LOADING
  if (carregando) {
    return (
      <div style={{ 
        padding: designSystem.spacing['3xl'], 
        textAlign: 'center',
        minHeight: '100vh',
        backgroundColor: designSystem.cores.fundo,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        ...estilosBase.fontePrimaria
      }}>
        <div style={{ 
          fontSize: designSystem.fontSizes['4xl'], 
          marginBottom: designSystem.spacing.xl,
          animation: 'spin 1s linear infinite'
        }}>
          ⏳
        </div>
        <h2 style={{
          fontSize: designSystem.fontSizes.xl,
          color: designSystem.cores.texto,
          ...estilosBase.titulo
        }}>
          Carregando Cardápio...
        </h2>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 🔥 COMPONENTE DE ERRO
  if (erro && categorias.length === 0) {
    return (
      <div style={{ 
        padding: designSystem.spacing['3xl'], 
        textAlign: 'center',
        minHeight: '100vh',
        backgroundColor: designSystem.cores.fundo,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        ...estilosBase.fontePrimaria
      }}>
        <div style={{ 
          fontSize: designSystem.fontSizes['4xl'], 
          marginBottom: designSystem.spacing.xl 
        }}>
          ❌
        </div>
        <h2 style={{
          fontSize: designSystem.fontSizes.xl,
          color: designSystem.cores.perigo,
          ...estilosBase.titulo
        }}>
          {erro}
        </h2>
        <p style={{
          fontSize: designSystem.fontSizes.base,
          color: designSystem.cores.texto,
          marginTop: designSystem.spacing.lg,
          ...estilosBase.texto
        }}>
          Usando dados de demonstração...
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: responsive.paddingContainer,
      maxWidth: responsive.maxWidth, 
      margin: '0 auto',
      backgroundColor: designSystem.cores.fundo,
      minHeight: '100vh',
      ...estilosBase.fontePrimaria
    }}>
      {/* HEADER */}
      <header style={{ 
        textAlign: 'center', 
        marginBottom: designSystem.spacing['3xl'],
        padding: designSystem.spacing['2xl'],
        backgroundColor: designSystem.cores.primaria,
        color: designSystem.cores.textoClaro,
        borderRadius: '20px',
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
          margin: '0 0 20px 0', 
          fontSize: designSystem.fontSizes.xl,
          ...estilosBase.subtitulo
        }}>
          Cardápio Digital
        </p>
        <p style={{ 
          margin: '0', 
          fontSize: designSystem.fontSizes.lg,
          opacity: 0.9,
          ...estilosBase.texto
        }}>
          📞 99611-2820 | 3822-7097
        </p>
        <div style={{ 
          marginTop: designSystem.spacing.lg,
          padding: `${designSystem.spacing.sm} ${designSystem.spacing.lg}`,
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '25px',
          display: 'inline-block',
          fontSize: designSystem.fontSizes.lg,
          fontWeight: '600'
        }}>
          🎯 Peça ao garçom
        </div>
      </header>

      {/* CARDÁPIO */}
      <div style={{ marginBottom: designSystem.spacing['3xl'] }}>
        {categorias.map(categoria => {
          const produtosDaCategoria = obterProdutosDaCategoria(categoria);

          if (produtosDaCategoria.length === 0) return null;

          return (
            <div key={categoria.id} style={{ 
              marginBottom: designSystem.spacing.xl,
              backgroundColor: designSystem.cores.card,
              borderRadius: '20px',
              padding: designSystem.spacing.xl,
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              border: `2px solid ${designSystem.cores.borda}`
            }}>
              <h2 style={{ 
                color: designSystem.cores.primaria, 
                borderBottom: `3px solid ${designSystem.cores.primaria}`,
                paddingBottom: designSystem.spacing.lg,
                marginBottom: designSystem.spacing.lg,
                fontSize: designSystem.fontSizes.xl,
                ...estilosBase.titulo
              }}>
                {categoria.nome}
              </h2>
              
              {categoria.descricao && (
                <p style={{ 
                  color: '#666', 
                  fontStyle: 'italic', 
                  fontSize: designSystem.fontSizes.lg,
                  marginBottom: designSystem.spacing.lg,
                  lineHeight: '1.5',
                  ...estilosBase.texto
                }}>
                  {categoria.descricao}
                </p>
              )}

              {/* PRODUTOS */}
              <div style={{ display: 'grid', gap: responsive.gridGap }}>
                {produtosDaCategoria.map(produto => (
                  <ProdutoCard key={produto.id} produto={produto} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <footer style={{ 
        textAlign: 'center', 
        color: '#666',
        padding: designSystem.spacing['2xl'],
        borderTop: `3px solid ${designSystem.cores.borda}`,
        marginTop: designSystem.spacing['3xl']
      }}>
        <p style={{ 
          margin: '0 0 16px 0', 
          fontSize: designSystem.fontSizes.lg,
          ...estilosBase.subtitulo
        }}>
          💡 Como pedir?
        </p>
        <p style={{ 
          margin: '0 0 24px 0', 
          fontSize: designSystem.fontSizes.base,
          ...estilosBase.texto
        }}>
          Chame o garçom e informe os itens desejados
        </p>
        <p style={{ 
          margin: '0', 
          fontSize: designSystem.fontSizes.sm,
          opacity: 0.7,
          ...estilosBase.texto
        }}>
          © 2025 Jetro's Lanches - Cardápio Digital
        </p>
      </footer>
    </div>
  );
}

// 🔥 COMPONENTE SEPARADO PARA PRODUTO (Melhor organização)
const ProdutoCard = ({ produto }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      style={{
        backgroundColor: designSystem.cores.fundo,
        padding: designSystem.spacing.lg,
        borderRadius: '16px',
        border: `2px solid ${designSystem.cores.borda}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: designSystem.spacing.lg,
        transition: 'all 0.3s ease',
        minHeight: '120px',
        boxShadow: isHovered ? '0 6px 12px rgba(0,0,0,0.15)' : 'none',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        cursor: 'pointer'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ flex: 1 }}>
        <h3 style={{ 
          margin: '0 0 12px 0', 
          color: designSystem.cores.texto,
          fontSize: designSystem.fontSizes.lg,
          ...estilosBase.subtitulo
        }}>
          {produto.nome}
        </h3>
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
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: designSystem.spacing.lg,
        flexShrink: 0
      }}>
        <span style={{ 
          backgroundColor: designSystem.cores.secundaria, 
          color: designSystem.cores.textoClaro, 
          padding: `${designSystem.spacing.sm} ${designSystem.spacing.lg}`, 
          borderRadius: '25px',
          fontWeight: '600',
          fontSize: designSystem.fontSizes.lg,
          minWidth: '120px',
          textAlign: 'center'
        }}>
          R$ {Number(produto.preco).toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default App;