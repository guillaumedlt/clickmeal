import React from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { Order } from '../../../types';
import OrderCard from './OrderCard';

interface OrderListProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: Order['status']) => Promise<void>;
  onDownloadInvoice: (order: Order) => Promise<void>;
  onDelete: (orderId: string) => Promise<void>;
}

const OrderList: React.FC<OrderListProps> = ({ orders, onUpdateStatus, onDownloadInvoice, onDelete }) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande</h3>
        <p className="mt-1 text-sm text-gray-500">
          Les commandes apparaîtront ici une fois que les clients commenceront à commander.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order, index) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <OrderCard
            order={order}
            onUpdateStatus={onUpdateStatus}
            onDownloadInvoice={onDownloadInvoice}
            onDelete={onDelete}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default OrderList;