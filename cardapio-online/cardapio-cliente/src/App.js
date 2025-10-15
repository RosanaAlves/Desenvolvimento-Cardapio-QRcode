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

  // Carregar dados do cardápio
  useEffect(() => {
    const carregarCardapio = async () => {
      try {
        setCarregando(true);
        
        // 🔥 USANDO O CARDAPIO CONTROLLER DO CLIENTE
        const [dadosCategorias, dadosProdutos] = await Promise.all([
          fetch(`${API_BASE_URL}/api/cliente/cardapio`).then(r => r.json()),
          fetch(`${API_BASE_URL}/api/cliente/produtos`).then(r => r.json())
        ]);
        
        // 🔥 CORREÇÃO: Verificar estrutura da resposta
        const categoriasFormatadas = dadosCategorias.success ? dadosCategorias.data : dadosCategorias;
        const produtosFormatados = dadosProdutos.success ? dadosProdutos.data : dadosProdutos;
        
        setCategorias(categoriasFormatadas);
        setProdutos(produtosFormatados);
        
      } catch (error) {
        console.error('Erro ao carregar cardápio:', error);
        // 🔥 FALLBACK: Tentar rotas públicas antigas
        try {
          const [dadosCategorias, dadosProdutos] = await Promise.all([
            fetch(`${API_BASE_URL}/api/categorias`).then(r => r.json()),
            fetch(`${API_BASE_URL}/api/produtos`).then(r => r.json())
          ]);
          setCategorias(dadosCategorias);
          setProdutos(dadosProdutos);
        } catch (fallbackError) {
          console.error('Erro no fallback:', fallbackError);
        }
      } finally {
        setCarregando(false);
      }
    };

    carregarCardapio();
  }, []);

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
          marginBottom: designSystem.spacing.xl 
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
          // 🔥 CORREÇÃO: Diferentes formas de obter produtos da categoria
          let produtosDaCategoria = [];
          
          if (categoria.produtos && Array.isArray(categoria.produtos)) {
            // Se a categoria já vem com produtos (from /api/cliente/cardapio)
            produtosDaCategoria = categoria.produtos;
          } else {
            // Se precisa filtrar (from /api/categorias + /api/produtos)
            produtosDaCategoria = produtos.filter(produto => 
              produto.categoria_id === categoria.id
            );
          }

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
                  <div key={produto.id} style={{
                    backgroundColor: designSystem.cores.fundo,
                    padding: designSystem.spacing.lg,
                    borderRadius: '16px',
                    border: `2px solid ${designSystem.cores.borda}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: designSystem.spacing.lg,
                    transition: 'all 0.3s ease',
                    minHeight: '120px'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
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

export default App;