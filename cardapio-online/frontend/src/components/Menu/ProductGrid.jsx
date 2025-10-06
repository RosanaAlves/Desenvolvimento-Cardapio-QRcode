import React from 'react';
import { useProducts } from '../../hooks/useApi';
import ProductCard from './ProductCard';
import LoadingSpinner from '../Common/LoadingSpinner';

function ProductGrid({ categoryId, onAddToCart }) {
  const { products, loading, error } = useProducts(categoryId);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Erro: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}

export default ProductGrid;