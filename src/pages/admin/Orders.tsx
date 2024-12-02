import React, { useState } from 'react';
import { useOrders } from '../../hooks/useOrders';
import OrderList from './Orders/OrderList';
import { generateInvoicePDF } from '../../utils/invoice';
import { toast } from 'react-hot-toast';
import { Order } from '../../types';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Calendar, Building2, Clock } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { fr } from 'date-fns/locale';
import { formatDate } from '../../utils/date';

const Orders = () => {
  const { orders, loading } = useOrders({ isAdmin: true });
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'delivered'>('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('all');

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast.success('Statut de la commande mis à jour');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDelete = async (orderId: string) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      toast.success('Commande supprimée');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Erreur lors de la suppression de la commande');
    }
  };

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
    const filteredOrders = getFilteredOrders();
    const csvContent = [
      ['ID', 'Entreprise', 'Email', 'Date de livraison', 'Total', 'Statut'],
      ...filteredOrders.map(order => [
        order.id,
        order.company?.name || 'N/A',
        order.user?.email || 'N/A',
        formatDate(order.deliveryDate),
        order.total.toFixed(2),
        order.status
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `commandes_${formatDate(new Date())}.csv`;
    link.click();
  };

  const getFilteredOrders = () => {
    return orders.filter(order => {
      // Filter by status
      if (filter !== 'all' && order.status !== filter) {
        return false;
      }

      // Filter by company
      if (selectedCompany !== 'all' && order.company?.id !== selectedCompany) {
        return false;
      }

      // Filter by date
      if (selectedDate) {
        const orderDate = new Date(order.deliveryDate.seconds * 1000);
        return orderDate.toDateString() === selectedDate.toDateString();
      }

      return true;
    });
  };

  // Get unique companies from orders
  const companies = Array.from(new Set(
    orders
      .filter(order => order.company)
      .map(order => ({ id: order.company!.id, name: order.company!.name }))
  ));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Commandes</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Exporter CSV
          </button>

          <div className="relative">
            <DatePicker
              selected={selectedDate}
              onChange={setSelectedDate}
              dateFormat="dd/MM/yyyy"
              locale={fr}
              isClearable
              placeholderText="Filtrer par date"
              customInput={
                <button className="flex items-center px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-rose-300 hover:shadow-md transition-all duration-200">
                  <Calendar className="h-5 w-5 text-rose-500 mr-2" />
                  <span className="text-gray-700">
                    {selectedDate ? formatDate(selectedDate) : 'Filtrer par date'}
                  </span>
                </button>
              }
            />
          </div>

          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="flex items-center px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-rose-300 hover:shadow-md transition-all duration-200"
          >
            <option value="all">Toutes les entreprises</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="flex items-center px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-rose-300 hover:shadow-md transition-all duration-200"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmées</option>
            <option value="delivered">Livrées</option>
          </select>
        </div>
      </div>

      <OrderList
        orders={getFilteredOrders()}
        onUpdateStatus={handleUpdateStatus}
        onDownloadInvoice={handleDownloadInvoice}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Orders;