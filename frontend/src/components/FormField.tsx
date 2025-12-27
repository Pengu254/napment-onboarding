import { useState } from 'react';
import { FormFieldProps } from '../types/mcp-messages';
import styles from './FormField.module.css';

interface Props {
  data: FormFieldProps;
  onChange: (id: string, value: string) => void;
}

export function FormField({ data, onChange }: Props) {
  const { id, fieldType, label, placeholder, required, value: initialValue } = data;
  const [value, setValue] = useState(initialValue || '');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onChange(id, e.target.value);
  };
  
  return (
    <div className={styles.field}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <input
        type={fieldType}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={styles.input}
        required={required}
      />
    </div>
  );
}

