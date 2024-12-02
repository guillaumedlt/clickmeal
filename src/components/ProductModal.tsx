import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart }) => {
  if (!product) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl overflow-hidden max-w-2xl w-full shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-64 object-cover"
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
            {product.isNew && (
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-rose-500 text-white shadow-lg">
                  Nouveau
                </span>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
              <span className="text-2xl font-bold text-rose-600">
                {product.price.toFixed(2)}€
              </span>
            </div>

            <p className="text-gray-600 mb-6">{product.description}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {product.categories.map((categoryId) => (
                <span
                  key={categoryId}
                  className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-sm font-medium"
                >
                  {categoryId}
                </span>
              ))}
            </div>

            <button
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="w-full flex items-center justify-center px-6 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors font-medium"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Ajouter au panier
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductModal;