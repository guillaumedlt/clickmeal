import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCartStore } from '../store/cartStore';
import { Formula, Product } from '../types';
import { toast } from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const FormulaSelection = () => {
  const { formulaId } = useParams();
  const navigate = useNavigate();
  const [formula, setFormula] = useState<Formula | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({
    starterId: '',
    mainId: '',
    dessertId: ''
  });
  const { addItem } = useCartStore();

  useEffect(() => {
    if (formulaId) {
      fetchFormula();
    }
  }, [formulaId]);

  const fetchFormula = async () => {
    try {
      const formulaDoc = await getDoc(doc(db, 'formulas', formulaId!));
      if (formulaDoc.exists()) {
        setFormula({ id: formulaDoc.id, ...formulaDoc.data() } as Formula);
        await fetchProducts(formulaDoc.data());
      }
    } catch (error) {
      console.error('Error fetching formula:', error);
      toast.error('Erreur lors du chargement de la formule');
    }
  };

  const fetchProducts = async (formulaData: any) => {
    try {
      const productPromises = [
        ...(formulaData.starterIds || []),
        ...(formulaData.mainIds || []),
        ...(formulaData.dessertIds || [])
      ].map(id => getDoc(doc(db, 'products', id)));

      const productDocs = await Promise.all(productPromises);
      const productsData = productDocs
        .filter(doc => doc.exists())
        .map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
      
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Erreur lors du chargement des produits');
    }
  };

  const getSteps = () => {
    if (!formula) return [];
    
    const steps = [];
    if (formula.type === 'starter_main' || formula.type === 'complete') {
      steps.push('Entrée');
    }
    steps.push('Plat');
    if (formula.type === 'main_dessert' || formula.type === 'complete') {
      steps.push('Dessert');
    }
    return steps;
  };

  const getCurrentProducts = () => {
    if (!formula) return [];
    
    const step = getSteps()[currentStep];
    switch (step) {
      case 'Entrée':
        return products.filter(p => formula.starterIds?.includes(p.id));
      case 'Plat':
        return products.filter(p => formula.mainIds?.includes(p.id));
      case 'Dessert':
        return products.filter(p => formula.dessertIds?.includes(p.id));
      default:
        return [];
    }
  };

  const handleSelection = (productId: string) => {
    const step = getSteps()[currentStep];
    switch (step) {
      case 'Entrée':
        setSelections(prev => ({ ...prev, starterId: productId }));
        break;
      case 'Plat':
        setSelections(prev => ({ ...prev, mainId: productId }));
        break;
      case 'Dessert':
        setSelections(prev => ({ ...prev, dessertId: productId }));
        break;
    }

    if (currentStep < getSteps().length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    if (!formula) return;

    addItem({
      id: formula.id,
      name: formula.name,
      price: formula.price,
      isFormula: true,
      formulaDetails: selections
    });

    toast.success('Formule ajoutée au panier');
    navigate('/');
  };

  if (!formula) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  const steps = getSteps();
  const currentProducts = getCurrentProducts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-rose-600 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Retour au menu
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{formula.name}</h1>
        <p className="mt-2 text-gray-600">{formula.description}</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {steps.map((step, index) => (
            <div
              key={step}
              className="flex-1 flex flex-col items-center"
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${index < currentStep ? 'bg-rose-600 text-white' :
                  index === currentStep ? 'bg-rose-600 text-white' :
                  'bg-gray-200 text-gray-600'}
              `}>
                {index < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span className="mt-2 text-sm font-medium text-gray-600">{step}</span>
            </div>
          ))}
          <div
            className="absolute top-4 left-0 h-0.5 bg-gray-200 -z-10"
            style={{ width: '100%' }}
          />
          <div
            className="absolute top-4 left-0 h-0.5 bg-rose-600 transition-all duration-300 -z-10"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentProducts.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => handleSelection(product.id)}
          >
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
              <p className="mt-1 text-gray-500">{product.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          className={`flex items-center px-4 py-2 rounded-xl ${
            currentStep === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-rose-600 hover:bg-rose-50'
          }`}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Précédent
        </button>
        {currentStep === steps.length - 1 && (
          <button
            onClick={handleComplete}
            className="flex items-center px-6 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700"
          >
            Terminer
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};

export default FormulaSelection;