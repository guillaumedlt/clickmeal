import React from 'react';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Building2, X } from 'lucide-react';

interface OrderFiltersProps {
  companies: Array<{ id: string; name: string }>;
  selectedCompanyId: string | 'all';
  onCompanyChange: (id: string | 'all') => void;
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  companies,
  selectedCompanyId,
  onCompanyChange,
  selectedDate,
  onDateChange
}) => {
  return (
    <div className="mb-6 space-y-4">
      {/* Companies filter */}
      <div className="flex flex-wrap gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCompanyChange('all')}
          className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all ${
            selectedCompanyId === 'all'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
              : 'bg-white text-gray-700 hover:bg-rose-50 hover:text-rose-600 shadow-sm hover:shadow'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Toutes les entreprises</span>
        </motion.button>

        {companies.map((company) => (
          <motion.button
            key={company.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCompanyChange(company.id)}
            className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all ${
              selectedCompanyId === company.id
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-white text-gray-700 hover:bg-rose-50 hover:text-rose-600 shadow-sm hover:shadow'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>{company.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Date filter */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <DatePicker
            selected={selectedDate}
            onChange={onDateChange}
            dateFormat="dd/MM/yyyy"
            locale={fr}
            isClearable
            placeholderText="Filtrer par date"
            customInput={
              <button className="flex items-center px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-rose-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500">
                <Calendar className="h-4 w-4 text-rose-500 mr-2" />
                <span className="text-gray-700">
                  {selectedDate ? format(selectedDate, 'dd MMMM yyyy', { locale: fr }) : 'Filtrer par date'}
                </span>
              </button>
            }
          />
          {selectedDate && (
            <button
              onClick={() => onDateChange(null)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;