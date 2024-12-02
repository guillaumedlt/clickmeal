import React from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  index: number;
  draggedItem: number | null;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index,
  draggedItem,
  onDragStart,
  onDragOver,
  onDragEnd,
  onEdit,
  onDelete
}) => {
  return (
    <motion.div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      className={`bg-white rounded-lg shadow-md overflow-hidden ${
        draggedItem === index ? 'opacity-50' : ''
      }`}
    >
      <div className="cursor-move p-2 bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600">
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {product.isNew && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-rose-500 text-white shadow-lg">
              Nouveau
            </span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
              {product.type === 'starter' ? 'Entrée' :
               product.type === 'main' ? 'Plat' :
               'Dessert'}
            </span>
            {product.availableInFormula && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                Formule
              </span>
            )}
          </div>
        </div>
        <p className="mt-1 text-gray-500">{product.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-rose-600">
            {product.price.toFixed(2)}€
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(product)}
              className="p-2 text-rose-600 hover:bg-rose-50 rounded-md"
            >
              <Pencil className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;