import React, { createContext, useContext, useReducer } from 'react';

const CarrinhoContext = createContext();

const carrinhoReducer = (state, action) => {
  switch (action.type) {
    case 'ADICIONAR_ITEM':
      const itemExistente = state.itens.find(item => 
        item.produto.id === action.payload.produto.id
      );
      
      if (itemExistente) {
        return {
          ...state,
          itens: state.itens.map(item =>
            item.produto.id === action.payload.produto.id
              ? { ...item, quantidade: item.quantidade + 1 }
              : item
          )
        };
      }
      
      return {
        ...state,
        itens: [...state.itens, { produto: action.payload.produto, quantidade: 1 }]
      };
      
    case 'REMOVER_ITEM':
      return {
        ...state,
        itens: state.itens.filter(item => item.produto.id !== action.payload.produtoId)
      };
      
    case 'ATUALIZAR_QUANTIDADE':
      return {
        ...state,
        itens: state.itens.map(item =>
          item.produto.id === action.payload.produtoId
            ? { ...item, quantidade: action.payload.quantidade }
            : item
        ).filter(item => item.quantidade > 0)
      };
      
    case 'LIMPAR_CARRINHO':
      return { ...state, itens: [] };
      
    default:
      return state;
  }
};

export const CarrinhoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(carrinhoReducer, { itens: [] });
  
  const adicionarItem = (produto) => {
    dispatch({ type: 'ADICIONAR_ITEM', payload: { produto } });
  };
  
  const removerItem = (produtoId) => {
    dispatch({ type: 'REMOVER_ITEM', payload: { produtoId } });
  };
  
  const atualizarQuantidade = (produtoId, quantidade) => {
    dispatch({ type: 'ATUALIZAR_QUANTIDADE', payload: { produtoId, quantidade } });
  };
  
  const limparCarrinho = () => {
    dispatch({ type: 'LIMPAR_CARRINHO' });
  };
  
  const total = state.itens.reduce((acc, item) => 
    acc + (item.produto.preco * item.quantidade), 0
  );
  
  const totalItens = state.itens.reduce((acc, item) => acc + item.quantidade, 0);
  
  return (
    <CarrinhoContext.Provider value={{
      itens: state.itens,
      total,
      totalItens,
      adicionarItem,
      removerItem,
      atualizarQuantidade,
      limparCarrinho
    }}>
      {children}
    </CarrinhoContext.Provider>
  );
};

export const useCarrinho = () => {
  const context = useContext(CarrinhoContext);
  if (!context) {
    throw new Error('useCarrinho deve ser usado dentro de CarrinhoProvider');
  }
  return context;
};