import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Category } from '../../types';
import { sortByOrder, getNextOrder, reorderItems } from '../../utils/sorting';
import EmojiPicker from 'emoji-picker-react';

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    emoji: '🍽️'
  });
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, 'categories'));
    const categoriesData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];
    setCategories(sortByOrder(categoriesData));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const categoryData = {
        name: formData.name,
        emoji: formData.emoji,
        order: editingCategory ? editingCategory.order : getNextOrder(categories),
        createdAt: new Date(),
      };

      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), categoryData);
        toast.success('Catégorie mise à jour');
      } else {
        await addDoc(collection(db, 'categories'), categoryData);
        toast.success('Catégorie ajoutée');
      }

      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', emoji: '🍽️' });
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      try {
        await deleteDoc(doc(db, 'categories', id));
        toast.success('Catégorie supprimée');
        fetchCategories();
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null) return;
    
    if (draggedItem !== index) {
      const newCategories = reorderItems(categories, draggedItem, index);
      setCategories(newCategories);
      setDraggedItem(index);
    }
  };

  const handleDragEnd = async () => {
    setDraggedItem(null);
    
    // Sauvegarder le nouvel ordre dans Firestore
    const batch = writeBatch(db);
    categories.forEach((category) => {
      const categoryRef = doc(db, 'categories', category.id);
      batch.update(categoryRef, { order: category.order });
    });
    
    try {
      await batch.commit();
      toast.success('Ordre mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de l\'ordre');
      fetchCategories(); // Recharger l'ordre original en cas d'erreur
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Catégories</h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', emoji: '🍽️' });
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter une catégorie
        </button>
      </div>

      {/* Categories list */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="min-w-full divide-y divide-gray-200">
          {categories.map((category, index) => (
            <div
              key={category.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center p-4 hover:bg-gray-50 transition-colors ${
                draggedItem === index ? 'bg-gray-50' : ''
              }`}
            >
              <div className="cursor-move text-gray-400 hover:text-gray-600">
                <GripVertical className="h-5 w-5" />
              </div>
              <div className="flex-1 ml-4 flex items-center">
                <span className="text-2xl mr-4">{category.emoji}</span>
                <span className="text-gray-900">{category.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setEditingCategory(category);
                    setFormData({
                      name: category.name,
                      emoji: category.emoji
                    });
                    setIsModalOpen(true);
                  }}
                  className="text-rose-600 hover:text-rose-700"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Emoji</label>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="mt-1 w-full text-left px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
                >
                  {formData.emoji}
                </button>
                {showEmojiPicker && (
                  <div className="absolute z-10 mt-1">
                    <EmojiPicker
                      onEmojiClick={(emojiData) => {
                        setFormData({ ...formData, emoji: emojiData.emoji });
                        setShowEmojiPicker(false);
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
                >
                  {editingCategory ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;