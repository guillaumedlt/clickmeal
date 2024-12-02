import React from 'react';
import { Calendar, Clock, Building2, User, CheckCircle, Download, Trash2 } from 'lucide-react';
import { Order } from '../../../types';
import { formatDate } from '../../../utils/date';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: Order['status']) => Promise<void>;
  onDownloadInvoice: (order: Order) => Promise<void>;
  onDelete: (orderId: string) => Promise<void>;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdateStatus, onDownloadInvoice, onDelete }) => {
  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          text: 'En attente',
          color: 'bg-yellow-100 text-yellow-800',
          nextAction: 'Confirmer'
        };
      case 'confirmed':
        return {
          icon: CheckCircle,
          text: 'Confirmée',
          color: 'bg-blue-100 text-blue-800',
          nextAction: 'Marquer comme livrée'
        };
      case 'delivered':
        return {
          icon: CheckCircle,
          text: 'Livrée',
          color: 'bg-green-100 text-green-800'
        };
      default:
        return {
          icon: Clock,
          text: 'Statut inconnu',
          color: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const getNextStatus = (status: Order['status']): Order['status'] | null => {
    switch (status) {
      case 'pending':
        return 'confirmed';
      case 'confirmed':
        return 'delivered';
      default:
        return null;
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      await onDelete(order.id);
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  const nextStatus = getNextStatus(order.status);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full flex items-center ${statusConfig.color}`}>
            <StatusIcon className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">{statusConfig.text}</span>
          </div>
          <span className="text-sm text-gray-500">
            Commande #{order.id.slice(-6)}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          {nextStatus && (
            <button
              onClick={() => onUpdateStatus(order.id, nextStatus)}
              className="flex items-center px-3 py-1 bg-rose-600 text-white rounded-md hover:bg-rose-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              {statusConfig.nextAction}
            </button>
          )}
          <button
            onClick={() => onDownloadInvoice(order)}
            className="flex items-center text-rose-600 hover:text-rose-700"
          >
            <Download className="h-4 w-4 mr-1" />
            Facture
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            Livraison le {formatDate(order.deliveryDate)}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            Entre 11h30 et 12h30
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Building2 className="h-4 w-4 mr-2" />
            {order.company?.name || 'Entreprise inconnue'}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-2" />
            {order.user?.email || 'Utilisateur inconnu'}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Produits commandés</h4>
          <div className="space-y-2">
            {order.products.map((product, index) => (
              <div key={index} className="flex justify-between text-sm">
                <div className="text-gray-600">
                  <span className="font-medium">{product.quantity}x</span> {product.name}
                  {product.isFormula && product.formulaDetails && (
                    <div className="ml-4 text-xs text-gray-500">
                      {product.formulaDetails.starterId && <div>Entrée: {product.formulaDetails.starterId}</div>}
                      {product.formulaDetails.mainId && <div>Plat: {product.formulaDetails.mainId}</div>}
                      {product.formulaDetails.dessertId && <div>Dessert: {product.formulaDetails.dessertId}</div>}
                    </div>
                  )}
                </div>
                <span className="font-medium text-gray-900">
                  {(product.price * product.quantity).toFixed(2)}€
                </span>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-gray-200">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{order.total.toFixed(2)}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;