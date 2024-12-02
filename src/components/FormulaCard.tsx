import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UtensilsCrossed } from 'lucide-react';
import { Formula } from '../types';

interface FormulaCardProps {
  formula: Formula;
}

const FormulaCard: React.FC<FormulaCardProps> = ({ formula }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex">
        {formula.image && (
          <div className="w-1/3">
            <img
              src={formula.image}
              alt={formula.name}
              className="w-full h-32 object-cover"
            />
          </div>
        )}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-gray-900">{formula.name}</h3>
            <span className="text-base font-bold text-rose-600">{formula.price.toFixed(2)}€</span>
          </div>
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{formula.description}</p>
          <Link
            to={`/formula/${formula.id}`}
            className="w-full flex items-center justify-center px-3 py-1.5 bg-rose-600 text-white text-sm rounded-lg hover:bg-rose-700 transition-colors"
          >
            <UtensilsCrossed className="h-4 w-4 mr-1.5" />
            Composer
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default FormulaCard;