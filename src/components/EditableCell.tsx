
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface EditableCellProps {
  value: string | number | null;
  onSave: (value: string | number) => void;
  type?: 'text' | 'number' | 'select';
  options?: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onSave,
  type = 'text',
  options = [],
  placeholder,
  className,
  disabled = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toString() || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value?.toString() || '');
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (type === 'number') {
      const numValue = parseFloat(editValue);
      onSave(isNaN(numValue) ? 0 : numValue);
    } else {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value?.toString() || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (disabled) {
    return (
      <div className={cn("p-2 text-sm bg-muted/30", className)}>
        {value?.toString() || '-'}
      </div>
    );
  }

  if (isEditing) {
    if (type === 'select') {
      return (
        <Select value={editValue} onValueChange={(val) => {
          setEditValue(val);
          onSave(val);
          setIsEditing(false);
        }}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="h-8 text-sm"
        placeholder={placeholder}
      />
    );
  }

  return (
    <div
      className={cn(
        "p-2 text-sm cursor-pointer hover:bg-muted/50 transition-colors",
        className
      )}
      onClick={() => setIsEditing(true)}
    >
      {value?.toString() || placeholder || '-'}
    </div>
  );
};
