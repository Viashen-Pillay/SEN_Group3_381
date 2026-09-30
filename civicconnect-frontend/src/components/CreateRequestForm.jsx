import React, { useState } from 'react';

const CATEGORIES = [
  { id: '1', name: 'Facility Faults' },
  { id: '2', name: 'IT Support' },
  { id: '3', name: 'Maintenance' },
  { id: '4', name: 'Security Concerns' }
];

export const CreateRequestForm = ({ onRequestCreated }) => {
  const [formData, setFormData] = useState({ categoryId: '', description: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.categoryId) newErrors.categoryId = 'Please select a category from the dropdown.';
    if (!formData.description.trim() || formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters long.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/v1/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setServerMessage(`Success: ${data.message} (Request ID: ${data.request.id})`);
        setFormData({ categoryId: '', description: '' });
        setErrors({});
        if (onRequestCreated) onRequestCreated(data.request);
      } else {
        setErrors({ server: data.error || 'Submission failed.' });
      }
    } catch (err) {
      setErrors({ server: 'Network error connecting to Express backend.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }} onSubmit={handleSubmit}>
      <h2>Submit Service Request (Requester View)</h2>

      {serverMessage && <div style={{ background: '#d4edda', color: '#155724', padding: '10px', marginBottom: '10px' }}>{serverMessage}</div>}
      {errors.server && <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', marginBottom: '10px' }}>{errors.server}</div>}

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold' }}>Category (FR-02) *</label>
        <select 
          value={formData.categoryId} 
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        >
          <option value="">-- Select Category --</option>
          {CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        {errors.categoryId && <span style={{ color: 'red', fontSize: '0.85rem' }}>{errors.categoryId}</span>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold' }}>Description *</label>
        <textarea 
          rows="4" 
          value={formData.description} 
          onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
        {errors.description && <span style={{ color: 'red', fontSize: '0.85rem' }}>{errors.description}</span>}
      </div>

      <button type="submit" disabled={isSubmitting} style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        {isSubmitting ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  );
};