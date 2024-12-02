import React from 'react';
import { useOrders } from '../../../hooks/useOrders';
import OrderList from './OrderList';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { generateInvoicePDF } from '../../../utils/invoice';
import { toast } from 'react-hot-toast';
import { Order } from '../../../types';

const Orders = () => {
  const { loading, filter, setFilter, getFilteredOrders, updateOrderStatus } = useOrders();

  const handleDownloadInvoice = async (order: Order) => {
    try {
      await generateInvoicePDF({
        order,
        company: order.company,
        userEmail: order.user?.email || null
      });
      toast.success('Facture téléchargée');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Erreur lors du téléchargement de la facture');
    }
  };

  const handleExportCSV = () => {
    const orders = getFilteredOrders();
    const csvContent = orders
      .map(order => {
        return [
          order.id,
          order.company?.name,
          order.user?.email,
          new Date(order.deliveryDate.seconds * 1000).toLocaleDateString(),
          order.total.toFixed(2),
          order.status
        ].join(',');
      })
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'commandes.csv';
    a.click();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Commandes</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Exporter CSV
          </button>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
          >
            <option value="all">Toutes les commandes</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmées</option>
            <option value="delivered">Livrées</option>
          </select>
        </div>
      </div>

      <OrderList
        orders={getFilteredOrders()}
        onUpdateStatus={updateOrderStatus}
        onDownloadInvoice={handleDownloadInvoice}
      />
    </div>
  );
};

export default Orders;