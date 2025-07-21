
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface EditableCellProps {
  id?: string;
  value: string | number | null;
  onSave: (value: string | number | null) => void;
  onNavigate?: (direction: 'next' | 'prev' | 'down' | 'up') => void;
  type?: 'text' | 'number' | 'select';
  options?: { value: string | null; label: string }[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  tabIndex?: number;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  id,
  value,
  onSave,
  onNavigate,
  type = 'text',
  options = [],
  placeholder,
  className,
  disabled = false,
  tabIndex = 0
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
      onSave(editValue || null);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value?.toString() || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
      if (onNavigate) {
        onNavigate('down');
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'ArrowDown' && !isEditing) {
      e.preventDefault();
      if (onNavigate) {
        onNavigate('down');
      }
    } else if (e.key === 'ArrowUp' && !isEditing) {
      e.preventDefault();
      if (onNavigate) {
        onNavigate('up');
      }
    }
  };

  const getDisplayValue = () => {
    if (type === 'select' && options.length > 0) {
      const option = options.find(opt => opt.value === value);
      return option ? option.label : placeholder || '-';
    }
    return value?.toString() || placeholder || '-';
  };

  if (disabled) {
    return (
      <div 
        id={id}
        className={cn("p-2 text-sm bg-muted/30", className)}
        tabIndex={tabIndex}
      >
        {getDisplayValue()}
      </div>
    );
  }

  if (isEditing) {
    if (type === 'select') {
      return (
        <Select 
          value={editValue} 
          onValueChange={(val) => {
            setEditValue(val);
            onSave(val === 'null-value' ? null : val);
            setIsEditing(false);
          }}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option, index) => (
              <SelectItem 
                key={index} 
                value={option.value || 'null-value'}
              >
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
        tabIndex={tabIndex}
      />
    );
  }

  return (
    <div
      id={id}
      className={cn(
        "p-2 text-sm cursor-pointer hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
        className
      )}
      onClick={() => setIsEditing(true)}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex}
    >
      {getDisplayValue()}
    </div>
  );
};
