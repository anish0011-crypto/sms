import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';

const getGradeColor = (grade) => {
  if (grade === 'A') return '#006600';
  if (grade === 'B') return '#0000cc';
  if (grade === 'C') return '#cc6600';
  return '#cc0000';
};

const MarksheetTemplate = ({ data, onClose }) => {
  const printRef = useRef();
  const [printing, setPrinting] = useState(false);

  const reactToPrintFn = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Marksheet_${data?.studentName?.replace(/\s+/g, '_') || 'Student'}_${data?.rollNumber || ''}`,
    onBeforePrint: () => setPrinting(true),
    onAfterPrint: () => setPrinting(false),
    onPrintError: () => {
      setPrinting(false);
      fallbackPrint();
    }
  });

  const fallbackPrint = () => {
    try {
      const content = printRef.current?.innerHTML;
      if (!content) return;
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        window.print();
        return;
      }
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Marksheet - ${data?.studentName || 'Student'}</title>
            <style>
              @page { size: A4 portrait; margin: 10mm; }
              body { font-family: 'Times New Roman', serif; margin: 0; padding: 0; background: #fff; color: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .marksheet-print-area { max-width: 100%; border: 2px solid #1a6b3c; border-radius: 4px; overflow: hidden; background: #f0faf0; }
              .ms-header { background: #1a6b3c !important; color: #fff !important; text-align: center; padding: 16px; }
              .ms-header h1 { font-size: 26px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 1.5px; }
              .ms-subheader { background: #fff; text-align: center; padding: 8px; border-bottom: 1px solid #1a6b3c; }
              .ms-subheader p { font-size: 13px; font-weight: 700; margin: 0; text-transform: uppercase; }
              .ms-class-band { background: #1a6b3c !important; color: #fff !important; text-align: center; padding: 6px; font-size: 13px; font-weight: 700; }
              .ms-info-cell { padding: 6px 12px; font-size: 12.5px; }
              .ms-info-label { font-weight: 700; }
              .ms-marks-table { width: 100%; border-collapse: collapse; font-size: 13px; }
              .ms-marks-table thead tr { background: #1a6b3c !important; color: #fff !important; }
              .ms-marks-table th, .ms-marks-table td { padding: 7px 12px; text-align: center; border-bottom: 1px solid #d0e8d8; }
              .ms-footer { display: grid; grid-template-columns: repeat(4, 1fr); background: #1a6b3c !important; color: #fff !important; text-align: center; }
              .ms-footer-cell { padding: 8px 10px; border-right: 1px solid rgba(255,255,255,0.2); }
              .ms-signature-row { display: grid; grid-template-columns: 1fr 1fr 1fr; padding: 24px 14px 10px; background: #fff; border-top: 1px solid #1a6b3c; text-align: center; font-size: 12px; }
              .ms-sig .line { border-top: 1px solid #000; margin: 0 auto 4px; width: 75%; }
            </style>
          </head>
          <body>
            <div class="marksheet-print-area">
              ${content}
            </div>
            <script>
              window.onload = function() {
                window.focus();
                window.print();
                window.close();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch {
      window.print();
    }
  };

  const handlePrintClick = () => {
    try {
      if (typeof reactToPrintFn === 'function') {
        reactToPrintFn();
      } else {
        fallbackPrint();
      }
    } catch {
      fallbackPrint();
    }
  };

  if (!data) return null;

  return (
    <div>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text2)' }}>
          Tip: Select <strong>"Save as PDF"</strong> in your browser's print dialog to download.
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={handlePrintClick} disabled={printing}>
            🖨️ {printing ? 'Preparing...' : 'Print / Download PDF'}
          </button>
          {onClose && (
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>

      <div ref={printRef} className="marksheet-print-area">
        {/* Header */}
        <div className="ms-header">
          <h1>🏫 RKD SCHOOL</h1>
          <p style={{ fontSize: '13px', marginTop: '4px', opacity: 0.9 }}>Excellence in Education</p>
        </div>

        {/* Sub-header */}
        <div className="ms-subheader">
          <p>
            MARK SHEET FOR THE YEAR {data.year || '2025'} {data.month ? `FOR THE MONTH OF ${data.month.toUpperCase()}` : ''}
          </p>
        </div>

        {/* Class band */}
        <div className="ms-class-band">
          CLASS {String(data.class || '').toUpperCase()} SECTION {String(data.section || '').toUpperCase()}
        </div>

        {/* Student info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #1a6b3c' }}>
          <div style={{ borderRight: '1px solid #ccc' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #ccc' }}>
              <div className="ms-info-cell ms-info-label">Student Name</div>
              <div className="ms-info-cell">{data.studentName}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <div className="ms-info-cell ms-info-label">Father Name</div>
              <div className="ms-info-cell">{data.fatherName || '—'}</div>
            </div>
          </div>
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #ccc' }}>
              <div className="ms-info-cell ms-info-label">Roll Number</div>
              <div className="ms-info-cell" style={{ fontWeight: '700' }}>{data.rollNumber}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <div className="ms-info-cell ms-info-label">Class</div>
              <div className="ms-info-cell">{data.class} / {data.section}</div>
            </div>
          </div>
        </div>

        {/* Marks table */}
        <table className="ms-marks-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>S No</th>
              <th style={{ textAlign: 'left' }}>Subjects</th>
              <th>Total Marks</th>
              <th>Obtained Marks</th>
              <th style={{ background: '#c8e6d0', color: '#000' }}>Grade</th>
            </tr>
          </thead>
          <tbody>
            {data.marks?.map((m, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td style={{ textAlign: 'left', fontWeight: '600' }}>{m.subjectName}</td>
                <td>{m.totalMarks || 100}</td>
                <td style={{ fontWeight: '700' }}>{m.obtainedMarks}</td>
                <td className="grade-col" style={{ color: getGradeColor(m.grade), fontStyle: 'italic', fontWeight: '700' }}>{m.grade}</td>
              </tr>
            ))}
            {(!data.marks || data.marks.length === 0) && (
              <tr>
                <td colSpan="5" style={{ padding: '20px', color: '#888' }}>No subject marks recorded</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer summary */}
        <div className="ms-footer">
          <div className="ms-footer-cell">
            <div className="label">Total Marks</div>
            <div className="value">{data.totalMarks}</div>
          </div>
          <div className="ms-footer-cell">
            <div className="label">Total Obtained</div>
            <div className="value">{data.obtainedMarks}</div>
          </div>
          <div className="ms-footer-cell">
            <div className="label">Remarks</div>
            <div className="value remarks">{data.remarks || 'Good'}</div>
          </div>
          <div className="ms-footer-cell">
            <div className="label">Rank</div>
            <div className="value">{data.rank ? `#${data.rank}` : '—'}</div>
          </div>
        </div>

        {/* Percentage row */}
        <div style={{ background: '#e8f5ee', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#000', borderBottom: '1px solid #1a6b3c' }}>
          <span><strong>Percentage:</strong> {data.percentage}%</span>
          <span><strong>Overall Grade:</strong> <span style={{ color: getGradeColor(data.overallGrade), fontStyle: 'italic', fontWeight: '700' }}>{data.overallGrade}</span></span>
          <span><strong>Session:</strong> {data.session || '2024-2025'}</span>
        </div>

        {/* Signatures */}
        <div className="ms-signature-row">
          <div className="ms-sig">
            <div className="line"></div>
            <p>Class Teacher</p>
          </div>
          <div className="ms-sig">
            <div className="line"></div>
            <p>Principal</p>
          </div>
          <div className="ms-sig">
            <div className="line"></div>
            <p>Parent / Guardian</p>
          </div>
        </div>

        {/* School stamp area */}
        <div style={{ background: '#1a6b3c', color: '#fff', textAlign: 'center', padding: '8px', fontSize: '11px' }}>
          RKD School | www.rkdschool.edu.pk | Tel: 03001234567 | Address: Lahore, Pakistan
        </div>
      </div>
    </div>
  );
};

export default MarksheetTemplate;
