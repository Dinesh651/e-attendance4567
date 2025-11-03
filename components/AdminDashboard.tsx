
import React, { useState, useEffect } from 'react';
import { api } from '../services/mockApi';
import { AttendanceRecord, Notice } from '../types';
import { Spinner } from './icons';

const AttendanceTable: React.FC = () => {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const data = await api.getAttendanceRecords();
                setRecords(data);
            } catch (error) {
                console.error("Failed to fetch attendance records", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecords();
    }, []);

    if (isLoading) {
        return <div className="flex justify-center items-center p-8"><Spinner className="w-8 h-8 text-blue-600" /></div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {records.map(record => (
                        <tr key={record.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.userName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.clientName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.checkInTime.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.checkOutTime ? record.checkOutTime.toLocaleString() : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 hover:text-blue-700">
                                {record.location ? <a href={`https://www.google.com/maps?q=${record.location.lat},${record.location.lng}`} target="_blank" rel="noopener noreferrer">View Map</a> : 'N/A'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const NoticeManagement: React.FC = () => {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchNotices = async () => {
        setIsLoading(true);
        try {
            const data = await api.getNotices();
            setNotices(data);
        } catch (error) {
            console.error("Failed to fetch notices", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchNotices();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!title || !content) return;

        setIsSubmitting(true);
        try {
            await api.addNotice(title, content);
            setTitle('');
            setContent('');
            await fetchNotices(); // Refresh notices
        } catch (error) {
            console.error("Failed to add notice", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Post New Notice</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="notice-title" className="block text-sm font-medium text-gray-700">Title</label>
                        <input type="text" id="notice-title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
                    </div>
                    <div>
                        <label htmlFor="notice-content" className="block text-sm font-medium text-gray-700">Content</label>
                        <textarea id="notice-content" value={content} onChange={e => setContent(e.target.value)} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required></textarea>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
                        {isSubmitting && <Spinner className="w-5 h-5 mr-2" />}
                        Post Notice
                    </button>
                </form>
            </div>
            <div className="md:col-span-2">
                 <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Posted Notices</h3>
                 {isLoading ? <div className="flex justify-center items-center p-8"><Spinner className="w-8 h-8 text-blue-600" /></div> : (
                     <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {notices.map(notice => (
                            <div key={notice.id} className="p-4 border rounded-md">
                                <h4 className="font-semibold">{notice.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{notice.content}</p>
                                <p className="text-xs text-gray-400 mt-2 text-right">{notice.createdAt.toLocaleDateString()}</p>
                            </div>
                        ))}
                     </div>
                 )}
            </div>
        </div>
    );
};

type Tab = 'attendance' | 'notices';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('attendance');

  const tabs: { id: Tab, name: string }[] = [
      { id: 'attendance', name: 'Attendance & Client Data' },
      { id: 'notices', name: 'Manage Notices' }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map(tab => (
                 <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                        activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                 >
                    {tab.name}
                 </button>
            ))}
        </nav>
      </div>
      
      <div>
        {activeTab === 'attendance' && <AttendanceTable />}
        {activeTab === 'notices' && <NoticeManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;
