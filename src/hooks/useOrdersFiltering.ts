import { useState, useMemo } from 'react';
import { Order } from '../types';
import { startOfDay, endOfDay, isWithinInterval } from 'date-fns';

export const useOrdersFiltering = (orders: Order[]) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Company filter
      if (selectedCompanyId !== 'all' && order.companyId !== selectedCompanyId) {
        return false;
      }

      // Date filter
      if (selectedDate) {
        const orderDate = new Date(order.deliveryDate.seconds * 1000);
        const start = startOfDay(selectedDate);
        const end = endOfDay(selectedDate);
        
        if (!isWithinInterval(orderDate, { start, end })) {
          return false;
        }
      }

      return true;
    });
  }, [orders, selectedCompanyId, selectedDate]);

  const companies = useMemo(() => {
    const uniqueCompanies = new Map();
    orders.forEach(order => {
      if (order.company && !uniqueCompanies.has(order.companyId)) {
        uniqueCompanies.set(order.companyId, order.company);
      }
    });
    return Array.from(uniqueCompanies.entries()).map(([id, company]) => ({
      id,
      ...company
    }));
  }, [orders]);

  return {
    filteredOrders,
    companies,
    selectedCompanyId,
    setSelectedCompanyId,
    selectedDate,
    setSelectedDate
  };
};