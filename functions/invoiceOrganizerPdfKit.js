const PDFDocument = require('pdfkit');

function currency(val) {
  const n = Number(val || 0);
  return isFinite(n) ? n : 0;
}

function makeDoc(invoiceData = {}) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  return doc;
}

async function generateOrganizerInvoicePdfBuffer(invoiceData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = makeDoc(invoiceData);
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('error', reject);
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      const company = invoiceData.company || {};
      const customer = invoiceData.customer || {};
      const provider = invoiceData.provider || {};
      const items = Array.isArray(invoiceData.items) ? invoiceData.items : [];
      const invoiceNumber = invoiceData.invoiceNumber || 'RECEIPT';
      const invoiceDate = invoiceData.invoiceDate || new Date().toLocaleDateString('en-IN');
      const totalAmount = currency(invoiceData.totalAmount);

      // Header with company logo placeholder and title
      const startY = 50;
      doc.fontSize(14).font('Helvetica-Bold').text(company.name || 'Urban Pilgrim', 40, startY);
      
      doc.fontSize(12).font('Helvetica-Bold')
        .text('TAX INVOICE/PAYMENT RECEIPT ON', 320, startY, { align: 'right' })
        .text('BEHALF OF SERVICE PROFESSIONAL', 320, startY + 15, { align: 'right' });

      // Left column - Customer details
      let yPos = 140;
      doc.fontSize(10).font('Helvetica-Bold').text('Customer Name', 40, yPos);
      doc.fontSize(9).font('Helvetica').text(customer.name || 'Customer', 40, yPos + 15);

      yPos += 50;
      doc.fontSize(10).font('Helvetica-Bold').text('Receipt no.', 40, yPos);
      doc.fontSize(9).font('Helvetica').text(invoiceNumber, 40, yPos + 15);

      yPos += 50;
      doc.fontSize(10).font('Helvetica-Bold').text('Delivery Address', 40, yPos);
      doc.fontSize(9).font('Helvetica').text(customer.address || '', 40, yPos + 15, { width: 220 });

      yPos += 70;
      doc.fontSize(10).font('Helvetica-Bold').text('Receipt Date', 40, yPos);
      doc.fontSize(9).font('Helvetica').text(invoiceDate, 40, yPos + 15);

      // Right column - Delivery Service Provider (Organizer)
      yPos = 140;
      doc.fontSize(10).font('Helvetica-Bold').text('DELIVERY SERVICE PROVIDER', 320, yPos);

      yPos += 25;
      doc.fontSize(10).font('Helvetica-Bold').text('Business Name', 320, yPos);
      doc.fontSize(9).font('Helvetica').text(provider.name || '', 320, yPos + 15, { width: 235 });

      yPos += 50;
      doc.fontSize(10).font('Helvetica-Bold').text('Address', 320, yPos);
      doc.fontSize(9).font('Helvetica').text(provider.address || '', 320, yPos + 15, { width: 235 });

      // Items section
      yPos = 380;
      doc.fontSize(10).font('Helvetica-Bold').text('Items', 40, yPos);
      doc.fontSize(9).font('Helvetica').text('Taxable Value', 480, yPos, { align: 'right' });

      yPos += 25;
      // Items table
      for (const it of items) {
        const title = (it.title || '').toString();
        const gross = currency(it.gross);
        const discount = currency(it.discount);
        const taxable = currency(it.taxableValue);

        doc.fontSize(9).font('Helvetica').text(title, 40, yPos, { width: 400 });
        yPos += 20;

        // Right aligned amounts
        const amountX = 430;
        let amountY = yPos - 20;
        doc.fontSize(9).font('Helvetica').text('Gross Amount', amountX, amountY);
        doc.text(`Rs. ${gross.toFixed(0)}`, 500, amountY, { align: 'right' });
        
        amountY += 20;
        doc.text('Discount', amountX, amountY);
        doc.text(`- Rs. ${discount.toFixed(0)}`, 500, amountY, { align: 'right' });
        
        amountY += 20;
        doc.text('Taxable Value', amountX, amountY);
        doc.text(`Rs. ${taxable.toFixed(0)}`, 500, amountY, { align: 'right' });

        yPos = amountY + 30;
      }

      // Total
      yPos += 10;
      doc.fontSize(11).font('Helvetica-Bold').text('TOTAL AMOUNT', 40, yPos);
      doc.text(`Rs. ${totalAmount.toFixed(0)}`, 500, yPos, { align: 'right' });

      // Footer disclaimer
      yPos += 40;
      doc.fontSize(7).font('Helvetica')
        .text('*This is not an official invoice or tax document. This is a payment receipt for monies paid by you to the professional for purchase of spares/tools/consumables basis your instructions to be used', 40, yPos, { width: 515, align: 'justify' })
        .text('in rendering of the service. It is inclusive of price of such items, cost of sourcing and partner conveyance.', 40, yPos + 10, { width: 515, align: 'justify' })
        .text('**Please request the Service Provider for the original invoice of the materials procured on your behalf - this will be provided if available.', 40, yPos + 20, { width: 515, align: 'justify' });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = { generateOrganizerInvoicePdfBuffer };
