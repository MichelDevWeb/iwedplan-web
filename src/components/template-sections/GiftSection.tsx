"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Copy, Check, ExternalLink, QrCode, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import GiftCustomizer from '@/components/wedding/GiftCustomizer';
import { defaultAccounts } from '@/config/templateConfig';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  qrCode?: string;
}

interface GiftSectionProps {
  weddingId?: string;
  title?: string;
  description?: string;
  bankAccounts?: BankAccount[];
  onSaveSettings?: (settings: {
    bankAccounts?: BankAccount[];
    title?: string;
    description?: string;
    // Add other gift-related settings as needed
  }) => void;
}

const GiftSection: React.FC<GiftSectionProps> = ({
  weddingId = "",
  title = "Mừng Cưới",
  description = "Sự hiện diện của bạn là món quà quý giá nhất đối với chúng tôi.",
  bankAccounts = [],
  onSaveSettings
}) => {
  const { isAuthenticated } = useAuth();
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [currentQrCode, setCurrentQrCode] = useState<string | null>(null);
  const [currentBankName, setCurrentBankName] = useState<string>('');
  const [favoriteAccounts, setFavoriteAccounts] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);
  
  // Cache initial data for reset capability
  const cachedInitialData = useMemo(() => ({
    giftTitle: title,
    giftDescription: description,
    bankAccounts: bankAccounts.length > 0 ? bankAccounts : defaultAccounts
  }), [title, description, bankAccounts]);
  
  // State for tracking updates
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);
  const [currentAccounts, setCurrentAccounts] = useState<BankAccount[]>(
    bankAccounts.length > 0 ? bankAccounts : defaultAccounts
  );

  // Monitor when section scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 } // Trigger when 20% of section is visible
    );
    
    const section = document.getElementById('gift');
    if (section) observer.observe(section);
    
    return () => {
      if (section) observer.disconnect();
    };
  }, []);

  const handleCopy = (text: string, name: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAccount(name);
      setTimeout(() => setCopiedAccount(null), 2000);
    });
  };

  const openQrDialog = (qrCode: string, bankName: string) => {
    setCurrentQrCode(qrCode);
    setCurrentBankName(bankName);
    setIsQrDialogOpen(true);
  };

  const toggleFavorite = (accountId: string) => {
    setFavoriteAccounts(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(accountId)) {
        newFavorites.delete(accountId);
      } else {
        newFavorites.add(accountId);
      }
      return newFavorites;
    });
  };

  // Handle gift settings update
  const handleGiftUpdate = (data: Record<string, unknown>, isPreview: boolean = false) => {
    const updates: Record<string, unknown> = {};
    
    if (data.giftTitle) {
      updates.giftTitle = data.giftTitle;
      setCurrentTitle(data.giftTitle as string);
    }
    
    if (data.giftDescription) {
      updates.giftDescription = data.giftDescription;
      setCurrentDescription(data.giftDescription as string);
    }
    
    if (data.bankAccounts) {
      updates.bankAccounts = data.bankAccounts;
      setCurrentAccounts(data.bankAccounts as BankAccount[]);
    }
    
    // Call parent's onSaveSettings if provided and not in preview mode
    if (onSaveSettings && !isPreview && Object.keys(updates).length > 0) {
      onSaveSettings({
        title: updates.giftTitle as string,
        description: updates.giftDescription as string,
        bankAccounts: updates.bankAccounts as BankAccount[]
      });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const accountItemVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: (custom: number) => ({
      scale: 1,
      opacity: 1,
      transition: { 
        delay: custom * 0.1,
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    })
  };

  return (
    <section 
      id="gift" 
      className="w-full py-16 px-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, rgba(254, 242, 242, 0.8), rgba(252, 231, 243, 0.8))"
      }}
    >
      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-60">
        <Image 
          src="/images/album-corner.png" 
          alt="Corner decoration" 
          width={150}
          height={150}
          style={{ objectFit: 'contain' }}
        />
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-60">
        <Image 
          src="/images/album-corner.png" 
          alt="Corner decoration" 
          width={150}
          height={150}
          style={{ objectFit: 'contain', transform: 'rotate(90deg)' }}
        />
      </div>
      <div className="absolute bottom-0 left-0 w-32 h-32 opacity-60">
        <Image 
          src="/images/album-corner.png" 
          alt="Corner decoration" 
          width={150}
          height={150}
          style={{ objectFit: 'contain', transform: 'rotate(270deg)' }}
        />
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-60">
        <Image 
          src="/images/album-corner.png" 
          alt="Corner decoration" 
          width={150}
          height={150}
          style={{ objectFit: 'contain', transform: 'rotate(180deg)' }}
        />
      </div>

      {/* Gift Customizer - Only visible to authenticated users */}
      {isAuthenticated && weddingId && (
        <div className="absolute top-1 right-1 z-20">
          <GiftCustomizer
            weddingId={weddingId}
            initialData={cachedInitialData}
            onUpdate={(data) => handleGiftUpdate(data, false)}
            onPreview={(data) => handleGiftUpdate(data, true)}
          />
        </div>
      )}

      <motion.div 
        className="max-w-4xl mx-auto relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        {/* Section Header */}
        <motion.div 
          variants={itemVariants}
          className="relative mb-8 text-center"
        >
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-32 md:w-40 h-8 opacity-70">
            <Image 
              src="/images/divider-ornament.png" 
              alt="Ornament" 
              fill
              sizes="(max-width: 768px) 128px, 160px"
              style={{ objectFit: 'contain' }}
            />
          </div>
          <h2 className="text-3xl md:text-4xl font-script text-rose-700 font-bold relative z-10 px-4 md:px-8 inline-block">
            {currentTitle}
          </h2>
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 rotate-180 w-32 md:w-40 h-8 opacity-70">
            <Image 
              src="/images/divider-ornament.png" 
              alt="Ornament" 
              fill
              sizes="(max-width: 768px) 128px, 160px"
              style={{ objectFit: 'contain' }}
            />
          </div>
        </motion.div>

        <motion.p 
          variants={itemVariants}
          className="text-center text-gray-700 mb-10 max-w-2xl mx-auto font-serif italic"
        >
          {currentDescription}
        </motion.p>

        {/* Accounts Grid */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {currentAccounts.map((account, index) => (
            <motion.div 
              key={account.id}
              custom={index}
              variants={accountItemVariants}
              className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-md border border-pink-100 transform transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group relative"
            >
              <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                {account.qrCode && (
                  <div className="relative w-32 h-32 flex-shrink-0 cursor-pointer group" 
                       onClick={() => openQrDialog(account.qrCode!, account.bankName)}>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 rounded-lg flex items-center justify-center">
                      <QrCode className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <Image 
                      src={account.qrCode} 
                      alt="QR Code" 
                      className="rounded-lg border border-gray-200 p-1 transition-all duration-300 group-hover:border-pink-300"
                      width={128}
                      height={128}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-medium text-rose-700 mb-1">{account.bankName}</h3>
                    <button
                      onClick={() => toggleFavorite(account.id)}
                      className="p-1 hover:bg-pink-50 rounded-full transition-colors"
                      aria-label="Toggle favorite"
                    >
                      <Heart 
                        size={18} 
                        className={cn(
                          "transition-colors duration-300",
                          favoriteAccounts.has(account.id) 
                            ? "fill-red-500 text-red-500" 
                            : "text-pink-300"
                        )}
                      />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Số tài khoản:</p>
                      <div className="flex items-center">
                        <p className="text-base font-medium text-gray-800">{account.accountNumber}</p>
                        <button 
                          onClick={() => handleCopy(account.accountNumber, `${account.id}-number`)}
                          className="ml-2 text-rose-500 hover:text-rose-600 transition-colors p-1 hover:bg-pink-50 rounded-full"
                          aria-label="Copy account number"
                        >
                          {copiedAccount === `${account.id}-number` ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Chủ tài khoản:</p>
                      <div className="flex items-center">
                        <p className="text-base font-medium text-gray-800">{account.accountName}</p>
                        <button 
                          onClick={() => handleCopy(account.accountName, `${account.id}-name`)}
                          className="ml-2 text-rose-500 hover:text-rose-600 transition-colors p-1 hover:bg-pink-50 rounded-full"
                          aria-label="Copy account name"
                        >
                          {copiedAccount === `${account.id}-name` ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* More interactive options */}
              <div className="flex justify-end gap-2">
                {account.qrCode && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-pink-50 border-pink-100 text-pink-700 hover:bg-pink-100"
                    onClick={() => openQrDialog(account.qrCode!, account.bankName)}
                  >
                    <QrCode className="h-3 w-3 mr-2" />
                    Xem mã QR
                  </Button>
                )}
              </div>
              
              {/* Favorite indicator */}
              {favoriteAccounts.has(account.id) && (
                <div className="absolute -right-2 -top-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                  Ưu tiên
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
        
        {/* Footer decorative element */}
        <motion.div 
          variants={itemVariants}
          className="mt-12 flex justify-center"
        >
          <div className="w-48 md:w-72 h-8 opacity-70">
            <Image 
              src="/images/heart-divider.png" 
              alt="Heart divider" 
              width={500}
              height={50}
              sizes="(max-width: 768px) 288px, 500px"
              style={{ objectFit: 'contain' }}
            />
          </div>
        </motion.div>
      </motion.div>
      
      {/* QR Code Dialog */}
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-medium text-gray-800">{currentBankName}</h2>
            <p className="text-sm text-gray-500">Quét mã QR để chuyển tiền nhanh chóng</p>
            
            {currentQrCode && (
              <div className="flex justify-center">
                <div className="relative w-72 h-72 border-8 border-white rounded-lg shadow-md">
                  <Image 
                    src={currentQrCode} 
                    alt="QR Code Full Size" 
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-center pt-2">
              <Button 
                variant="outline" 
                onClick={() => setIsQrDialogOpen(false)}
                className="w-full max-w-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
              >
                Đóng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default GiftSection; 