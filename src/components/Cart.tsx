import React, { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Minus, Plus, Trash2, X, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { PromoCode } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { items, removeItem, updateQuantity, total, deliveryDate, clearCart, subtotal, discount, promoCode, applyPromoCode, removePromoCode } = useCartStore();
  const { user } = useAuthStore();
  const [promoInput, setPromoInput] = useState('');
  const [isApplyingCode, setIsApplyingCode] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour commander');
      return;
    }

    if (!deliveryDate) {
      toast.error('Veuillez sélectionner une date de livraison');
      return;
    }

    try {
      const order = {
        userId: user.uid,
        companyId: user.uid,
        products: items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          isFormula: item.isFormula,
          formulaDetails: item.formulaDetails
        })),
        subtotal: subtotal(),
        discount: discount(),
        total: total(),
        promoCode: promoCode?.code,
        deliveryDate,
        status: 'pending',
        createdAt: new Date()
      };

      await addDoc(collection(db, 'orders'), order);
      clearCart();
      toast.success('Commande effectuée avec succès');
      onClose();
    } catch (error: any) {
      toast.error('Erreur lors de la commande');
    }
  };

  const handleApplyPromoCode = async () => {
    if (!promoInput) return;

    setIsApplyingCode(true);
    try {
      const promoSnapshot = await getDocs(
        query(
          collection(db, 'promoCodes'),
          where('code', '==', promoInput.toUpperCase()),
          where('active', '==', true)
        )
      );

      if (promoSnapshot.empty) {
        toast.error('Code promo invalide');
        return;
      }

      const promoDoc = promoSnapshot.docs[0];
      const promoData = promoDoc.data() as PromoCode;
      const now = new Date();

      if (now < promoData.validFrom.toDate() || now > promoData.validUntil.toDate()) {
        toast.error('Code promo expiré');
        return;
      }

      if (promoData.maxUses && promoData.usedCount >= promoData.maxUses) {
        toast.error('Code promo épuisé');
        return;
      }

      applyPromoCode({ id: promoDoc.id, ...promoData });
      setPromoInput('');
    } catch (error) {
      console.error('Error applying promo code:', error);
      toast.error('Erreur lors de l\'application du code promo');
    } finally {
      setIsApplyingCode(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween' }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center">
                  <ShoppingCart className="h-6 w-6 text-rose-600" />
                  <h2 className="ml-3 text-xl font-semibold text-gray-900">Votre panier</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-500">Votre panier est vide</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {items.map((item) => (
                      <div
                        key={item.id + (item.formulaDetails ? JSON.stringify(item.formulaDetails) : '')}
                        className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.name}</h3>
                          {item.isFormula && item.formulaDetails && (
                            <div className="mt-1 text-sm text-gray-500">
                              <p>Entrée: {item.formulaDetails.starterId}</p>
                              <p>Plat: {item.formulaDetails.mainId}</p>
                              <p>Dessert: {item.formulaDetails.dessertId}</p>
                            </div>
                          )}
                          <p className="text-rose-600 font-medium">
                            {(item.price * item.quantity).toFixed(2)}€
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            className="p-1 rounded-full hover:bg-rose-50 text-rose-600"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded-full hover:bg-rose-50 text-rose-600"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t p-6 space-y-4 bg-gray-50">
                  {/* Promo Code Section */}
                  {promoCode ? (
                    <div className="flex items-center justify-between bg-rose-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <Tag className="h-5 w-5 text-rose-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-rose-600">{promoCode.code}</p>
                          <p className="text-xs text-rose-500">{promoCode.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={removePromoCode}
                        className="text-rose-600 hover:text-rose-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        placeholder="Code promo"
                        className="flex-1 rounded-lg border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                      />
                      <button
                        onClick={handleApplyPromoCode}
                        disabled={isApplyingCode || !promoInput}
                        className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50"
                      >
                        Appliquer
                      </button>
                    </div>
                  )}

                  {deliveryDate && (
                    <div className="text-sm text-gray-600">
                      Livraison prévue le {format(deliveryDate, 'dd MMMM yyyy', { locale: fr })}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Sous-total</span>
                      <span>{subtotal().toFixed(2)}€</span>
                     </div>
                    {discount() > 0 && (
                      <div className="flex justify-between text-sm text-rose-600">
                        <span>Réduction</span>
                        <span>-{discount().toFixed(2)}€</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-lg font-semibold text-gray-900 pt-2 border-t">
                      <span>Total</span>
                      <span>{total().toFixed(2)}€</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 px-4 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors font-medium"
                  >
                    Commander
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Cart;