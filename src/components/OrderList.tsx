import React from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { Order } from '../types';
import OrderCard from './OrderCard';

interface OrderListProps {
  orders: Order[];
  onDownloadInvoice: (order: Order) => Promise<void>;
}

const OrderList: React.FC<OrderListProps> = ({ orders, onDownloadInvoice }) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande</h3>
        <p className="mt-1 text-sm text-gray-500">
          Vous n'avez pas encore passé de commande.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order, index) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <OrderCard
            order={order}
            onDownloadInvoice={onDownloadInvoice}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default OrderList;