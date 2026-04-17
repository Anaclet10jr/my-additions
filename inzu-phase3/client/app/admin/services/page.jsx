'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminServicesPage() {
  const [services,  setServices]  = useState([]);
  const [projects,  setProjects]  = useState([]);
  const [tab,       setTab]       = useState('services');
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const API = process.env.NEXT_PUBLIC_API_URL;
        const [sRes, pRes] = await Promise.all([
          axios.get(`${API}/api/admin/services`,  { headers }),
          axios.get(`${API}/api/admin/interior`,  { headers }),
        ]);
        setServices(sRes.data || []);
        setProjects(pRes.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, []);

  const approveService = async (id) => {
    const token = localStorage.getItem('token');
    await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/services/${id}/approve`,
      {}, { headers: { Authorization: `Bearer ${token}` } });
    setServices(s => s.map(x => x._id === id ? { ...x, isApproved: true } : x));
  };

  const approveProject = async (id) => {
    const token = localStorage.getItem('token');
    await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/interior/${id}/approve`,
      {}, { headers: { Authorization: `Bearer ${token}` } });
    setProjects(p => p.map(x => x._id === id ? { ...x, isApproved: true } : x));
  };

  const pending = tab === 'services'
    ? services.filter(s => !s.isApproved)
    : projects.filter(p => !p.isApproved);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Services & Interior Approvals</h1>
        <div className="flex gap-2">
          {['services','interior'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                tab === t ? 'bg-white text-slate-800' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="mb-4 text-slate-400 text-sm">{pending.length} pending approval</div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-800 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {(tab === 'services' ? services : projects).map(item => (
            <div key={item._id} className="bg-slate-800 rounded-xl p-5 flex justify-between items-center">
              <div>
                <p className="font-semibold text-white">{item.name || item.title}</p>
                <p className="text-slate-400 text-sm mt-0.5 capitalize">
                  {item.category?.replace('_',' ') || item.style?.replace('_',' ')}
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  by {item.provider?.name || item.designer?.name || '—'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  item.isApproved ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                }`}>{item.isApproved ? 'Approved' : 'Pending'}</span>
                {!item.isApproved && (
                  <button
                    onClick={() => tab === 'services' ? approveService(item._id) : approveProject(item._id)}
                    className="bg-green-600 hover:bg-green-500 text-white text-xs px-4 py-2 rounded-lg transition">
                    Approve
                  </button>
                )}
              </div>
            </div>
          ))}
          {(tab === 'services' ? services : projects).length === 0 && (
            <div className="text-center py-16 text-slate-500">Nothing to show.</div>
          )}
        </div>
      )}
    </div>
  );
}
