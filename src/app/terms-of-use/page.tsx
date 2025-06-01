"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Scale, FileText, Shield, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link href="/landing" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại trang chủ
            </Link>
          </Button>
          <div className="flex items-center space-x-2">
            <Scale className="h-5 w-5 text-pink-500" />
            <span className="font-semibold text-gray-900">Điều khoản sử dụng</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div 
          className="prose prose-lg max-w-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Điều khoản sử dụng</h1>
            <p className="text-xl text-gray-600">Hiệu lực từ ngày 1 tháng 1, 2024</p>
          </div>

          {/* Introduction */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-8">
            <div className="flex items-start space-x-3">
              <FileText className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Chào mừng đến với iWedPlan</h3>
                <p className="text-blue-800">
                  Bằng việc sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện sau đây. 
                  Vui lòng đọc kỹ trước khi sử dụng.
                </p>
              </div>
            </div>
          </div>

          {/* Terms Sections */}
          <div className="space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Định nghĩa dịch vụ</h2>
              <p className="text-gray-700 mb-4">
                iWedPlan là nền tảng tạo website cưới trực tuyến, cung cấp các công cụ và template để 
                người dùng tạo ra những trang web cưới cá nhân hóa.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Tạo website cưới với nhiều template đa dạng</li>
                <li>Quản lý danh sách khách mời và RSVP</li>
                <li>Chia sẻ album ảnh và video cưới</li>
                <li>Tích hợp nhạc nền và hiệu ứng đặc biệt</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Tài khoản người dùng</h2>
              <p className="text-gray-700 mb-4">
                Để sử dụng đầy đủ các tính năng của iWedPlan, bạn cần tạo tài khoản:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Thông tin đăng ký phải chính xác và đầy đủ</li>
                <li>Bạn có trách nhiệm bảo mật thông tin đăng nhập</li>
                <li>Không chia sẻ tài khoản với người khác</li>
                <li>Thông báo ngay cho chúng tôi nếu phát hiện tài khoản bị xâm phạm</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Nội dung và sở hữu trí tuệ</h2>
              <p className="text-gray-700 mb-4">
                Bạn giữ quyền sở hữu đối với nội dung mà mình tải lên:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Ảnh, video, và văn bản bạn tải lên thuộc về bạn</li>
                <li>Bạn cấp cho iWedPlan quyền sử dụng nội dung để cung cấp dịch vụ</li>
                <li>Nội dung không được vi phạm bản quyền của bên thứ ba</li>
                <li>Chúng tôi có quyền gỡ bỏ nội dung không phù hợp</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Thanh toán và hoàn tiền</h2>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Chính sách thanh toán</span>
                </div>
              </div>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Thanh toán được xử lý qua các cổng thanh toán bảo mật</li>
                <li>Tính năng VIP có hiệu lực ngay sau khi thanh toán thành công</li>
                <li>Hoàn tiền trong vòng 7 ngày nếu không hài lòng với dịch vụ</li>
                <li>Chi phí giao dịch không được hoàn lại</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Hạn chế trách nhiệm</h2>
              <p className="text-gray-700 mb-4">
                iWedPlan cung cấp dịch vụ "nguyên trạng" và không đảm bảo:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Dịch vụ hoạt động liên tục 100% thời gian</li>
                <li>Không có lỗi kỹ thuật xảy ra</li>
                <li>Tương thích với tất cả thiết bị và trình duyệt</li>
                <li>Bảo mật tuyệt đối dữ liệu người dùng</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Chấm dứt dịch vụ</h2>
              <p className="text-gray-700 mb-4">
                Chúng tôi có quyền chấm dứt hoặc tạm ngừng tài khoản nếu:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Vi phạm điều khoản sử dụng</li>
                <li>Sử dụng dịch vụ cho mục đích bất hợp pháp</li>
                <li>Tải lên nội dung không phù hợp</li>
                <li>Không thanh toán các khoản phí đúng hạn</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Thay đổi điều khoản</h2>
              <p className="text-gray-700 mb-4">
                iWedPlan có quyền cập nhật điều khoản sử dụng. Chúng tôi sẽ thông báo trước 
                30 ngày về bất kỳ thay đổi quan trọng nào.
              </p>
            </section>

            {/* Contact Section */}
            <section className="bg-gray-50 p-6 rounded-lg border">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Liên hệ</h2>
              <p className="text-gray-700 mb-4">
                Nếu bạn có bất kỳ câu hỏi nào về điều khoản sử dụng này, vui lòng liên hệ:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> micheldevweb2020@gmail.com</p>
                <p><strong>Điện thoại:</strong> +84 123 456 789</p>
                <p><strong>Địa chỉ:</strong> Lái Thiêu, Thuận An, Bình Dương</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 