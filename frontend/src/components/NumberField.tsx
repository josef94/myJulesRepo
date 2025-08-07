import React from 'react';
import { Merkmal } from '../data/types';

interface NumberFieldProps {
  merkmal: Merkmal;
  value: number;
  onChange: (value: number) => void;
}

const NumberField: React.FC<NumberFieldProps> = ({ merkmal, value, onChange }) => {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      readOnly={merkmal.readOnly}
      hidden={merkmal.hidden}
      step={merkmal.datentyp === 'Real' ? 'any' : '1'}
    />
  );
};

export default NumberField;
