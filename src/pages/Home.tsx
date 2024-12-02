import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Clock, Building2, Calendar } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Délicieux repas livrés</span>
            <span className="block text-indigo-600">à votre entreprise</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Commandez des repas savoureux pour votre équipe. Livraison le lendemain garantie.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                to="/menu"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
              >
                Voir le menu
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center text-center"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Large choix</h3>
              <p className="mt-2 text-base text-gray-500">
                Une sélection variée de plats préparés par nos chefs
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col items-center text-center"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Livraison ponctuelle</h3>
              <p className="mt-2 text-base text-gray-500">
                Livraison garantie à l'heure souhaitée
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col items-center text-center"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Entreprises</h3>
              <p className="mt-2 text-base text-gray-500">
                Service dédié aux professionnels
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col items-center text-center"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Commande anticipée</h3>
              <p className="mt-2 text-base text-gray-500">
                Planifiez vos repas à l'avance
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;