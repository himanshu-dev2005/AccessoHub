const PDFDocument = require('pdfkit');
const moment = require('moment');
const { loadSettings } = require('../../middlewares/settings');
const useLanguage = require('../../locale/useLanguage');
const { useMoney, useDate } = require('../../settings');

const supportedTypes = ['invoice', 'offer', 'quote', 'payment'];

function pdfSafeText(text) {
  if (text === undefined || text === null) return '';
  return String(text).replace(/\u20B9/g, 'INR ');
}

function generatePdfBuffer(modelName, model) {
  return new Promise(async (resolve, reject) => {
    try {
      const type = String(modelName || '').toLowerCase();
      if (!supportedTypes.includes(type)) {
        return reject(new Error(`Unsupported PDF type: ${modelName}`));
      }

      const settings = await loadSettings();
      const selectedLang =
        settings['accessohub_app_language'] || settings['idurar_app_language'] || 'en_us';
      const translate = useLanguage({ selectedLang });

      const { moneyFormatter } = useMoney({
        settings: {
          currency_symbol: settings.currency_symbol,
          currency_position: settings.currency_position,
          decimal_sep: settings.decimal_sep,
          thousand_sep: settings.thousand_sep,
          cent_precision: settings.cent_precision,
          zero_format: settings.zero_format,
        },
      });
      const { dateFormat } = useDate({ settings });

      const formatMoney = (amount) =>
        pdfSafeText(moneyFormatter({ amount: Number(amount || 0), currency_code: model.currency }));

      const formatDate = (dateVal) =>
        dateVal ? moment(dateVal).format(dateFormat || 'DD/MM/YYYY') : '-';

      const doc = new PDFDocument({ size: 'A4', margin: 45 });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header band
      const companyName =
        settings['accessohub_app_company_name'] || settings['company_name'] || 'AccessoHub CRM';
      const companyAddress = settings['company_address'] || '';
      const companyEmail = settings['company_email'] || settings['accessohub_app_email'] || '';
      const companyTax = settings['company_tax_number'] || '';

      doc.font('Helvetica-Bold').fontSize(20).fillColor('#1E293B').text(pdfSafeText(companyName), 45, 45);
      doc.font('Helvetica').fontSize(9).fillColor('#64748B');
      let headerY = 70;
      if (companyAddress) {
        doc.text(pdfSafeText(companyAddress), 45, headerY);
        headerY += 13;
      }
      if (companyEmail) {
        doc.text(pdfSafeText(companyEmail), 45, headerY);
        headerY += 13;
      }
      if (companyTax) {
        doc.text(`Tax ID: ${pdfSafeText(companyTax)}`, 45, headerY);
      }

      const docTitle =
        type === 'payment'
          ? 'PAYMENT RECEIPT'
          : `${type.toUpperCase()}`;
      const docNumber = model.year ? `#${model.number}/${model.year}` : `#${model.number || '-'}`;

      doc.font('Helvetica-Bold').fontSize(18).fillColor('#1E40AF').text(docTitle, 340, 45, {
        align: 'right',
        width: 210,
      });
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#0F172A').text(pdfSafeText(docNumber), 340, 68, {
        align: 'right',
        width: 210,
      });
      doc.font('Helvetica').fontSize(9).fillColor('#475569');
      doc.text(`${translate('Date')}: ${formatDate(model.date)}`, 340, 86, {
        align: 'right',
        width: 210,
      });
      if (model.expiredDate) {
        doc.text(`${translate('Expire Date')}: ${formatDate(model.expiredDate)}`, 340, 99, {
          align: 'right',
          width: 210,
        });
      }
      if (model.status) {
        doc.text(`${translate('Status')}: ${String(model.status).toUpperCase()}`, 340, 112, {
          align: 'right',
          width: 210,
        });
      }

      // Divider
      doc.moveTo(45, 138).lineTo(550, 138).strokeColor('#CBD5E1').lineWidth(1).stroke();

      // Client info
      const client = model.client || {};
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#475569').text(translate('Client'), 45, 152);
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#0F172A').text(pdfSafeText(client.name || '-'), 45, 167);
      doc.font('Helvetica').fontSize(9).fillColor('#334155');
      let clientY = 183;
      for (const line of [client.company, client.address, client.email, client.phone]) {
        if (line) {
          doc.text(pdfSafeText(line), 45, clientY);
          clientY += 13;
        }
      }

      if (type === 'payment') {
        const payY = Math.max(245, clientY + 15);
        doc.roundedRect(45, payY, 505, 110, 6).fillAndStroke('#F8FAFC', '#E2E8F0');
        doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(11).text('Payment Details', 60, payY + 15);
        doc.font('Helvetica').fontSize(10).fillColor('#334155');
        doc.text(`Amount Paid: ${formatMoney(model.amount)}`, 60, payY + 38);
        doc.text(
          `Payment Mode: ${pdfSafeText(model.paymentMode?.name || '-')}`,
          60,
          payY + 56
        );
        const inv = model.invoice;
        const invLabel = inv ? (inv.year ? `#${inv.number}/${inv.year}` : `#${inv.number}`) : '-';
        doc.text(`Invoice: ${pdfSafeText(invLabel)}`, 300, payY + 38);
        doc.text(`Reference: ${pdfSafeText(model.ref || '-')}`, 300, payY + 56);
        if (model.description) {
          doc.text(`Note: ${pdfSafeText(model.description)}`, 60, payY + 78, { width: 475 });
        }
        doc.end();
        return;
      }

      // Items table
      let y = Math.max(240, clientY + 18);
      doc.rect(45, y, 505, 24).fill('#1E40AF');
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9);
      doc.text('#', 52, y + 7, { width: 25 });
      doc.text(translate('Item'), 78, y + 7, { width: 170 });
      doc.text(translate('Price'), 260, y + 7, { width: 85, align: 'right' });
      doc.text(translate('Quantity'), 355, y + 7, { width: 70, align: 'right' });
      doc.text(translate('Total'), 435, y + 7, { width: 105, align: 'right' });
      y += 24;

      const items = Array.isArray(model.items) ? model.items : [];
      items.forEach((item, idx) => {
        if (y > 690) {
          doc.addPage();
          y = 50;
        }
        const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
        doc.rect(45, y, 505, 24).fill(rowBg);
        doc.fillColor('#0F172A').font('Helvetica').fontSize(9);
        doc.text(String(idx + 1), 52, y + 7, { width: 25 });
        doc.text(pdfSafeText(item.itemName || item.description || '-'), 78, y + 7, {
          width: 175,
          ellipsis: true,
        });
        doc.text(formatMoney(item.price), 260, y + 7, { width: 85, align: 'right' });
        doc.text(String(item.quantity ?? 0), 355, y + 7, { width: 70, align: 'right' });
        doc.text(formatMoney(item.total), 435, y + 7, { width: 105, align: 'right' });
        doc.moveTo(45, y + 24).lineTo(550, y + 24).strokeColor('#E2E8F0').lineWidth(0.5).stroke();
        y += 24;
      });

      // Summary totals
      y += 16;
      if (y > 670) {
        doc.addPage();
        y = 50;
      }

      const summaryRows = [
        [translate('Sub Total'), formatMoney(model.subTotal)],
        [`${translate('Tax')} (${Number(model.taxRate || 0)}%)`, formatMoney(model.taxTotal)],
      ];
      if (Number(model.discount || 0) > 0) {
        summaryRows.push([translate('Discount'), formatMoney(model.discount)]);
      }

      summaryRows.forEach(([label, val]) => {
        doc.font('Helvetica').fontSize(10).fillColor('#475569').text(label, 330, y, {
          width: 105,
          align: 'right',
        });
        doc.font('Helvetica').fontSize(10).fillColor('#0F172A').text(val, 440, y, {
          width: 105,
          align: 'right',
        });
        y += 18;
      });

      doc.moveTo(330, y).lineTo(550, y).strokeColor('#CBD5E1').lineWidth(1).stroke();
      y += 8;
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#1E40AF').text(translate('Total'), 330, y, {
        width: 105,
        align: 'right',
      });
      doc.text(formatMoney(model.total), 440, y, { width: 105, align: 'right' });

      if (type === 'invoice') {
        y += 20;
        const paid = Number(model.credit || 0);
        const balance = Math.max(0, Number(model.total || 0) - Number(model.discount || 0) - paid);
        doc.font('Helvetica').fontSize(9).fillColor('#475569').text('Paid', 330, y, {
          width: 105,
          align: 'right',
        });
        doc.text(formatMoney(paid), 440, y, { width: 105, align: 'right' });
        y += 15;
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#0F172A').text('Balance Due', 330, y, {
          width: 105,
          align: 'right',
        });
        doc.text(formatMoney(balance), 440, y, { width: 105, align: 'right' });
      }

      if (model.notes) {
        y += 32;
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#475569').text(translate('Note'), 45, y);
        doc.font('Helvetica').fontSize(9).fillColor('#334155').text(pdfSafeText(model.notes), 45, y + 14, {
          width: 500,
        });
      }

      doc.font('Helvetica').fontSize(8).fillColor('#94A3B8').text(
        pdfSafeText(settings['invoice_footer'] || 'Thank you for your business - AccessoHub CRM'),
        45,
        770,
        { align: 'center', width: 505 }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

exports.generatePdfBuffer = generatePdfBuffer;

exports.generatePdf = async (modelName, info, result, callback) => {
  const buffer = await generatePdfBuffer(modelName, result);
  if (callback) await callback(buffer);
  return buffer;
};
