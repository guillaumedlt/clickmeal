import React from 'react';
import { Order } from '../types';
import { Clock, CheckCircle, Package } from 'lucide-react';

interface OrderStatusProps {
  status: Order['status'];
}

const OrderStatus: React.FC<OrderStatusProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          text: 'En attente de confirmation',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'confirmed':
        return {
          icon: CheckCircle,
          text: 'Commande confirmée',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'delivered':
        return {
          icon: Package,
          text: 'Commande livrée',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      default:
        return {
          icon: Clock,
          text: 'Statut inconnu',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
      <Icon className={`h-5 w-5 ${config.color}`} />
      <span className={`text-sm font-medium ${config.color}`}>{config.text}</span>
    </div>
  );
};

export default OrderStatus;