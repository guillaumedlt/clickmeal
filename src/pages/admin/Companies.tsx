import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'react-hot-toast';
import { Building2, MapPin, Calendar, Trash2, Plus, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Company {
  id: string;
  name: string;
  address: string;
  createdAt: Date;
}

const Companies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'companies'));
      const companiesData = snapshot.docs.map(doc => {
        const data = doc.data();
        let createdAtDate: Date;
        if (data.createdAt instanceof Timestamp) {
          createdAtDate = data.createdAt.toDate();
        } else if (data.createdAt?.seconds) {
          createdAtDate = new Timestamp(data.createdAt.seconds, data.createdAt.nanoseconds).toDate();
        } else {
          createdAtDate = new Date();
        }

        return {
          id: doc.id,
          name: data.name || '',
          address: data.address || '',
          createdAt: createdAtDate
        };
      });
      setCompanies(companiesData);
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      toast.error('Erreur lors du chargement des entreprises');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const companyData = {
        name: formData.name,
        address: formData.address,
        createdAt: new Date()
      };

      if (editingCompany) {
        await updateDoc(doc(db, 'companies', editingCompany.id), companyData);
        toast.success('Entreprise mise à jour');
      } else {
        await addDoc(collection(db, 'companies'), companyData);
        toast.success('Entreprise ajoutée');
      }

      setIsModalOpen(false);
      setEditingCompany(null);
      setFormData({ name: '', address: '' });
      fetchCompanies();
    } catch (error: any) {
      console.error('Error saving company:', error);
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) {
      try {
        await deleteDoc(doc(db, 'companies', id));
        toast.success('Entreprise supprimée');
        fetchCompanies();
      } catch (error: any) {
        console.error('Error deleting company:', error);
        toast.error(error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Entreprises</h1>
        <button
          onClick={() => {
            setEditingCompany(null);
            setFormData({ name: '', address: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter une entreprise
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div
            key={company.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <Building2 className="h-6 w-6 text-indigo-600" />
                  <h3 className="ml-2 text-lg font-semibold text-gray-900">
                    {company.name}
                  </h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingCompany(company);
                      setFormData({
                        name: company.name,
                        address: company.address
                      });
                      setIsModalOpen(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(company.id)}
                    className="text-red-600 hover:text-red-800 transition-colors duration-200"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <p className="ml-2 text-gray-600">{company.address}</p>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <p className="ml-2 text-sm text-gray-500">
                    Inscrit le {format(company.createdAt, 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {companies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune entreprise</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par ajouter une entreprise en cliquant sur le bouton ci-dessus.
          </p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingCompany ? 'Modifier l\'entreprise' : 'Ajouter une entreprise'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Adresse</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
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
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {editingCompany ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;