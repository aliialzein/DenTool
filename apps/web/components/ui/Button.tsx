import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex min-h-10 items-center justify-center rounded-lg font-semibold transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50';

  const variants = {
    primary:
      'bg-blue-700 text-white hover:bg-blue-800 active:bg-blue-900',
    secondary:
      'bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-200',
    outline:
      'border border-blue-200 bg-white text-blue-700 hover:border-blue-400 hover:bg-blue-50 active:bg-blue-100',
    ghost:
      'text-slate-700 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100',
  };

  const sizes = {
    sm: 'px-3 text-sm',
    md: 'px-4 text-sm',
    lg: 'min-h-12 px-5 text-base',
  };

  return (
    <button
      {...props}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}