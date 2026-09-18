import { useEffect, useState } from 'react';
import API from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LineChart, Line } from 'recharts';

const StudentPerformance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/student/performance').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  const ms = data?.marksheets || [];
  const latestExam = ms.length > 0 ? ms[0] : null;

  const subjectData = latestExam?.marks?.map(m => ({
    subject: m.subjectName,
    marks: m.obtainedMarks,
    fill: m.obtainedMarks / m.totalMarks >= 0.8 ? '#48bb78' : m.obtainedMarks / m.totalMarks >= 0.6 ? '#63b3ed' : m.obtainedMarks / m.totalMarks >= 0.45 ? '#f6c453' : '#fc8181'
  })) || [];

  const trendData = [...ms].reverse().map(m => ({
    exam: m.exam?.name?.split(' ')[0],
    percentage: m.percentage,
  }));

  return (
    <div className="page-wrapper animate-fade">
      <div className="page-header"><div><h2>My Performance</h2><p>Analytics and academic trends</p></div></div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontWeight: '700', marginBottom: '20px', fontSize: '15px' }}>📈 Latest Exam Performance</h3>
          {subjectData.length > 0 ? (
            <div style={{ height: '260px', width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={subjectData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="subject" tick={{ fill: 'var(--text2)', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} />
                  <YAxis tick={{ fill: 'var(--text2)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--card-border)', borderRadius: '8px' }} />
                  <Bar dataKey="marks" radius={[4, 4, 0, 0]}>
                    {subjectData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <div className="empty-state">No exam data available</div>}
        </div>

        <div className="card">
          <h3 style={{ fontWeight: '700', marginBottom: '20px', fontSize: '15px' }}>📈 Exam Trends (Percentage)</h3>
          {trendData.length > 0 ? (
            <div style={{ height: '260px', width: '100%' }}>
              <ResponsiveContainer>
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="exam" tick={{ fill: 'var(--text2)', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--text2)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--card-border)', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="percentage" stroke="#b794f4" strokeWidth={3} dot={{ fill: '#b794f4', r: 5 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : <div className="empty-state">Not enough data for trends</div>}
        </div>
      </div>
    </div>
  );
};

export default StudentPerformance;
