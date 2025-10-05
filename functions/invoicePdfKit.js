const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function currency(val) {
  const n = Number(val || 0);
  return isFinite(n) ? n : 0;
}

function makeDoc(invoiceData = {}) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  return doc;
}

async function generateInvoicePdfBuffer(invoiceData) {
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
      const invoiceNumber = invoiceData.invoiceNumber || 'INVOICE';
      const invoiceDate = invoiceData.invoiceDate || new Date().toLocaleDateString('en-IN');
      const totalAmount = currency(invoiceData.totalAmount);

      // Header with logo and TAX INVOICE
      const startY = 50;
      
      // Try to add logo
      try {
        const logoPath = path.join(__dirname, 'urban_pilgrim_logo.png');
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 40, startY, { width: 80, height: 80 });
        } else {
          doc.fontSize(16).font('Helvetica-Bold').text(company.name || 'Urban Pilgrim', 40, startY);
        }
      } catch (e) {
        doc.fontSize(16).font('Helvetica-Bold').text(company.name || 'Urban Pilgrim', 40, startY);
      }
      
      doc.fontSize(20).font('Helvetica-Bold').text('TAX INVOICE', 400, startY, { align: 'right' });
      
      // Company details (left side) - 10px gap after logo
      doc.fontSize(9).font('Helvetica')
        .text(company.address || '', 40, startY + 90, { width: 250 })
        .text(company.email ? `Email: ${company.email}` : '', 40)
        .text(company.phone ? `Telephone: ${company.phone}` : '', 40)
        .text(company.cin ? `CIN: ${company.cin}` : '', 40)
        .text(company.website ? `www.${company.website}` : '', 40);

      // Horizontal line
      doc.moveTo(40, 180).lineTo(555, 180).stroke();

      // Left column - Customer details
      let yPos = 200;
      doc.fontSize(10).font('Helvetica-Bold').text('Customer Name', 40, yPos);
      doc.fontSize(9).font('Helvetica').text(customer.name || 'Customer', 40, yPos + 15);

      yPos += 40;
      doc.fontSize(10).font('Helvetica-Bold').text('Invoice no.', 40, yPos);
      doc.fontSize(9).font('Helvetica').text(invoiceNumber, 40, yPos + 15);

      yPos += 40;
      doc.fontSize(10).font('Helvetica-Bold').text('Delivery Address', 40, yPos);
      doc.fontSize(9).font('Helvetica').text(customer.address || '', 40, yPos + 15, { width: 220 });

      yPos += 60;
      doc.fontSize(10).font('Helvetica-Bold').text('Invoice Date', 40, yPos);
      doc.fontSize(9).font('Helvetica').text(invoiceDate, 40, yPos + 15);

      yPos += 40;
      doc.fontSize(10).font('Helvetica-Bold').text('State Name & Code', 40, yPos);
      doc.fontSize(9).font('Helvetica').text(customer.state || '', 40, yPos + 15);

      yPos += 40;
      doc.fontSize(10).font('Helvetica-Bold').text('Place of Supply', 40, yPos);
      doc.fontSize(9).font('Helvetica').text(customer.placeOfSupply || customer.state || '', 40, yPos + 15);

      // Right column - Delivery Service Provider
      yPos = 200;
      doc.fontSize(10).font('Helvetica-Bold').text('DELIVERY SERVICE PROVIDER', 320, yPos);

      yPos += 25;
      doc.fontSize(10).font('Helvetica-Bold').text('Business GSTIN', 320, yPos);
      doc.fontSize(9).font('Helvetica').text(provider.gstin || '', 320, yPos + 15);

      yPos += 40;
      doc.fontSize(10).font('Helvetica-Bold').text('Business Name', 320, yPos);
      doc.fontSize(9).font('Helvetica').text(provider.name || company.name || '', 320, yPos + 15, { width: 235 });

      yPos += 60;
      doc.fontSize(10).font('Helvetica-Bold').text('Address', 320, yPos);
      doc.fontSize(9).font('Helvetica').text(provider.address || '', 320, yPos + 15, { width: 235 });

      yPos += 60;
      doc.fontSize(10).font('Helvetica-Bold').text('State Name & Code', 320, yPos);
      doc.fontSize(9).font('Helvetica').text(provider.state || '', 320, yPos + 15);

      // Items section
      yPos = 480;
      doc.fontSize(10).font('Helvetica-Bold').text('Items', 40, yPos);
      doc.fontSize(9).font('Helvetica').text('Taxable Value', 480, yPos, { align: 'right' });

      yPos += 25;
      // Items table
      for (const it of items) {
        const title = (it.title || '').toString();
        const sac = (it.sac || '').toString();
        const gross = currency(it.gross);
        const discount = currency(it.discount);
        const taxable = currency(it.taxableValue);
        const igst = currency(it.igst);

        doc.fontSize(9).font('Helvetica').text(title, 40, yPos, { width: 400 });
        yPos += 15;
        if (sac) {
          doc.fontSize(8).font('Helvetica').text(`SAC: ${sac}`, 40, yPos);
          yPos += 15;
        }

        // Right aligned amounts
        const amountX = 430;
        let amountY = yPos - (sac ? 30 : 15);
        doc.fontSize(9).font('Helvetica').text('Gross Amount', amountX, amountY);
        doc.text(`Rs. ${gross.toFixed(2)}`, 500, amountY, { align: 'right' });
        
        amountY += 15;
        doc.text('Discount', amountX, amountY);
        doc.text(`- Rs. ${discount.toFixed(2)}`, 500, amountY, { align: 'right' });
        
        amountY += 15;
        doc.text('Taxable Value', amountX, amountY);
        doc.text(`Rs. ${taxable.toFixed(2)}`, 500, amountY, { align: 'right' });
        
        amountY += 15;
        const gstRate = igst > 0 ? ((igst / taxable) * 100).toFixed(0) : '18';
        doc.text(`IGST @${gstRate}%`, amountX, amountY);
        doc.text(`Rs. ${igst.toFixed(2)}`, 500, amountY, { align: 'right' });

        yPos = amountY + 25;
      }

      // Total
      yPos += 10;
      doc.fontSize(11).font('Helvetica-Bold').text('TOTAL AMOUNT', 40, yPos);
      doc.text(`Rs. ${totalAmount.toFixed(0)}`, 500, yPos, { align: 'right' });

      // Signature section
      const signatureY = 720;
      
      // Try to add signature image
      try {
        const signaturePath = path.join(__dirname, 'admin_signature.png');
        if (fs.existsSync(signaturePath)) {
          doc.image(signaturePath, 450, signatureY - 40, { width: 100, height: 40 });
        }
      } catch (e) {
        // Signature image not found, just show text
      }
      
      doc.fontSize(9).font('Helvetica').text('Authorized Signatory', 480, signatureY, { align: 'right' });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = { generateInvoicePdfBuffer };
