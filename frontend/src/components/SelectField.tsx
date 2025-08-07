import React from 'react';
import { Merkmal } from '../data/types';

interface SelectFieldProps {
  merkmal: Merkmal;
  value: string;
  onChange: (value: string) => void;
}

const SelectField: React.FC<SelectFieldProps> = ({ merkmal, value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={merkmal.readOnly}
      hidden={merkmal.hidden}
    >
      {merkmal.merkmalswerte.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export default SelectField;
