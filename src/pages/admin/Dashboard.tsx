import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, Package, Tags, Building2, UtensilsCrossed, Users, Tag } from 'lucide-react';
import Products from './Products';
import Categories from './Categories';
import Companies from './Companies';
import Formulas from './Formulas';
import UsersComponent from './Users';
import PromoCodes from './PromoCodes';

const Dashboard = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Vue d\'ensemble', href: '/admin', icon: LayoutGrid, emoji: '📊' },
    { name: 'Produits', href: '/admin/products', icon: Package, emoji: '🍽️' },
    { name: 'Formules', href: '/admin/formulas', icon: UtensilsCrossed, emoji: '🍱' },
    { name: 'Catégories', href: '/admin/categories', icon: Tags, emoji: '🏷️' },
    { name: 'Codes Promo', href: '/admin/promo-codes', icon: Tag, emoji: '🎟️' },
    { name: 'Entreprises', href: '/admin/companies', icon: Building2, emoji: '🏢' },
    { name: 'Utilisateurs', href: '/admin/users', icon: Users, emoji: '👥' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-rose-500 text-transparent bg-clip-text">
              Administration
            </h2>
          </div>
          <nav className="mt-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-6 py-4 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-rose-50 text-rose-600 border-r-4 border-rose-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-rose-600'
                  }`}
                >
                  <span className="mr-3 text-xl">{item.emoji}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="products/*" element={<Products />} />
            <Route path="formulas/*" element={<Formulas />} />
            <Route path="categories/*" element={<Categories />} />
            <Route path="promo-codes/*" element={<PromoCodes />} />
            <Route path="companies/*" element={<Companies />} />
            <Route path="users/*" element={<UsersComponent />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const Overview = () => {
  const stats = [
    { name: 'Produits actifs', value: '24', emoji: '🍽️' },
    { name: 'Formules', value: '8', emoji: '🍱' },
    { name: 'Catégories', value: '6', emoji: '🏷️' },
    { name: 'Codes Promo', value: '4', emoji: '🎟️' },
    { name: 'Entreprises', value: '12', emoji: '🏢' },
    { name: 'Utilisateurs', value: '45', emoji: '👥' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Vue d'ensemble</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{stat.emoji}</span>
              <span className="text-2xl font-bold text-rose-600">{stat.value}</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">{stat.name}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;