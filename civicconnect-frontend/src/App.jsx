import React, { useState } from 'react';
import { CreateRequestForm } from './components/CreateRequestForm';
import { StaffQueueTable } from './components/StaffQueueTable';

function App() {
  const [requests, setRequests] = useState([
    { id: 101, categoryId: '1', description: 'Water leak in hallway', status: 'Pending' },
    { id: 102, categoryId: '2', description: 'Wi-Fi connection down in lab', status: 'In Progress' }
  ]);
  const [activeTab, setActiveTab] = useState('requester');

  const handleRequestCreated = (newReq) => {
    setRequests(prev => [...prev, newReq]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={() => setActiveTab('requester')} style={{ padding: '10px 20px', fontWeight: activeTab === 'requester' ? 'bold' : 'normal' }}>
          Requester View
        </button>
        <button onClick={() => setActiveTab('staff')} style={{ padding: '10px 20px', fontWeight: activeTab === 'staff' ? 'bold' : 'normal' }}>
          Staff Queue View
        </button>
      </header>

      {activeTab === 'requester' ? (
        <CreateRequestForm onRequestCreated={handleRequestCreated} />
      ) : (
        <StaffQueueTable requests={requests} />
      )}
    </div>
  );
}

export default App;