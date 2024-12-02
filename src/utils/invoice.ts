import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface InvoiceData {
  order: any;
  company: any;
  userEmail: string | null;
}

export const generateInvoicePDF = async (data: InvoiceData) => {
  const { order, company, userEmail } = data;
  const doc = new jsPDF();

  try {
    // Add logo and header
    doc.setFontSize(20);
    doc.text('ClickMeal', 20, 20);
    
    doc.setFontSize(10);
    doc.text('Facture', 20, 30);
    doc.text(`N° ${order.id}`, 20, 35);

    // Format creation date
    const createdAtDate = order.createdAt?.seconds 
      ? new Date(order.createdAt.seconds * 1000)
      : new Date();
    doc.text(`Date: ${format(createdAtDate, 'dd/MM/yyyy')}`, 20, 40);

    // Add company information
    doc.setFontSize(12);
    doc.text('Informations client:', 20, 55);
    doc.setFontSize(10);
    doc.text(company?.name || 'N/A', 20, 62);
    doc.text(company?.address || 'N/A', 20, 67);
    doc.text(userEmail || 'N/A', 20, 72);

    // Add order details
    doc.setFontSize(12);
    doc.text('Détails de la commande:', 20, 87);
    
    const tableData = order.products.map((product: any) => [
      product.name,
      product.quantity,
      `${product.price.toFixed(2)}€`,
      `${(product.price * product.quantity).toFixed(2)}€`
    ]);

    // @ts-ignore
    doc.autoTable({
      startY: 92,
      head: [['Produit', 'Quantité', 'Prix unitaire', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [229, 62, 62] }
    });

    // Add total
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Total: ${order.total.toFixed(2)}€`, 150, finalY);

    // Format delivery date
    const deliveryDate = order.deliveryDate?.seconds 
      ? new Date(order.deliveryDate.seconds * 1000)
      : new Date();

    // Add delivery information
    doc.setFontSize(10);
    doc.text('Informations de livraison:', 20, finalY + 20);
    doc.text(`Date: ${format(deliveryDate, 'dd MMMM yyyy', { locale: fr })}`, 20, finalY + 27);
    doc.text('Heure: Entre 11h30 et 12h30', 20, finalY + 34);

    // Save the PDF
    doc.save(`facture-${order.id}.pdf`);
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw new Error('Failed to generate invoice');
  }
};