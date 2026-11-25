import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Shield, Clock, User } from 'lucide-react';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/admin/audit-logs');
        setLogs(res.data.logs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#222222]">System Audit Logs</h1>
        <p className="text-xs text-gray-500 mt-1">
          Immutable tracking of logins, property submissions, broker assignments, visit updates, and financial actions.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#EEEEEE] shadow-sm divide-y divide-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No audit logs recorded.</div>
        ) : (
          logs.map((log) => (
            <div key={log._id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50/50">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[#222222]">{log.action}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-100 text-gray-700">
                    {log.resourceType}
                  </span>
                </div>
                <p className="text-gray-500 text-[11px]">
                  Actor: <strong>{log.userId?.name || 'System / Anonymous'}</strong> ({log.userRole || 'anonymous'}) • IP: {log.ipAddress}
                </p>
              </div>

              <span className="text-gray-400 text-[11px] font-semibold shrink-0">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogs;
