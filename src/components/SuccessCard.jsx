import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';

export default function SuccessCard({ data, onReset }) {
  const ticketId = useMemo(() => {
    const year = new Date().getFullYear();
    const randomId = Math.floor(1000 + Math.random() * 9000);
    return `REF-${year}-${randomId}`;
  }, []);

  const handleExportPdf = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentW = pageW - margin * 2;
    let y = 20;

    // --- Header band ---
    doc.setFillColor(88, 28, 135); // purple-900
    doc.rect(0, 0, pageW, 48, 'F');
    doc.setFillColor(124, 58, 237); // purple-600
    doc.rect(0, 44, pageW, 4, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('Guest Refund Request', pageW / 2, 22, { align: 'center' });

    // Ticket badge
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(216, 180, 254); // purple-300
    doc.text(`Ticket ID: ${ticketId}`, pageW / 2, 34, { align: 'center' });

    y = 60;

    // --- Status ---
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94); // green-500
    doc.text('Request Submitted Successfully', margin, y);
    y += 4;

    // Divider
    doc.setDrawColor(124, 58, 237);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 12;

    // --- Detail rows ---
    const rows = [
      ['Full Name', data.full_name],
      ['Email', data.email],
      ['Booking Reference', data.booking_reference],
      ['Booking Date', data.booking_date],
      ['Refund Reason', data.refund_reason],
    ];
    if (data.details) rows.push(['Additional Details', data.details]);

    rows.forEach(([label, value], i) => {
      // Alternating row background
      if (i % 2 === 0) {
        doc.setFillColor(245, 243, 255); // purple-50
        doc.rect(margin, y - 5, contentW, 12, 'F');
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(88, 28, 135); // purple-900
      doc.text(label, margin + 4, y + 2);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 30, 30);

      // Handle long text wrapping for value
      const maxValueW = contentW - 60;
      const lines = doc.splitTextToSize(String(value), maxValueW);
      doc.text(lines, margin + 58, y + 2);

      y += Math.max(12, lines.length * 6 + 6);
    });

    // --- Outside window warning ---
    if (data.is_outside_window) {
      y += 4;
      doc.setFillColor(254, 249, 195); // yellow-100
      doc.setDrawColor(234, 179, 8); // yellow-500
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y - 5, contentW, 14, 2, 2, 'FD');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(161, 98, 7); // yellow-700
      doc.text('(!) Outside standard refund window - reviewed on a case-by-case basis', margin + 4, y + 3);
      y += 18;
    }

    // --- Footer ---
    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageW - margin, y);
    y += 8;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, y);
    doc.text('Guest Refund System', pageW - margin, y, { align: 'right' });

    doc.save(`${ticketId}.pdf`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-8 text-center">
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 15 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 ring-4 ring-green-400/30"
        >
          <motion.svg
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="h-10 w-10 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Request Submitted!
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-4 py-1.5 mb-6"
        >
          <span className="text-sm text-purple-300">Ticket ID:</span>
          <span className="font-mono font-bold text-purple-200">{ticketId}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 space-y-3 text-left"
        >
          <SummaryRow label="Name" value={data.full_name} />
          <SummaryRow label="Email" value={data.email} />
          <SummaryRow label="Booking Ref" value={data.booking_reference} />
          <SummaryRow label="Booking Date" value={data.booking_date} />
          <SummaryRow label="Reason" value={data.refund_reason} />
          {data.details && <SummaryRow label="Details" value={data.details} />}
          {data.is_outside_window && (
            <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-2">
              <svg className="h-4 w-4 text-yellow-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3l9.66 16.59A1 1 0 0120.66 21H3.34a1 1 0 01-.86-1.41L12 3z" />
              </svg>
              <span className="text-xs text-yellow-300">Outside standard refund window</span>
            </div>
          )}
        </motion.div>

        {/* Export PDF Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleExportPdf}
          className="mt-8 w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-sm font-semibold text-white hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export to PDF
        </motion.button>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onReset}
          className="mt-3 w-full rounded-xl bg-white/10 border border-white/20 py-3 text-sm font-medium text-white/80 hover:bg-white/15 transition-colors cursor-pointer"
        >
          Submit Another Request
        </motion.button>
      </div>
    </motion.div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4 rounded-lg bg-white/5 px-4 py-2.5">
      <span className="text-sm text-white/50 shrink-0">{label}</span>
      <span className="text-sm text-white/90 text-right break-all">{value}</span>
    </div>
  );
}
