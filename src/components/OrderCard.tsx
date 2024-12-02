import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, CreditCard, Download } from 'lucide-react';
import { Order } from '../types';
import OrderStatus from './OrderStatus';

interface OrderCardProps {
  order: Order;
  onDownloadInvoice: (order: Order) => Promise<void>;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onDownloadInvoice }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <OrderStatus status={order.status} />
          <span className="text-sm text-gray-500">
            Commande #{order.id.slice(-6)}
          </span>
        </div>
        <button
          onClick={() => onDownloadInvoice(order)}
          className="flex items-center text-rose-600 hover:text-rose-700 transition-colors"
        >
          <Download className="h-4 w-4 mr-1" />
          Facture
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-2" />
          Livraison le {format(new Date(order.deliveryDate.seconds * 1000), 'dd MMMM yyyy', { locale: fr })}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-2" />
          Entre 11h30 et 12h30
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <CreditCard className="h-4 w-4 mr-2" />
          Total: {order.total.toFixed(2)}€
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Produits commandés</h4>
        <ul className="space-y-2">
          {order.products.map((product, index) => (
            <li key={index} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {product.quantity}x {product.name}
              </span>
              <span className="text-gray-900 font-medium">
                {(product.price * product.quantity).toFixed(2)}€
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrderCard;