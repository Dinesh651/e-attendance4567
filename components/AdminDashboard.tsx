import React, { useState, useEffect } from 'react';
import { api } from '../services/mockApi';
import { getEmployeesFromDB, addEmployeeToDB, removeEmployeeFromDB } from '../services/firebase';
import { User, Client, AttendanceRecord, Notice } from '../types';
import { Spinner } from './icons';

// A simple card component for dashboard sections
const DashboardCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
        {children}
    </div>
);

const UserManagement: React.FC<{ initialUsers: User[] }> = ({ initialUsers }) => {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newEmail) {
            setError('Name and email are required.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            const newUser = await addEmployeeToDB(newName, newEmail);
            setUsers(prev => [...prev, newUser]);
            setNewName('');
            setNewEmail('');
        } catch (err) {
            setError('Failed to add employee.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveUser = async (userId: string) => {
        if(window.confirm('Are you sure you want to remove this employee?')) {
            try {
                await removeEmployeeFromDB(userId);
                setUsers(prev => prev.filter(u => u.id !== userId));
            } catch (err) {
                setError('Failed to remove employee.');
            }
        }
    };

    return (
        <div className="space-y-4">
            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {users.map(user => (
                    <li key={user.id} className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <button 
                            onClick={() => handleRemoveUser(user.id)}
                            className="text-red-500 hover:text-red-700 font-semibold text-sm"
                        >
                            Remove
                        </button>
                    </li>
                ))}
            </ul>
            <form onSubmit={handleAddUser} className="space-y-3 border-t pt-4">
                <h3 className="text-md font-semibold text-gray-700">Add New Employee</h3>
                 {error && <p className="text-red-500 text-sm">{error}</p>}
                <input 
                    type="text" 
                    placeholder="Name" 
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                     className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                 <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 flex items-center justify-center transition-colors"
                >
                    {isSubmitting && <Spinner className="w-5 h-5 mr-2" />}
                    Add Employee
                </button>
            </form>
        </div>
    );
};


// Component to display attendance records
const AttendanceLog: React.FC<{ records: AttendanceRecord[] }> = ({ records }) => (
    <div className="max-h-96 overflow-y-auto pr-2">
        <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                <tr>
                    <th scope="col" className="py-3 px-6">Employee</th>
                    <th scope="col" className="py-3 px-6">Client</th>
                    <th scope="col" className="py-3 px-6">Check In</th>
                    <th scope="col" className="py-3 px-6">Check Out</th>
                </tr>
            </thead>
            <tbody>
                {records.map(record => (
                    <tr key={record.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="py-4 px-6 font-medium text-gray-900">{record.userName}</td>
                        <td className="py-4 px-6">{record.clientName}</td>
                        <td className="py-4 px-6">{record.checkInTime.toLocaleString()}</td>
                        <td className="py-4 px-6">{record.checkOutTime?.toLocaleString() || 'N/A'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

// Form to add a new notice
const NoticeForm: React.FC<{ onNoticeAdded: (notice: Notice) => void }> = ({ onNoticeAdded }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content) {
            setError('Title and content are required.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            const newNotice = await api.addNotice(title, content);
            onNoticeAdded(newNotice);
            setTitle('');
            setContent('');
        } catch (err) {
            setError('Failed to add notice.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
                <label htmlFor="notice-title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                    type="text"
                    id="notice-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={isSubmitting}
                />
            </div>
            <div>
                <label htmlFor="notice-content" className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                    id="notice-content"
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={isSubmitting}
                />
            </div>
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 flex items-center justify-center transition-colors"
            >
                {isSubmitting && <Spinner className="w-5 h-5 mr-2" />}
                Post Notice
            </button>
        </form>
    );
};

const AdminDashboard: React.FC = () => {
    const [data, setData] = useState<{
        users: User[];
        records: AttendanceRecord[];
        notices: Notice[];
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch users from Firebase DB, other data from mock API
                const [users, records, notices] = await Promise.all([
                    getEmployeesFromDB(),
                    api.getAttendanceRecords(),
                    api.getNotices()
                ]);
                setData({ users, records, notices });
            } catch (err) {
                setError("Failed to fetch dashboard data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);
    
    const handleNoticeAdded = (newNotice: Notice) => {
        setData(prevData => prevData ? { ...prevData, notices: [newNotice, ...prevData.notices] } : null);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center p-8"><Spinner className="w-12 h-12 text-blue-600" /></div>;
    }

    if (error || !data) {
        return <div className="text-center text-red-500 bg-red-100 p-4 rounded-md">{error || "No data available."}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <DashboardCard title="Full Attendance Log">
                    <AttendanceLog records={data.records} />
                </DashboardCard>
            </div>
            <div className="lg:col-span-1 space-y-8">
                <DashboardCard title="Manage Employees">
                   <UserManagement initialUsers={data.users} />
                </DashboardCard>
                 <DashboardCard title="Post a New Notice">
                    <NoticeForm onNoticeAdded={handleNoticeAdded} />
                </DashboardCard>
            </div>
        </div>
    );
};

export default AdminDashboard;