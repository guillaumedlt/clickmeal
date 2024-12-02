import React from 'react';
import { Category, ProductType } from '../../types';

interface ProductFormProps {
  formData: {
    name: string;
    description: string;
    price: string;
    image: File | null;
    categories: string[];
    available: boolean;
    type: ProductType;
    availableInFormula: boolean;
    isNew: boolean;
  };
  categories: Category[];
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onChange: (data: Partial<typeof formData>) => void;
  onClose: () => void;
  isEditing: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  formData,
  categories,
  onSubmit,
  onChange,
  onClose,
  isEditing
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nom</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Prix</label>
        <input
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => onChange({ price: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onChange({ image: e.target.files?.[0] || null })}
          className="mt-1 block w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type de produit</label>
        <select
          value={formData.type}
          onChange={(e) => onChange({ type: e.target.value as ProductType })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
        >
          <option value="starter">Entrée</option>
          <option value="main">Plat</option>
          <option value="dessert">Dessert</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Catégories</label>
        <div className="mt-2 space-y-2">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.categories.includes(category.id)}
                onChange={(e) => {
                  const newCategories = e.target.checked
                    ? [...formData.categories, category.id]
                    : formData.categories.filter(id => id !== category.id);
                  onChange({ categories: newCategories });
                }}
                className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">
                {category.emoji} {category.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.availableInFormula}
            onChange={(e) => onChange({ availableInFormula: e.target.checked })}
            className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Disponible dans les formules
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isNew}
            onChange={(e) => onChange({ isNew: e.target.checked })}
            className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Marquer comme nouveau
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
        >
          {isEditing ? 'Mettre à jour' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;