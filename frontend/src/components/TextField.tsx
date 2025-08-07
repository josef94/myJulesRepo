import React from 'react';
import { Merkmal } from '../data/types';

interface TextFieldProps {
  merkmal: Merkmal;
  value: string;
  onChange: (value: string) => void;
}

const TextField: React.FC<TextFieldProps> = ({ merkmal, value, onChange }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      readOnly={merkmal.readOnly}
      hidden={merkmal.hidden}
    />
  );
};

export default TextField;
