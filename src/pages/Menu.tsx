import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import { Product, Category, Formula } from '../types';
import { sortByOrder } from '../utils/sorting';
import { formatDate } from '../utils/date';
import ProductModal from '../components/ProductModal';
import FormulaCard from '../components/FormulaCard';

const Menu = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { user } = useAuthStore();
  const { addItem, setDeliveryDate, deliveryDate } = useCartStore();
  const [selectedDate, setSelectedDate] = useState<Date>(deliveryDate || addDays(new Date(), 1));

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchFormulas();
  }, []);

  useEffect(() => {
    setDeliveryDate(selectedDate);
  }, [selectedDate, setDeliveryDate]);

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

  const fetchProducts = async () => {
    try {
      const productsSnapshot = await getDocs(
        query(collection(db, 'products'), where('available', '==', true))
      );
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(sortByOrder(productsData));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Erreur lors du chargement des produits');
    }
  };

  const fetchFormulas = async () => {
    try {
      const snapshot = await getDocs(
        query(collection(db, 'formulas'), where('available', '==', true))
      );
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

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleOrder = async (product: Product) => {
    if (!user) {
      toast.error('Veuillez vous connecter pour commander');
      return;
    }

    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price
      });
      toast.success('Produit ajouté au panier');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Erreur lors de l\'ajout au panier');
    }
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.categories?.includes(selectedCategory));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-rose-600 text-transparent bg-clip-text">
            Notre Menu
          </h1>
          <div className="mt-2 space-y-1">
            <p className="text-gray-600 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-rose-500" />
              Livraison le {formatDate(selectedDate)}
            </p>
            <p className="text-gray-600 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-rose-500" />
              Entre 11h30 et 12h30
            </p>
          </div>
        </div>
        
        <div className="relative w-full sm:w-auto">
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            minDate={addDays(new Date(), 1)}
            maxDate={addDays(new Date(), 14)}
            dateFormat="dd/MM/yyyy"
            locale={fr}
            customInput={
              <button className="w-full flex items-center px-6 py-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-rose-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500">
                <Calendar className="h-5 w-5 text-rose-500 mr-3" />
                <span className="text-gray-700">
                  {formatDate(selectedDate)}
                </span>
              </button>
            }
          />
        </div>
      </div>

      {/* Formulas */}
      {formulas.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Nos Formules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formulas.map((formula) => (
              <FormulaCard key={formula.id} formula={formula} />
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="flex flex-wrap gap-3 mb-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all ${
            selectedCategory === 'all'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
              : 'bg-white text-gray-700 hover:bg-rose-50 hover:text-rose-600 shadow-sm hover:shadow'
          }`}
        >
          <span>🍽️</span>
          <span>Tout voir</span>
        </motion.button>
        
        {categories.map((category) => (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all ${
              selectedCategory === category.id
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-white text-gray-700 hover:bg-rose-50 hover:text-rose-600 shadow-sm hover:shadow'
            }`}
          >
            <span>{category.emoji}</span>
            <span>{category.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => setSelectedProduct(product)}
          >
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 object-cover"
              />
              {product.isNew && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-rose-500 text-white shadow-lg">
                    Nouveau
                  </span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-base font-semibold text-gray-900">{product.name}</h3>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-base font-bold text-rose-600">
                  {product.price.toFixed(2)}€
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOrder(product);
                  }}
                  className="flex items-center px-3 py-1.5 bg-rose-600 text-white text-sm rounded-lg hover:bg-rose-700 transition-colors"
                >
                  <ShoppingBag className="h-4 w-4 mr-1.5" />
                  Commander
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleOrder}
      />
    </div>
  );
};

export default Menu;