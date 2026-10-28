import { jsPDF } from 'jspdf';

function slugify(value) {
  return String(value || 'tour-package')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'tour-package';
}

function ensureArray(value) {
  if (Array.isArray(value)) return value.map((v) => String(v || '').trim()).filter(Boolean);
  if (value == null) return [];
  return String(value)
    .split(/\n+/)
    .map((v) => v.trim())
    .filter(Boolean);
}

/**
 * Generate and download a multi-page PDF of the full tour package.
 */
export function downloadTourPdf({
  title,
  duration,
  location,
  priceLabel,
  description,
  highlights = [],
  itineraryDays = [],
  inclusions = [],
  exclusions = [],
  pageUrl,
  brandName = 'Serendib Travel & Tours',
} = {}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2;
  const brandGreen = [15, 81, 50];
  const muted = [80, 80, 80];
  const body = [40, 40, 40];
  let y = 20;

  const ensureSpace = (needed = 12) => {
    if (y + needed <= pageHeight - 18) return;
    doc.addPage();
    y = 18;
  };

  const writeWrapped = (text, { size = 10, color = body, style = 'normal', gap = 5 } = {}) => {
    const value = String(text || '').trim();
    if (!value) return;
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(value, contentWidth);
    for (const line of lines) {
      ensureSpace(gap + 2);
      doc.text(line, marginX, y);
      y += gap;
    }
  };

  const writeSectionTitle = (label) => {
    ensureSpace(16);
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...brandGreen);
    doc.text(String(label || '').toUpperCase(), marginX, y);
    y += 3;
    doc.setDrawColor(...brandGreen);
    doc.setLineWidth(0.4);
    doc.line(marginX, y, marginX + 28, y);
    y += 7;
  };

  const writeBulletList = (items) => {
    const list = ensureArray(items);
    if (!list.length) return;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...body);
    for (const item of list) {
      const lines = doc.splitTextToSize(item, contentWidth - 6);
      ensureSpace(lines.length * 5 + 3);
      doc.text('•', marginX, y);
      doc.text(lines[0], marginX + 5, y);
      y += 5;
      for (let i = 1; i < lines.length; i += 1) {
        ensureSpace(6);
        doc.text(lines[i], marginX + 5, y);
        y += 5;
      }
      y += 1;
    }
  };

  // Header
  doc.setFillColor(...brandGreen);
  doc.rect(0, 0, pageWidth, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(brandName, marginX, 9);
  y = 24;

  writeWrapped(title || 'Tour Package', {
    size: 18,
    color: brandGreen,
    style: 'bold',
    gap: 8,
  });
  y += 2;

  const metaParts = [duration, location, priceLabel].filter(Boolean);
  if (metaParts.length) {
    writeWrapped(metaParts.join('  •  '), { size: 10, color: muted, style: 'normal', gap: 5 });
    y += 2;
  }

  if (pageUrl) {
    writeWrapped(pageUrl, { size: 8, color: [100, 100, 100], gap: 4 });
    y += 2;
  }

  if (description) {
    writeSectionTitle('Description');
    writeWrapped(description, { size: 10, color: body, gap: 5 });
  }

  if (ensureArray(highlights).length) {
    writeSectionTitle('Tour Highlights');
    writeBulletList(highlights);
  }

  if (Array.isArray(itineraryDays) && itineraryDays.length) {
    writeSectionTitle('Itinerary');
    itineraryDays.forEach((day, idx) => {
      const heading = day?.heading || `Day ${String(idx + 1).padStart(2, '0')}`;
      const places = String(day?.places || '').trim();
      const details = ensureArray(day?.details);

      ensureSpace(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...brandGreen);
      doc.text(heading, marginX, y);
      y += 6;

      if (places) {
        writeWrapped(places, { size: 10, color: muted, style: 'bold', gap: 5 });
      }
      for (const detail of details) {
        writeWrapped(detail, { size: 10, color: body, gap: 5 });
      }
      y += 3;
    });
  }

  if (ensureArray(inclusions).length) {
    writeSectionTitle("What's Included");
    writeBulletList(inclusions);
  }

  if (ensureArray(exclusions).length) {
    writeSectionTitle("What's Not Included");
    writeBulletList(exclusions);
  }

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `${brandName}  |  Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  doc.save(`${slugify(title)}.pdf`);
}
