const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateReceipt = async (orderData, outputPath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    // Branding - Signature Header
    doc.fillColor('#C5A059') // Elite Gold
       .fontSize(24)
       .text('Parfum d\'Élite', { align: 'center' })
       .fontSize(10)
       .text('THE VAULT OF SCENTED PERFECTION', { align: 'center', characterSpacing: 2 })
       .moveDown(2);

    // Divider
    doc.moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .strokeColor('#EEEEEE')
       .stroke()
       .moveDown(2);

    // Customer & Order Info
    doc.fillColor('#000000')
       .fontSize(12)
       .text(`Receipt Reference: ${orderData.reference}`)
       .text(`Date: ${new Date().toLocaleDateString('en-GB')}`)
       .moveDown();

    doc.text(`Customer: ${orderData.userName || 'Valued Client'}`)
       .text(`Email: ${orderData.userEmail}`)
       .moveDown(2);

    // Table Header
    const tableTop = doc.y;
    doc.font('Helvetica-Bold')
       .text('Fragrance', 50, tableTop)
       .text('Qty', 350, tableTop)
       .text('Amount', 450, tableTop, { align: 'right' });
    
    doc.moveTo(50, tableTop + 15)
       .lineTo(550, tableTop + 15)
       .stroke()
       .moveDown();

    // Line Items
    doc.font('Helvetica');
    let currentY = tableTop + 25;
    
    orderData.items.forEach(item => {
      doc.text(item.name, 50, currentY)
         .text(item.quantity.toString(), 350, currentY)
         .text(`GHS ${item.price.toFixed(2)}`, 450, currentY, { align: 'right' });
      currentY += 20;
    });

    // Total Section
    doc.moveDown(2);
    const totalY = currentY + 10;
    doc.font('Helvetica-Bold')
       .fontSize(14)
       .text('Total Paid (Full Allocation)', 50, totalY)
       .text(`GHS ${orderData.totalAmount.toFixed(2)}`, 450, totalY, { align: 'right' });

    // Footer - The Ritual
    doc.moveDown(4);
    doc.fontSize(10)
       .font('Helvetica-Oblique')
       .fillColor('#888888')
       .text('Your allocation is secured. Our curators are preparing your selection for the upcoming batch.', { align: 'center' })
       .moveDown()
       .fillColor('#C5A059')
       .text('Welcome to the Elite.', { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
};

module.exports = { generateReceipt };
