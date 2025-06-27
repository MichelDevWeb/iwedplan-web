import { format, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Định dạng ngày tháng theo định dạng chuẩn
 * @param date - Đối tượng Date cần định dạng
 * @param formatStr - Chuỗi định dạng (mặc định: dd/MM/yyyy)
 * @returns Chuỗi ngày tháng đã định dạng
 */
export function formatDate(date: Date, formatStr: string = 'dd/MM/yyyy'): string {
  if (!date || !isValid(date)) {
    return '';
  }
  
  try {
    return format(date, formatStr, { locale: vi });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Định dạng ngày tháng với thời gian
 * @param date - Đối tượng Date cần định dạng
 * @returns Chuỗi ngày tháng với thời gian
 */
export function formatDateWithTime(date: Date): string {
  if (!date || !isValid(date)) {
    return '';
  }
  
  try {
    return format(date, 'HH:mm - dd/MM/yyyy', { locale: vi });
  } catch (error) {
    console.error('Error formatting date with time:', error);
    return '';
  }
}

/**
 * Định dạng ngày tháng theo kiểu dài
 * @param date - Đối tượng Date cần định dạng
 * @returns Chuỗi ngày tháng theo kiểu dài (vd: Thứ Hai, 01 tháng 01 năm 2023)
 */
export function formatLongDate(date: Date): string {
  if (!date || !isValid(date)) {
    return '';
  }
  
  try {
    return format(date, "EEEE, 'ngày' dd 'tháng' MM 'năm' yyyy", { locale: vi });
  } catch (error) {
    console.error('Error formatting long date:', error);
    return '';
  }
}

/**
 * Kiểm tra xem một đối tượng có phải là Date hợp lệ hay không
 * @param date - Đối tượng cần kiểm tra
 * @returns true nếu là Date hợp lệ, false nếu không phải
 */
export function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Calculate days remaining until a target date
 * @param targetDate - Target date to calculate days until
 * @returns Number of days remaining (negative if date is in the past)
 */
export function daysUntil(targetDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
} 