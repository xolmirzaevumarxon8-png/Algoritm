import React from 'react';
import { IMaskInput } from 'react-imask';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  maskType?: 'phone' | 'currency' | 'none';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, maskType = 'none', className = '', ...props }, ref) => {
    const baseClasses = `w-full px-4 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none transition-colors ${
      error
        ? 'border-red-300 dark:border-red-500/50 focus:border-red-500'
        : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400'
    } text-slate-800 dark:text-slate-200 ${className}`;

    const renderInput = () => {
      if (maskType === 'phone') {
        const { onChange, ...rest } = props as any;
        return (
          <IMaskInput
            {...rest}
            mask="+{998} (00) 000-00-00"
            inputRef={ref as any}
            onAccept={(val) => {
              if (props.onChange) {
                props.onChange({ target: { name: props.name, value: val } } as any);
              }
            }}
            className={baseClasses}
          />
        );
      }
      if (maskType === 'currency') {
        const { onChange, ...rest } = props as any;
        return (
          <IMaskInput
            {...rest}
            mask={Number}
            scale={0}
            thousandsSeparator=" "
            normalizeZeros={true}
            padFractionalZeros={false}
            inputRef={ref as any}
            unmask={true}
            onAccept={(val) => {
              if (props.onChange) {
                props.onChange({ target: { name: props.name, value: val } } as any);
              }
            }}
            className={baseClasses}
          />
        );
      }

      return (
        <input
          {...props}
          ref={ref}
          className={baseClasses}
        />
      );
    };

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="relative">
          {renderInput()}
          {maskType === 'currency' && props.value && (
             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm font-medium">
               so'm
             </span>
          )}
          {error && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
          )}
        </div>
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
