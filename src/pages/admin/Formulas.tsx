import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Formula, Product } from '../../types';
import { sortByOrder, getNextOrder, reorderItems } from '../../utils/sorting';

const Formulas = () => {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState<Formula | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: null as File | null,
    type: 'starter_main' as Formula['type'],
    available: true,
    starterIds: [] as string[],
    mainIds: [] as string[],
    dessertIds: [] as string[]
  });

  useEffect(() => {
    fetchFormulas();
    fetchProducts();
  }, []);

  const fetchFormulas = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'formulas'));
      const formulasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Formula[];
      setFormulas(sortByOrder(formulasData));
    } catch (error) {
      console.error('Error fetching formulas:', error);
      toast.error('Erreur lors du chargement des formules');
    }
  };

  const fetchProducts = async () => {
    try {
      const snapshot = await getDocs(
        query(collection(db, 'products'), where('availableInFormula', '==', true))
      );
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(sortByOrder(productsData));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Erreur lors du chargement des produits');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = editingFormula?.image || '';

      if (formData.image) {
        const storageRef = ref(storage, `formulas/${formData.image.name}`);
        const snapshot = await uploadBytes(storageRef, formData.image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const formulaData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image: imageUrl,
        type: formData.type,
        available: formData.available,
        starterIds: formData.starterIds,
        mainIds: formData.mainIds,
        dessertIds: formData.dessertIds,
        order: editingFormula ? editingFormula.order : getNextOrder(formulas),
        createdAt: new Date()
      };

      if (editingFormula) {
        await updateDoc(doc(db, 'formulas', editingFormula.id), formulaData);
        toast.success('Formule mise à jour');
      } else {
        await addDoc(collection(db, 'formulas'), formulaData);
        toast.success('Formule ajoutée');
      }

      setIsModalOpen(false);
      setEditingFormula(null);
      resetForm();
      fetchFormulas();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formule ?')) {
      try {
        await deleteDoc(doc(db, 'formulas', id));
        toast.success('Formule supprimée');
        fetchFormulas();
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
      const newFormulas = reorderItems(formulas, draggedItem, index);
      setFormulas(newFormulas);
      setDraggedItem(index);
    }
  };

  const handleDragEnd = async () => {
    setDraggedItem(null);
    
    const batch = writeBatch(db);
    formulas.forEach((formula) => {
      const formulaRef = doc(db, 'formulas', formula.id);
      batch.update(formulaRef, { order: formula.order });
    });
    
    try {
      await batch.commit();
      toast.success('Ordre mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de l\'ordre');
      fetchFormulas();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: null,
      type: 'starter_main',
      available: true,
      starterIds: [],
      mainIds: [],
      dessertIds: []
    });
  };

  const getFormulaTypeLabel = (type: Formula['type']) => {
    switch (type) {
      case 'starter_main':
        return 'Entrée + Plat';
      case 'main_dessert':
        return 'Plat + Dessert';
      case 'complete':
        return 'Entrée + Plat + Dessert';
    }
  };

  const getProductsByType = (type: 'starter' | 'main' | 'dessert') => {
    return products.filter(p => p.type === type);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Formules</h1>
        <button
          onClick={() => {
            setEditingFormula(null);
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter une formule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formulas.map((formula, index) => (
          <div
            key={formula.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`bg-white rounded-lg shadow-md overflow-hidden ${
              draggedItem === index ? 'opacity-50' : ''
            }`}
          >
            <div className="cursor-move p-2 bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600">
              <GripVertical className="h-5 w-5" />
            </div>
            {formula.image && (
              <img
                src={formula.image}
                alt={formula.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{formula.name}</h3>
                <span className="text-lg font-bold text-rose-600">
                  {formula.price.toFixed(2)}€
                </span>
              </div>
              <p className="text-gray-500 mb-4">{formula.description}</p>
              <div className="mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                  {getFormulaTypeLabel(formula.type)}
                </span>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setEditingFormula(formula);
                    setFormData({
                      name: formula.name,
                      description: formula.description,
                      price: formula.price.toString(),
                      image: null,
                      type: formula.type,
                      available: formula.available,
                      starterIds: formula.starterIds || [],
                      mainIds: formula.mainIds || [],
                      dessertIds: formula.dessertIds || []
                    });
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-md"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(formula.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingFormula ? 'Modifier la formule' : 'Ajouter une formule'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Prix</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                  className="mt-1 block w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Type de formule</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Formula['type'] })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                >
                  <option value="starter_main">Entrée + Plat</option>
                  <option value="main_dessert">Plat + Dessert</option>
                  <option value="complete">Entrée + Plat + Dessert</option>
                </select>
              </div>

              {(formData.type === 'starter_main' || formData.type === 'complete') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Entrées disponibles</label>
                  <div className="mt-2 space-y-2">
                    {getProductsByType('starter').map((product) => (
                      <label key={product.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.starterIds.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                starterIds: [...formData.starterIds, product.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                starterIds: formData.starterIds.filter(id => id !== product.id)
                              });
                            }
                          }}
                          className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          {product.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Plats disponibles</label>
                <div className="mt-2 space-y-2">
                  {getProductsByType('main').map((product) => (
                    <label key={product.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.mainIds.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              mainIds: [...formData.mainIds, product.id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              mainIds: formData.mainIds.filter(id => id !== product.id)
                            });
                          }
                        }}
                        className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        {product.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {(formData.type === 'main_dessert' || formData.type === 'complete') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Desserts disponibles</label>
                  <div className="mt-2 space-y-2">
                    {getProductsByType('dessert').map((product) => (
                      <label key={product.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.dessertIds.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                dessertIds: [...formData.dessertIds, product.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                dessertIds: formData.dessertIds.filter(id => id !== product.id)
                              });
                            }
                          }}
                          className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          {product.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Disponible
                </label>
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
                  {editingFormula ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Formulas;