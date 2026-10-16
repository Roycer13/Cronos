import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
  textarea?: boolean; // ✅ nuevo prop
}

export default function FormInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  textarea = false, // ✅ valor por defecto
  ...props
}: FormInputProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>

      {textarea ? (
        // ✅ Si textarea=true, renderiza un <textarea>
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
          rows={4}
          {...props}
        />
      ) : (
        // ✅ caso normal input
        <Input
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...props}
        />
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
