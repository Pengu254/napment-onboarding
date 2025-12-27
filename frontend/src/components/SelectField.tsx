import { useState } from 'react';
import { SelectFieldProps } from '../types/mcp-messages';
import styles from './SelectField.module.css';

interface Props {
  data: SelectFieldProps;
  onChange: (id: string, value: string) => void;
}

export function SelectField({ data, onChange }: Props) {
  const { id, label, options, placeholder, value: initialValue } = data;
  const [value, setValue] = useState(initialValue || '');
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(e.target.value);
    onChange(id, e.target.value);
  };
  
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <select
        value={value}
        onChange={handleChange}
        className={styles.select}
      >
        {placeholder && (
          <option value="" disabled>{placeholder}</option>
        )}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

