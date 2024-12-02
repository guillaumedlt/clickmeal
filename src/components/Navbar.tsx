import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  ShoppingCart, 
  User, 
  LogOut, 
  LayoutDashboard,
  ChevronDown
} from 'lucide-react';
import Cart from './Cart';

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuthStore();
  const { items } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link to="/" className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-rose-600" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 text-transparent bg-clip-text">
                ClickMeal
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              {user && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 text-gray-700 hover:text-rose-600 transition-colors"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {items.length}
                    </span>
                  )}
                </button>
              )}
              
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <User className="h-5 w-5 text-gray-600" />
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 py-1"
                      >
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-rose-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Mon profil
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-rose-50"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Dashboard Admin
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            handleSignOut();
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-rose-50"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Déconnexion
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link 
                  to="/login"
                  className="flex items-center px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <User className="h-5 w-5 mr-2" />
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;