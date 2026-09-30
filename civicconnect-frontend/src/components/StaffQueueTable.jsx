import React, { useState } from 'react';
import { CategoryFilterStrategy, StatusFilterStrategy, KeywordSearchStrategy } from '../strategies/filterStrategies';

export const StaffQueueTable = ({ requests }) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  let filtered = CategoryFilterStrategy.filter(requests, selectedCategory);
  filtered = StatusFilterStrategy.filter(filtered, selectedStatus);
  filtered = KeywordSearchStrategy.filter(filtered, searchKeyword);

  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Staff Work Queue (Strategy Pattern Filter)</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input 
          type="text" 
          placeholder="Search description..." 
          value={searchKeyword} 
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ padding: '8px' }}
        />
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ padding: '8px' }}>
          <option value="ALL">All Categories</option>
          <option value="1">Facility Faults</option>
          <option value="2">IT Support</option>
          <option value="3">Maintenance</option>
        </select>
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={{ padding: '8px' }}>
          <option value="ALL">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Category ID</th>
            <th>Description</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length > 0 ? (
            filtered.map(req => (
              <tr key={req.id}>
                <td>#{req.id}</td>
                <td>Category {req.categoryId}</td>
                <td>{req.description}</td>
                <td>{req.status}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4">No requests found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};