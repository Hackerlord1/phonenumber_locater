"use client";

import { useState } from "react";
import { Mail, CheckCircle, XCircle } from "lucide-react";

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function EmailInput({ value, onChange, placeholder }: EmailInputProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.length > 3) {
      setIsValid(validateEmail(newValue));
    } else {
      setIsValid(null);
    }
  };

  return (
    <div className="relative flex items-center">
      <div className="absolute left-4 text-gray-400">
        <Mail className="h-5 w-5" />
      </div>
      
      <input
        type="email"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
      />
      
      {isValid !== null && (
        <div className="absolute right-4">
          {isValid ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
      )}
    </div>
  );
}