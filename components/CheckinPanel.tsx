
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/mockApi';
import { Client, AttendanceRecord, Location } from '../types';
import { Spinner, ClockIcon, BuildingIcon, LocationIcon } from './icons';

const CheckinPanel: React.FC = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [currentAttendance, setCurrentAttendance] = useState<AttendanceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [clientsData, attendanceData] = await Promise.all([
        api.getClients(),
        api.getCurrentAttendance(user.id),
      ]);
      setClients(clientsData);
      if (clientsData.length > 0) {
        setSelectedClient(clientsData[0].id);
      }
      setCurrentAttendance(attendanceData || null);
    } catch (err) {
      setError('Failed to load initial data.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleCheckIn = () => {
    if (!selectedClient) {
      setError('Please select a client.');
      return;
    }
    setError(null);
    setIsActionLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          if (user) {
            const newRecord = await api.checkIn(user.id, selectedClient, location);
            setCurrentAttendance(newRecord);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred during check-in.');
        } finally {
          setIsActionLoading(false);
        }
      },
      (geoError) => {
        setError(`Geolocation error: ${geoError.message}`);
        setIsActionLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleCheckOut = async () => {
    setError(null);
    setIsActionLoading(true);
    try {
      if (user) {
        const updatedRecord = await api.checkOut(user.id);
        setCurrentAttendance(null); // Or you could show a success message before clearing
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during check-out.');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-8 bg-white rounded-lg shadow-md"><Spinner className="w-8 h-8 text-blue-600" /></div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">My Attendance</h2>
      
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-r-lg" role="alert">{error}</div>}

      {currentAttendance ? (
        <div className="space-y-4">
          <p className="text-lg font-semibold text-green-600">You are currently checked in.</p>
          <div className="border-t pt-4 space-y-3 text-sm">
             <div className="flex items-center text-gray-600">
                <ClockIcon className="w-5 h-5 mr-3 text-gray-400" />
                <span>Checked In: {currentAttendance.checkInTime.toLocaleTimeString()}</span>
             </div>
             <div className="flex items-center text-gray-600">
                <BuildingIcon className="w-5 h-5 mr-3 text-gray-400" />
                <span>Client: {currentAttendance.clientName}</span>
             </div>
             {currentAttendance.location && (
                <div className="flex items-center text-gray-600">
                    <LocationIcon className="w-5 h-5 mr-3 text-gray-400" />
                    <span>Location Captured</span>
                </div>
             )}
          </div>
          <button
            onClick={handleCheckOut}
            disabled={isActionLoading}
            className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 flex items-center justify-center transition-colors"
          >
            {isActionLoading && <Spinner className="w-5 h-5 mr-2" />}
            Check Out
          </button>
        </div>
      ) : (
        <div className="space-y-4">
            <p className="text-lg font-semibold text-gray-700">You are currently checked out.</p>
          <div>
            <label htmlFor="client-select" className="block text-sm font-medium text-gray-700 mb-1">Select Client</label>
            <select
              id="client-select"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCheckIn}
            disabled={isActionLoading || !selectedClient}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 flex items-center justify-center transition-colors"
          >
            {isActionLoading && <Spinner className="w-5 h-5 mr-2" />}
            Check In
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckinPanel;
