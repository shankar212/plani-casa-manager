
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface EditableCellProps {
  id?: string;
  value: string | number | null;
  onSave: (value: string | number | null) => void;
  onNavigate?: (direction: 'next' | 'prev' | 'down' | 'up') => void;
  type?: 'text' | 'number' | 'select' | 'date';
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
  const cellRef = useRef<HTMLDivElement>(null);

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
      const cleanValue = parseNumberFromFormatted(editValue);
      const numValue = parseFloat(cleanValue);
      onSave(isNaN(numValue) ? 0 : numValue);
    } else if (type === 'date') {
      // For date type, convert Brazilian format to ISO format for storage
      if (editValue && editValue.includes('/')) {
        const [day, month, year] = editValue.split('/');
        if (day && month && year && year.length === 4) {
          const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          onSave(isoDate);
        } else {
          onSave(editValue || null);
        }
      } else {
        onSave(editValue || null);
      }
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
    if (import.meta.env.DEV) {
      console.log('Key pressed:', e.key, 'Cell ID:', id, 'Is editing:', isEditing);
    }
    
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'select' && !isEditing) {
        // For select cells, Enter should open the dropdown
        setIsEditing(true);
      } else {
        handleSave();
        if (onNavigate) {
          if (import.meta.env.DEV) {
            console.log('Navigating down from Enter');
          }
          onNavigate('down');
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (import.meta.env.DEV) {
        console.log('Tab pressed, Shift key:', e.shiftKey);
      }
      
      // Always save current value when pressing Tab
      if (isNewRow) {
        // For new row, save to local state
        if (type === 'number') {
          const numValue = parseFloat(editValue);
          onSave(isNaN(numValue) ? 0 : numValue);
        } else {
          onSave(editValue || null);
        }
      } else {
        // For existing materials, save to database
        handleSave();
      }
      
      if (onNavigate) {
        const direction = e.shiftKey ? 'prev' : 'next';
        if (import.meta.env.DEV) {
          console.log('Navigating:', direction);
        }
        onNavigate(direction);
      }
      
      setIsEditing(false);
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

  const formatNumberWithSeparator = (num: number | string | null): string => {
    if (num === null || num === undefined) return '';
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numValue)) return '';
    return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseNumberFromFormatted = (str: string): string => {
    return str.replace(/\./g, '');
  };

  const getDisplayValue = () => {
    if (type === 'select' && options.length > 0) {
      const option = options.find(opt => opt.value === value);
      return option ? option.label : (value || placeholder || '-');
    }
    
    // For number type, format with thousand separators
    if (type === 'number' && value !== null && value !== undefined && value !== '') {
      return formatNumberWithSeparator(value);
    }
    
    // For date type, format for display
    if (type === 'date' && value) {
      // Convert ISO date to Brazilian format for display
      if (value.toString().includes('-') && value.toString().length === 10) {
        const [year, month, day] = value.toString().split('-');
        return `${day}/${month}/${year}`;
      }
      return value.toString();
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
        ref={cellRef}
        className={cn("p-2 text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-ring", className)}
        tabIndex={tabIndex}
        onKeyDown={handleKeyDown}
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
            if (import.meta.env.DEV) {
              console.log('Select value changed:', val);
            }
            setEditValue(val);
            if (isNewRow) {
              onSave(val === '' ? null : val);
            } else {
              onSave(val === '' ? null : val);
            }
            setIsEditing(false);
            
            // Auto-navigate to next cell after select
            if (onNavigate) {
              setTimeout(() => onNavigate('next'), 50);
            }
          }}
        >
          <SelectTrigger className="h-8 text-sm" onKeyDown={handleKeyDown}>
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
          if (import.meta.env.DEV) {
            console.log('Input blur, isNewRow:', isNewRow);
          }
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
      ref={cellRef}
      className={cn(
        "p-2 text-sm cursor-pointer hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
        isNewRow && "italic text-muted-foreground",
        className
      )}
      onClick={() => {
        if (import.meta.env.DEV) {
          console.log('Cell clicked:', id);
        }
        if (type === 'number' && value) {
          // For number type, set unformatted value for editing
          setEditValue(value.toString());
        }
        setIsEditing(true);
      }}
      onKeyDown={(e) => {
        // Handle Enter to start editing
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsEditing(true);
        } else {
          handleKeyDown(e);
        }
      }}
      tabIndex={tabIndex}
    >
      {getDisplayValue()}
    </div>
  );
};
