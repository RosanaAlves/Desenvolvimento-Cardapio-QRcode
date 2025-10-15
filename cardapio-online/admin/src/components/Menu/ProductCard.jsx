import React from 'react';

function ProductCard({ product, onAddToCart }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{product.nome}</h3>
        <p className="text-gray-600 text-sm mt-1">{product.descricao}</p>
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-2xl font-bold text-green-600">
            R$ {parseFloat(product.preco).toFixed(2)}
          </span>
          
          <button
            onClick={() => onAddToCart(product)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Adicionar
          </button>
        </div>
        
        {product.categoria_nome && (
          <div className="mt-2">
            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
              {product.categoria_nome}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;