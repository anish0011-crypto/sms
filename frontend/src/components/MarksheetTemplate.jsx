import { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import API from '../utils/api';

const getGradeColor = (grade) => {
  if (grade === 'A') return '#006600';
  if (grade === 'B') return '#0000cc';
  if (grade === 'C') return '#cc6600';
  return '#cc0000';
};

const MarksheetTemplate = ({ data, onClose }) => {
  const printRef = useRef();
  const [printing, setPrinting] = useState(false);
  const [schoolSettings, setSchoolSettings] = useState(data?.schoolSettings || {
    schoolName: 'RKD SCHOOL',
    tagline: 'Excellence in Education',
    address: 'Lahore, Pakistan',
    phone: '03001234567',
    website: 'www.rkdschool.edu.pk',
    currentSession: '2024-2025',
    principalTitle: 'Principal',
  });

  useEffect(() => {
    // Dynamically fetch latest school settings from backend
    API.get('/api/settings')
      .then(r => {
        if (r.data && r.data.schoolName) {
          setSchoolSettings(r.data);
        }
      })
      .catch(() => {});
  }, []);

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
              .ms-student-info { background: #fff; border-bottom: 1px solid #1a6b3c; padding: 8px 12px; display: flex; flex-direction: column; gap: 6px; }
              .ms-info-row { display: flex; justify-content: space-between; gap: 12px; }
              .ms-info-item { flex: 1; font-size: 12.5px; display: flex; gap: 6px; justify-content: space-between; }
              .ms-info-label { font-weight: 700; color: #1a6b3c; }
              .ms-marks-table { width: 100%; border-collapse: collapse; font-size: 13px; }
              .ms-marks-table thead tr { background: #1a6b3c !important; color: #fff !important; }
              .ms-marks-table th, .ms-marks-table td { padding: 7px 12px; text-align: center; border-bottom: 1px solid #d0e8d8; }
              .ms-footer { display: grid; grid-template-columns: repeat(4, 1fr); background: #1a6b3c !important; color: #fff !important; text-align: center; }
              .ms-footer-cell { padding: 8px 10px; border-right: 1px solid rgba(255,255,255,0.2); }
              .ms-summary-row { background: #e8f5ee; padding: 8px 14px; display: flex; justify-content: space-between; font-size: 13px; border-bottom: 1px solid #1a6b3c; }
              .ms-signature-row { display: grid; grid-template-columns: 1fr 1fr 1fr; padding: 24px 14px 10px; background: #fff; border-top: 1px solid #1a6b3c; text-align: center; font-size: 12px; }
              .ms-sig .line { border-top: 1px solid #000; margin: 0 auto 4px; width: 75%; }
              .ms-bottom-bar { background: #1a6b3c; color: #fff; text-align: center; padding: 8px; font-size: 11px; }
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

  // Format Date of Birth nicely if available
  const formattedDob = data.dob
    ? new Date(data.dob).toLocaleDateString ? new Date(data.dob).toLocaleDateString('en-GB') : data.dob
    : null;

  return (
    <div className="marksheet-outer-container">
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text2)' }}>
          💡 Tip: Use <strong>"Save as PDF"</strong> in browser print options to download.
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary btn-sm" onClick={handlePrintClick} disabled={printing}>
            🖨️ {printing ? 'Preparing...' : 'Print / Download PDF'}
          </button>
          {onClose && (
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>

      <div className="marksheet-wrapper">
        <div ref={printRef} className="marksheet-print-area">
          {/* Header - Dynamic School Name & Tagline */}
          <div className="ms-header">
            <h1>🏫 {schoolSettings.schoolName || 'RKD SCHOOL'}</h1>
            <p>{schoolSettings.tagline || 'Excellence in Education'}</p>
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

          {/* Student info - Dynamic Student Profile Fields */}
          <div className="ms-student-info">
            <div className="ms-info-row">
              <div className="ms-info-item">
                <span className="ms-info-label">Student Name:</span>
                <strong>{data.studentName}</strong>
              </div>
              <div className="ms-info-item">
                <span className="ms-info-label">Roll Number:</span>
                <strong>{data.rollNumber}</strong>
              </div>
            </div>

            <div className="ms-info-row">
              <div className="ms-info-item">
                <span className="ms-info-label">Father Name:</span>
                <span>{data.fatherName || '—'}</span>
              </div>
              <div className="ms-info-item">
                <span className="ms-info-label">Mother Name:</span>
                <span>{data.motherName || '—'}</span>
              </div>
            </div>

            <div className="ms-info-row">
              <div className="ms-info-item">
                <span className="ms-info-label">Class / Section:</span>
                <span>{data.class} / {data.section}</span>
              </div>
              {formattedDob && (
                <div className="ms-info-item">
                  <span className="ms-info-label">Date of Birth:</span>
                  <span>{formattedDob}</span>
                </div>
              )}
              {data.gender && !formattedDob && (
                <div className="ms-info-item">
                  <span className="ms-info-label">Gender:</span>
                  <span>{data.gender}</span>
                </div>
              )}
            </div>

            {(data.address || data.phone) && (
              <div className="ms-info-row">
                {data.phone && (
                  <div className="ms-info-item">
                    <span className="ms-info-label">Contact Phone:</span>
                    <span>{data.phone}</span>
                  </div>
                )}
                {data.address && (
                  <div className="ms-info-item">
                    <span className="ms-info-label">Address:</span>
                    <span>{data.address}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Marks table */}
          <div className="ms-table-container">
            <table className="ms-marks-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>S No</th>
                  <th style={{ textAlign: 'left' }}>Subjects</th>
                  <th style={{ width: '80px' }}>Total Marks</th>
                  <th style={{ width: '90px' }}>Obtained Marks</th>
                  <th style={{ width: '60px', background: '#c8e6d0', color: '#000' }}>Grade</th>
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
          </div>

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
          <div className="ms-summary-row">
            <span><strong>Percentage:</strong> {data.percentage}%</span>
            <span><strong>Overall Grade:</strong> <span style={{ color: getGradeColor(data.overallGrade), fontStyle: 'italic', fontWeight: '700' }}>{data.overallGrade}</span></span>
            <span><strong>Session:</strong> {schoolSettings.currentSession || data.session || '2024-2025'}</span>
          </div>

          {/* Signatures */}
          <div className="ms-signature-row">
            <div className="ms-sig">
              <div className="line"></div>
              <p>Class Teacher</p>
            </div>
            <div className="ms-sig">
              <div className="line"></div>
              <p>{schoolSettings.principalTitle || 'Principal'}</p>
            </div>
            <div className="ms-sig">
              <div className="line"></div>
              <p>Parent / Guardian</p>
            </div>
          </div>

          {/* School stamp area - Dynamic School Footer */}
          <div className="ms-bottom-bar">
            {schoolSettings.schoolName || 'RKD School'} | {schoolSettings.website || 'www.rkdschool.edu.pk'} | Tel: {schoolSettings.phone || '03001234567'} | Address: {schoolSettings.address || 'Lahore, Pakistan'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarksheetTemplate;
