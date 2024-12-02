import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { Product, Category, ProductType } from '../../types';
import { sortByOrder, getNextOrder, reorderItems } from '../../utils/sorting';
import ProductCard from '../../components/admin/ProductCard';
import ProductForm from '../../components/admin/ProductForm';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: null as File | null,
    categories: [] as string[],
    available: true,
    type: 'main' as ProductType,
    availableInFormula: false,
    isNew: false
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'products'));
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

  const fetchCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(sortByOrder(categoriesData));
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Erreur lors du chargement des catégories');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = editingProduct?.image || '';

      if (formData.image) {
        const storageRef = ref(storage, `products/${formData.image.name}`);
        const snapshot = await uploadBytes(storageRef, formData.image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image: imageUrl,
        categories: formData.categories,
        available: formData.available,
        type: formData.type,
        availableInFormula: formData.availableInFormula,
        isNew: formData.isNew,
        order: editingProduct ? editingProduct.order : getNextOrder(products),
        createdAt: new Date(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        toast.success('Produit mis à jour');
      } else {
        await addDoc(collection(db, 'products'), productData);
        toast.success('Produit ajouté');
      }

      setIsModalOpen(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        toast.success('Produit supprimé');
        fetchProducts();
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
      const newProducts = reorderItems(products, draggedItem, index);
      setProducts(newProducts);
      setDraggedItem(index);
    }
  };

  const handleDragEnd = async () => {
    setDraggedItem(null);
    
    const batch = writeBatch(db);
    products.forEach((product) => {
      const productRef = doc(db, 'products', product.id);
      batch.update(productRef, { order: product.order });
    });
    
    try {
      await batch.commit();
      toast.success('Ordre mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de l\'ordre');
      fetchProducts();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: null,
      categories: [],
      available: true,
      type: 'main',
      availableInFormula: false,
      isNew: false
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: null,
      categories: product.categories,
      available: product.available,
      type: product.type,
      availableInFormula: product.availableInFormula,
      isNew: product.isNew
    });
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Produits</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter un produit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            draggedItem={draggedItem}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
            </h2>
            <ProductForm
              formData={formData}
              categories={categories}
              onSubmit={handleSubmit}
              onChange={(data) => setFormData({ ...formData, ...data })}
              onClose={() => setIsModalOpen(false)}
              isEditing={!!editingProduct}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;