
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
  isNewRow?: boolean;
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
  tabIndex = 0,
  isNewRow = false
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
    } else if (e.key === 'Tab') {
      e.preventDefault();
      
      if (isNewRow) {
        // For new row, just navigate without saving
        if (onNavigate) {
          onNavigate(e.shiftKey ? 'prev' : 'next');
        }
      } else {
        // For existing materials, save on Tab
        handleSave();
        if (onNavigate) {
          onNavigate(e.shiftKey ? 'prev' : 'next');
        }
      }
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
      return option ? option.label : (value || placeholder || '-');
    }
    
    // For new row, show the actual entered value or placeholder
    if (isNewRow) {
      return value?.toString() || placeholder || '';
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
            if (isNewRow) {
              onSave(val === '' ? null : val);
            } else {
              onSave(val === '' ? null : val);
            }
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
        onBlur={() => {
          if (isNewRow) {
            // For new row, save the value to local state but don't create material
            onSave(editValue || null);
          } else {
            // For existing materials, save to database
            handleSave();
          }
          setIsEditing(false);
        }}
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
        isNewRow && "italic text-muted-foreground",
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
