import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import { PromoCode } from '../../types';
import DatePicker from 'react-datepicker';
import { fr } from 'date-fns/locale';
import { formatDate } from '../../utils/date';

const PromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as PromoCode['discountType'],
    discountValue: '',
    minOrderValue: '',
    maxUses: '',
    validFrom: new Date(),
    validUntil: new Date(),
    active: true
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'promoCodes'));
      const promoCodesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        validFrom: doc.data().validFrom.toDate(),
        validUntil: doc.data().validUntil.toDate()
      })) as PromoCode[];
      setPromoCodes(promoCodesData);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      toast.error('Erreur lors du chargement des codes promo');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const promoCodeData = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : null,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        usedCount: editingPromoCode?.usedCount || 0,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        active: formData.active,
        createdAt: new Date()
      };

      if (editingPromoCode) {
        await updateDoc(doc(db, 'promoCodes', editingPromoCode.id), promoCodeData);
        toast.success('Code promo mis à jour');
      } else {
        await addDoc(collection(db, 'promoCodes'), promoCodeData);
        toast.success('Code promo ajouté');
      }

      setIsModalOpen(false);
      setEditingPromoCode(null);
      resetForm();
      fetchPromoCodes();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce code promo ?')) {
      try {
        await deleteDoc(doc(db, 'promoCodes', id));
        toast.success('Code promo supprimé');
        fetchPromoCodes();
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderValue: '',
      maxUses: '',
      validFrom: new Date(),
      validUntil: new Date(),
      active: true
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Codes Promo</h1>
        <button
          onClick={() => {
            setEditingPromoCode(null);
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter un code promo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promoCodes.map((promoCode) => (
          <div
            key={promoCode.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{promoCode.code}</h3>
                  <p className="text-sm text-gray-500">{promoCode.description}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  promoCode.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {promoCode.active ? 'Actif' : 'Inactif'}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="text-sm text-gray-600">
                  {promoCode.discountType === 'percentage' ? (
                    <span>Réduction de {promoCode.discountValue}%</span>
                  ) : (
                    <span>Réduction de {promoCode.discountValue}€</span>
                  )}
                </div>
                {promoCode.minOrderValue && (
                  <div className="text-sm text-gray-600">
                    Minimum d'achat: {promoCode.minOrderValue}€
                  </div>
                )}
                {promoCode.maxUses && (
                  <div className="text-sm text-gray-600">
                    Utilisations: {promoCode.usedCount}/{promoCode.maxUses}
                  </div>
                )}
                <div className="text-sm text-gray-600 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    Du {formatDate(promoCode.validFrom)} au {formatDate(promoCode.validUntil)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setEditingPromoCode(promoCode);
                    setFormData({
                      code: promoCode.code,
                      description: promoCode.description,
                      discountType: promoCode.discountType,
                      discountValue: promoCode.discountValue.toString(),
                      minOrderValue: promoCode.minOrderValue?.toString() || '',
                      maxUses: promoCode.maxUses?.toString() || '',
                      validFrom: promoCode.validFrom,
                      validUntil: promoCode.validUntil,
                      active: promoCode.active
                    });
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-md"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(promoCode.id)}
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
              {editingPromoCode ? 'Modifier le code promo' : 'Ajouter un code promo'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
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
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type de réduction</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as PromoCode['discountType'] })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  >
                    <option value="percentage">Pourcentage</option>
                    <option value="fixed">Montant fixe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Valeur</label>
                  <input
                    type="number"
                    step={formData.discountType === 'percentage' ? '1' : '0.01'}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Montant minimum</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Utilisations max</label>
                  <input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Valide du</label>
                  <DatePicker
                    selected={formData.validFrom}
                    onChange={(date) => setFormData({ ...formData, validFrom: date || new Date() })}
                    dateFormat="dd/MM/yyyy"
                    locale={fr}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Valide jusqu'au</label>
                  <DatePicker
                    selected={formData.validUntil}
                    onChange={(date) => setFormData({ ...formData, validUntil: date || new Date() })}
                    dateFormat="dd/MM/yyyy"
                    locale={fr}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Actif
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
                  {editingPromoCode ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCodes;