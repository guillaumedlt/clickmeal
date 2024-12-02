import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCompany } from '../hooks/useCompany';
import { auth } from '../lib/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { Lock, Building2 } from 'lucide-react';

const Profile = () => {
  const { user } = useAuthStore();
  const { company, loading: companyLoading } = useCompany();
  const [activeTab, setActiveTab] = useState('security');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user!.email!,
        passwordForm.currentPassword
      );

      await reauthenticateWithCredential(auth.currentUser!, credential);
      await updatePassword(auth.currentUser!, passwordForm.newPassword);
      
      toast.success('Mot de passe mis à jour avec succès');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        toast.error('Le mot de passe actuel est incorrect');
      } else {
        toast.error('Erreur lors du changement de mot de passe');
      }
    }
  };

  if (companyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Profil</h1>

      <div className="flex space-x-4 mb-8 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center px-6 py-3 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'security'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/25'
              : 'bg-white text-gray-700 hover:bg-rose-50 hover:text-rose-600'
          }`}
        >
          <Lock className="h-5 w-5 mr-2" />
          Sécurité
        </button>
        <button
          onClick={() => setActiveTab('company')}
          className={`flex items-center px-6 py-3 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'company'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/25'
              : 'bg-white text-gray-700 hover:bg-rose-50 hover:text-rose-600'
          }`}
        >
          <Building2 className="h-5 w-5 mr-2" />
          Mon entreprise
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {activeTab === 'security' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Changer mon mot de passe</h2>
            <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value
                  })}
                  className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value
                  })}
                  className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value
                  })}
                  className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              >
                Mettre à jour le mot de passe
              </button>
            </form>
          </div>
        )}

        {activeTab === 'company' && company && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations de l'entreprise</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Nom de l'entreprise</label>
                  <p className="mt-1 text-lg text-gray-900">{company.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Adresse de livraison</label>
                  <p className="mt-1 text-lg text-gray-900">{company.address}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;