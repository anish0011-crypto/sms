import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

const getGradeColor = (grade) => {
  if (grade === 'A') return '#006600';
  if (grade === 'B') return '#0000cc';
  if (grade === 'C') return '#cc6600';
  return '#cc0000';
};

const MarksheetTemplate = ({ data }) => {
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Marksheet - ${data?.studentName || 'Student'}`,
  });

  if (!data) return null;

  return (
    <div>
      <div className="no-print" style={{ textAlign: 'right', marginBottom: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={handlePrint}>
          🖨️ Print / Download PDF
        </button>
      </div>

      <div ref={printRef} className="marksheet-print-area">
        {/* Header */}
        <div className="ms-header">
          <h1>🏫 RKD SCHOOL</h1>
          <p style={{ fontSize: '13px', marginTop: '4px', opacity: 0.9 }}>Excellence in Education</p>
        </div>

        {/* Sub-header */}
        <div className="ms-subheader">
          <p>MARK SHEET FOR THE YEAR {data.year} FOR THE MONTH OF {data.month?.toUpperCase()}</p>
        </div>

        {/* Class band */}
        <div className="ms-class-band">
          CLASS {data.class?.toUpperCase()} SECTION {data.section?.toUpperCase()}
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
              <div className="ms-info-cell">{data.rollNumber}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <div className="ms-info-cell ms-info-label">Class</div>
              <div className="ms-info-cell">{data.class}/{data.section}</div>
            </div>
          </div>
        </div>

        {/* Marks table */}
        <table className="ms-marks-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>S No</th>
              <th style={{ textAlign: 'left' }}>Subjects</th>
              <th>Obtained Marks</th>
              <th style={{ background: '#c8e6d0', color: '#000' }}>Grade</th>
            </tr>
          </thead>
          <tbody>
            {data.marks?.map((m, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td style={{ textAlign: 'left' }}>{m.subjectName}</td>
                <td>{m.obtainedMarks}</td>
                <td className="grade-col" style={{ color: getGradeColor(m.grade), fontStyle: 'italic', fontWeight: '700' }}>{m.grade}</td>
              </tr>
            ))}
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
            <div className="value remarks">{data.remarks}</div>
          </div>
          <div className="ms-footer-cell">
            <div className="label">Rank</div>
            <div className="value">{data.rank}</div>
          </div>
        </div>

        {/* Percentage row */}
        <div style={{ background: '#e8f5ee', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#000', borderBottom: '1px solid #1a6b3c' }}>
          <span><strong>Percentage:</strong> {data.percentage}%</span>
          <span><strong>Overall Grade:</strong> <span style={{ color: getGradeColor(data.overallGrade), fontStyle: 'italic', fontWeight: '700' }}>{data.overallGrade}</span></span>
          <span><strong>Session:</strong> {data.session}</span>
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
