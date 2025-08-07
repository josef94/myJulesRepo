import React, { useState } from 'react';
import { Merkmal } from '../data/types';

interface AddFieldFormProps {
  onAddField: (newField: Merkmal) => void;
  onCancel: () => void;
}

const AddFieldForm: React.FC<AddFieldFormProps> = ({ onAddField, onCancel }) => {
  const [name, setName] = useState('');
  const [benennung, setBenennung] = useState('');
  const [datentyp, setDatentyp] = useState<'Integer' | 'String' | 'Real'>('String');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !benennung) {
      alert('Please fill out all fields.');
      return;
    }
    const newField: Merkmal = {
      name,
      benennung,
      datentyp,
      merkmalswerte: [],
    };
    onAddField(newField);
  };

  return (
    <div className="add-field-form">
      <form onSubmit={handleSubmit}>
        <h3>Add New Field</h3>
        <div>
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label>Benennung</label>
          <input type="text" value={benennung} onChange={(e) => setBenennung(e.target.value)} />
        </div>
        <div>
          <label>Datentyp</label>
          <select value={datentyp} onChange={(e) => setDatentyp(e.target.value as any)}>
            <option value="String">String</option>
            <option value="Integer">Integer</option>
            <option value="Real">Real</option>
          </select>
        </div>
        <button type="submit">Add</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </form>
    </div>
  );
};

export default AddFieldForm;
