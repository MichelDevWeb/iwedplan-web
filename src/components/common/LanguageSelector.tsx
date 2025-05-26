'use client';

import React from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { getAvailableLanguages, Language } from '@/lib/translations';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  variant?: 'icon' | 'full' | 'compact' | 'horizontal';
  className?: string;
}

export const LanguageSelector = ({ 
  currentLanguage, 
  onLanguageChange, 
  variant = 'icon',
  className = ''
}: LanguageSelectorProps) => {
  const languages = getAvailableLanguages();
  
  // For horizontal variant, render buttons directly
  if (variant === 'horizontal') {
    return (
      <div className={`grid grid-cols-2 gap-2 ${className}`}>
        {languages.map(language => (
          <Button
            key={language.code}
            variant={currentLanguage === language.code ? 'default' : 'outline'}
            className={currentLanguage === language.code 
              ? 'bg-pink-500 hover:bg-pink-600 transition-all duration-300' 
              : 'border-pink-200 hover:border-pink-300 transition-all duration-300'}
            onClick={() => onLanguageChange(language.code)}
            size="sm"
          >
            {language.name}
          </Button>
        ))}
      </div>
    );
  }
  
  // For all other variants, use dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'icon' ? (
          <Button variant="ghost" size="icon" className={`text-gray-600 ${className}`}>
            <Globe className="h-5 w-5" />
          </Button>
        ) : variant === 'compact' ? (
          <Button variant="ghost" size="sm" className={`text-gray-600 ${className}`}>
            <Globe className="h-4 w-4 mr-1" />
            <span className="text-xs">{currentLanguage.toUpperCase()}</span>
          </Button>
        ) : (
          <Button variant="ghost" className={`text-gray-600 flex items-center gap-2 ${className}`}>
            <Globe className="h-4 w-4" />
            <span>
              {languages.find(lang => lang.code === currentLanguage)?.name || currentLanguage}
            </span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map(language => (
          <DropdownMenuItem 
            key={language.code}
            onClick={() => onLanguageChange(language.code)}
            className={currentLanguage === language.code ? 'bg-pink-50 text-pink-500' : ''}
          >
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 