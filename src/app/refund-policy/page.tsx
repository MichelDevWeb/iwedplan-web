"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Clock, CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RefundPolicyPage() {
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
            <RefreshCw className="h-5 w-5 text-pink-500" />
            <span className="font-semibold text-gray-900">Chính sách hoàn tiền</span>
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Chính sách hoàn tiền</h1>
            <p className="text-xl text-gray-600">Hiệu lực từ ngày 1 tháng 1, 2024</p>
          </div>

          {/* Introduction */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-8">
            <div className="flex items-start space-x-3">
              <CreditCard className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Cam kết hoàn tiền</h3>
                <p className="text-blue-800">
                  iWedPlan cam kết đảm bảo sự hài lòng của khách hàng. Nếu bạn không hài lòng với dịch vụ, 
                  chúng tôi sẵn sàng hoàn tiền theo các điều kiện dưới đây.
                </p>
              </div>
            </div>
          </div>

          {/* Refund Sections */}
          <div className="space-y-8">
            {/* Section 1 */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="h-6 w-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">1. Thời hạn hoàn tiền</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">Hoàn tiền đầy đủ</h4>
                  </div>
                  <p className="text-green-800 mb-3">
                    <strong>Trong vòng 7 ngày</strong> kể từ ngày thanh toán
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-green-700">
                    <li>Hoàn lại 100% số tiền đã thanh toán</li>
                    <li>Không cần lý do cụ thể</li>
                    <li>Xử lý trong vòng 2-3 ngày làm việc</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-900">Hoàn tiền một phần</h4>
                  </div>
                  <p className="text-yellow-800 mb-3">
                    <strong>Từ 8-30 ngày</strong> kể từ ngày thanh toán
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-700">
                    <li>Hoàn lại 50% số tiền đã thanh toán</li>
                    <li>Cần lý do hợp lệ</li>
                    <li>Xử lý trong vòng 3-5 ngày làm việc</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2">Không áp dụng hoàn tiền</h4>
                <p className="text-red-800 text-sm">
                  Sau 30 ngày kể từ ngày thanh toán, chúng tôi không hỗ trợ hoàn tiền. 
                  Tuy nhiên, bạn vẫn có thể liên hệ để được hỗ trợ kỹ thuật miễn phí.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Điều kiện hoàn tiền</h2>
              
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Các trường hợp được hoàn tiền:</h4>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Website không hoạt động như mô tả</li>
                    <li>Lỗi kỹ thuật nghiêm trọng không thể khắc phục</li>
                    <li>Tính năng VIP không được kích hoạt sau thanh toán</li>
                    <li>Dịch vụ không đáp ứng được nhu cầu cơ bản</li>
                    <li>Thanh toán trùng lặp do lỗi hệ thống</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Các trường hợp KHÔNG được hoàn tiền:</h4>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Thay đổi ý định sau khi đã sử dụng dịch vụ</li>
                    <li>Không thích thiết kế sau khi đã tùy chỉnh</li>
                    <li>Vi phạm điều khoản sử dụng</li>
                    <li>Sử dụng dịch vụ cho mục đích thương mại</li>
                    <li>Tài khoản bị khóa do vi phạm</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Quy trình hoàn tiền</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-pink-50 p-4 rounded-lg border border-pink-200 text-center">
                  <div className="w-10 h-10 bg-pink-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    1
                  </div>
                  <h4 className="font-semibold text-pink-900 mb-2">Gửi yêu cầu</h4>
                  <p className="text-sm text-pink-800">
                    Liên hệ qua email hoặc form hỗ trợ với thông tin chi tiết
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    2
                  </div>
                  <h4 className="font-semibold text-blue-900 mb-2">Xác minh</h4>
                  <p className="text-sm text-blue-800">
                    Chúng tôi xem xét và xác minh yêu cầu trong vòng 24 giờ
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                  <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    3
                  </div>
                  <h4 className="font-semibold text-green-900 mb-2">Phê duyệt</h4>
                  <p className="text-sm text-green-800">
                    Thông báo kết quả và số tiền được hoàn
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
                  <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    4
                  </div>
                  <h4 className="font-semibold text-purple-900 mb-2">Hoàn tiền</h4>
                  <p className="text-sm text-purple-800">
                    Tiền được hoàn về tài khoản gốc trong 2-5 ngày
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Phương thức hoàn tiền</h2>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Hoàn tiền theo phương thức thanh toán gốc:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Thẻ tín dụng/Ghi nợ:</h5>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                        <li>Thời gian: 3-5 ngày làm việc</li>
                        <li>Hoàn về tài khoản thẻ gốc</li>
                        <li>Không có phí giao dịch</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Ví điện tử (MoMo, ZaloPay):</h5>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                        <li>Thời gian: 1-2 ngày làm việc</li>
                        <li>Hoàn về ví gốc</li>
                        <li>Có thể có phí giao dịch 1-2%</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Thông tin cần thiết cho yêu cầu hoàn tiền</h2>
              
              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-900 mb-3">Vui lòng cung cấp đầy đủ thông tin sau:</h4>
                <ul className="list-disc pl-6 space-y-2 text-yellow-800">
                  <li>Email tài khoản đã đăng ký</li>
                  <li>Mã giao dịch (Transaction ID)</li>
                  <li>Ngày và giờ thanh toán</li>
                  <li>Số tiền đã thanh toán</li>
                  <li>Lý do yêu cầu hoàn tiền</li>
                  <li>Ảnh chụp màn hình (nếu có lỗi kỹ thuật)</li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Các trường hợp đặc biệt</h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-blue-400 bg-blue-50 p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Lỗi hệ thống:</h4>
                  <p className="text-blue-800 text-sm">
                    Nếu lỗi do hệ thống của chúng tôi, bạn sẽ được hoàn tiền 100% 
                    cộng thêm voucher giảm giá 20% cho lần sử dụng tiếp theo.
                  </p>
                </div>

                <div className="border-l-4 border-green-400 bg-green-50 p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Thanh toán trùng lặp:</h4>
                  <p className="text-green-800 text-sm">
                    Sẽ được hoàn tiền tự động trong vòng 24 giờ sau khi phát hiện, 
                    không cần yêu cầu từ khách hàng.
                  </p>
                </div>

                <div className="border-l-4 border-purple-400 bg-purple-50 p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Khách hàng VIP:</h4>
                  <p className="text-purple-800 text-sm">
                    Khách hàng có gói VIP sẽ được ưu tiên xử lý và có thời hạn hoàn tiền 
                    kéo dài lên 45 ngày thay vì 30 ngày.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section className="bg-gray-50 p-6 rounded-lg border">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Liên hệ hỗ trợ hoàn tiền</h2>
              <p className="text-gray-700 mb-4">
                Nếu bạn cần hỗ trợ hoàn tiền, vui lòng liên hệ qua các kênh sau:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email hỗ trợ:</strong> refund@iwedplan.com</p>
                  <p><strong>Email chính:</strong> micheldevweb2020@gmail.com</p>
                  <p><strong>Điện thoại:</strong> +84 123 456 789</p>
                  <p><strong>Giờ làm việc:</strong> 8:00 - 18:00 (T2-T6)</p>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Cam kết thời gian phản hồi:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Email: Trong vòng 4 giờ</li>
                    <li>• Điện thoại: Ngay lập tức (giờ hành chính)</li>
                    <li>• Xử lý hoàn tiền: 1-5 ngày làm việc</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 