import React from 'react';
import { Package } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ElementType;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon: Icon = Package 
}) => {
  return (
    <div className="text-center py-12">
      <Icon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
};

export default EmptyState;