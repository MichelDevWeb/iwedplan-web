'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Language } from '@/lib/translations';

interface LanguageSelectorProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export default function LanguageSelector({ language, setLanguage }: LanguageSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-600 rounded-full bg-white/70 backdrop-blur-sm hover:bg-white/90">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setLanguage('en')}
          className={language === 'en' ? 'bg-pink-50 text-pink-500' : ''}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage('vi')}
          className={language === 'vi' ? 'bg-pink-50 text-pink-500' : ''}
        >
          Tiếng Việt
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 