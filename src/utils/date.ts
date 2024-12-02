import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

export const formatDate = (date: Date | Timestamp | { seconds: number; nanoseconds: number } | null): string => {
  if (!date) return '';
  
  try {
    if (date instanceof Timestamp) {
      return format(date.toDate(), 'dd MMMM yyyy', { locale: fr });
    }
    
    if (date instanceof Date) {
      return format(date, 'dd MMMM yyyy', { locale: fr });
    }
    
    if ('seconds' in date) {
      return format(new Date(date.seconds * 1000), 'dd MMMM yyyy', { locale: fr });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
  
  return '';
};

export const timestampToDate = (timestamp: Timestamp | { seconds: number; nanoseconds: number } | null): Date | null => {
  if (!timestamp) return null;
  
  try {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    
    if ('seconds' in timestamp) {
      return new Date(timestamp.seconds * 1000);
    }
  } catch (error) {
    console.error('Error converting timestamp to date:', error);
    return null;
  }
  
  return null;
};