
import React, { useState, useEffect } from 'react';
import { api } from '../services/mockApi';
import { Notice } from '../types';
import CheckinPanel from './CheckinPanel';
import { Spinner } from './icons';

const NoticeBoard: React.FC = () => {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const data = await api.getNotices();
                setNotices(data);
            } catch (error) {
                console.error("Failed to fetch notices", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotices();
    }, []);

    if (isLoading) {
        return <div className="flex justify-center items-center p-8"><Spinner className="w-8 h-8 text-blue-600" /></div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Office Notices</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {notices.length > 0 ? notices.map(notice => (
                    <div key={notice.id} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                        <h3 className="font-semibold text-gray-900">{notice.title}</h3>
                        <p className="text-sm text-gray-700 mt-1">{notice.content}</p>
                        <p className="text-xs text-gray-500 mt-2 text-right">{notice.createdAt.toLocaleDateString()}</p>
                    </div>
                )) : <p className="text-gray-500">No new notices.</p>}
            </div>
        </div>
    );
};


const EmployeeDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <CheckinPanel />
      </div>
      <div className="lg:col-span-2">
        <NoticeBoard />
      </div>
    </div>
  );
};

export default EmployeeDashboard;
