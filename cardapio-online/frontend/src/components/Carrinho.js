import React, { useState } from 'react';
import { useCarrinho } from '../context/CarrinhoContext';
import axios from 'axios';

const Carrinho = ({ isAberto, fecharCarrinho }) => {
  const { itens, removerItem, atualizarQuantidade, total, limparCarrinho } = useCarrinho();
  const [enviandoPedido, setEnviandoPedido] = useState(false);
  const [dadosCliente, setDadosCliente] = useState({
    nome: '',
    telefone: '',
    observacoes: ''
  });

  const finalizarPedido = async () => {
    if (!dadosCliente.nome || !dadosCliente.telefone) {
      alert('Por favor, preencha nome e telefone!');
      return;
    }

    setEnviandoPedido(true);
    
    try {
      const pedidoData = {
        cliente_nome: dadosCliente.nome,
        cliente_telefone: dadosCliente.telefone,
        observacoes: dadosCliente.observacoes,
        itens: itens.map(item => ({
          produto_id: item.produto.id,
          quantidade: item.quantidade
        }))
      };

      const response = await axios.post('http://localhost:8000/api/pedidos', pedidoData);
      
      if (response.data.success) {
        alert(`Pedido #${response.data.pedido_id} realizado com sucesso!`);
        limparCarrinho();
        setDadosCliente({ nome: '', telefone: '', observacoes: '' });
        fecharCarrinho();
      }
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      alert('Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setEnviandoPedido(false);
    }
  };

  if (!isAberto) return null;

  return (
    <div className="carrinho-overlay">
      <div className="carrinho-modal">
        <div className="carrinho-header">
          <h3>🛒 Seu Pedido</h3>
          <button onClick={fecharCarrinho} className="btn-fechar">×</button>
        </div>
        
        <div className="carrinho-itens">
          {itens.length === 0 ? (
            <p>Carrinho vazio</p>
          ) : (
            itens.map(item => (
              <div key={item.produto.id} className="carrinho-item">
                <span className="item-nome">{item.produto.nome}</span>
                <div className="item-controles">
                  <button onClick={() => atualizarQuantidade(item.produto.id, item.quantidade - 1)}>
                    -
                  </button>
                  <span>{item.quantidade}</span>
                  <button onClick={() => atualizarQuantidade(item.produto.id, item.quantidade + 1)}>
                    +
                  </button>
                  <span className="item-subtotal">
                    R$ {(item.produto.preco * item.quantidade).toFixed(2)}
                  </span>
                  <button 
                    onClick={() => removerItem(item.produto.id)}
                    className="btn-remover"
                    aria-label="Remover item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {itens.length > 0 && (
          <>
            <div className="carrinho-total">
              <strong>Total: R$ {total.toFixed(2)}</strong>
            </div>
            
            <div className="dados-cliente">
              <h4>Informações para entrega</h4>
              <input
                type="text"
                placeholder="Seu nome"
                value={dadosCliente.nome}
                onChange={(e) => setDadosCliente({...dadosCliente, nome: e.target.value})}
              />
              <input
                type="tel"
                placeholder="Telefone"
                value={dadosCliente.telefone}
                onChange={(e) => setDadosCliente({...dadosCliente, telefone: e.target.value})}
              />
              <textarea
                placeholder="Observações (opcional)"
                value={dadosCliente.observacoes}
                onChange={(e) => setDadosCliente({...dadosCliente, observacoes: e.target.value})}
              />
            </div>
            
            <button 
              onClick={finalizarPedido} 
              className="btn-finalizar"
              disabled={enviandoPedido}
            >
              {enviandoPedido ? 'Enviando...' : 'Finalizar Pedido'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Carrinho;