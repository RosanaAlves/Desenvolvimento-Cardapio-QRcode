import React from 'react';
import { useCategories } from '../../hooks/useApi';
import LoadingSpinner from '../Common/LoadingSpinner';

function CategoryList({ selectedCategory, onCategorySelect }) {
  const { categories, loading, error } = useCategories();

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Erro: {error}</div>;

  return (
    <div className="flex overflow-x-auto space-x-2 pb-4 mb-6">
      <button
        onClick={() => onCategorySelect(null)}
        className={`px-4 py-2 rounded-full whitespace-nowrap ${
          selectedCategory === null 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Todos
      </button>
      
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onCategorySelect(category.id)}
          className={`px-4 py-2 rounded-full whitespace-nowrap ${
            selectedCategory === category.id 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {category.nome}
        </button>
      ))}
    </div>
  );
}

export default CategoryList;