"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Eye, Database, Users, Bell } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
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
            <Shield className="h-5 w-5 text-pink-500" />
            <span className="font-semibold text-gray-900">Chính sách bảo mật</span>
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Chính sách bảo mật</h1>
            <p className="text-xl text-gray-600">Cập nhật lần cuối: 1 tháng 1, 2024</p>
          </div>

          {/* Introduction */}
          <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-8">
            <div className="flex items-start space-x-3">
              <Lock className="h-6 w-6 text-green-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">Cam kết bảo mật</h3>
                <p className="text-green-800">
                  iWedPlan cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn. 
                  Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Sections */}
          <div className="space-y-8">
            {/* Section 1 */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Database className="h-6 w-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">1. Thông tin chúng tôi thu thập</h2>
              </div>
              <p className="text-gray-700 mb-4">
                Chúng tôi thu thập các loại thông tin sau để cung cấp dịch vụ tốt nhất:
              </p>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <h4 className="font-semibold text-blue-900 mb-2">Thông tin cá nhân</h4>
                  <ul className="list-disc pl-6 space-y-1 text-blue-800">
                    <li>Họ tên, email, số điện thoại</li>
                    <li>Thông tin cô dâu và chú rể</li>
                    <li>Ngày cưới và địa điểm tổ chức</li>
                    <li>Ảnh và video cưới</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                  <h4 className="font-semibold text-purple-900 mb-2">Thông tin kỹ thuật</h4>
                  <ul className="list-disc pl-6 space-y-1 text-purple-800">
                    <li>Địa chỉ IP và thông tin thiết bị</li>
                    <li>Loại trình duyệt và hệ điều hành</li>
                    <li>Cookies và dữ liệu phiên làm việc</li>
                    <li>Lịch sử sử dụng dịch vụ</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Eye className="h-6 w-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">2. Cách chúng tôi sử dụng thông tin</h2>
              </div>
              <p className="text-gray-700 mb-4">
                Thông tin của bạn được sử dụng cho các mục đích sau:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Tạo và quản lý website cưới của bạn</li>
                <li>Xử lý thanh toán và cung cấp tính năng VIP</li>
                <li>Gửi thông báo quan trọng về dịch vụ</li>
                <li>Cải thiện chất lượng dịch vụ</li>
                <li>Hỗ trợ khách hàng khi cần thiết</li>
                <li>Tuân thủ các yêu cầu pháp lý</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Users className="h-6 w-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">3. Chia sẻ thông tin</h2>
              </div>
              <p className="text-gray-700 mb-4">
                Chúng tôi không bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn, trừ các trường hợp:
              </p>
              
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2">Các bên thứ ba được ủy quyền</h4>
                  <ul className="list-disc pl-6 space-y-1 text-yellow-800">
                    <li>Nhà cung cấp dịch vụ thanh toán (VNPay, MoMo, ZaloPay)</li>
                    <li>Dịch vụ lưu trữ đám mây (Firebase, AWS)</li>
                    <li>Dịch vụ phân tích và theo dõi (Google Analytics)</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-900 mb-2">Yêu cầu pháp lý</h4>
                  <p className="text-red-800">
                    Khi được yêu cầu bởi cơ quan pháp luật hoặc để bảo vệ quyền lợi hợp pháp của chúng tôi và người dùng.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Lock className="h-6 w-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">4. Bảo mật dữ liệu</h2>
              </div>
              <p className="text-gray-700 mb-4">
                Chúng tôi áp dụng các biện pháp bảo mật tiên tiến:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Mã hóa SSL/TLS cho tất cả kết nối</li>
                <li>Mã hóa dữ liệu nhạy cảm trong cơ sở dữ liệu</li>
                <li>Xác thực đa yếu tố (MFA) cho tài khoản quản trị</li>
                <li>Kiểm tra bảo mật định kỳ</li>
                <li>Sao lưu dữ liệu tự động hàng ngày</li>
                <li>Giám sát 24/7 để phát hiện hoạt động bất thường</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Bell className="h-6 w-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">5. Quyền của bạn</h2>
              </div>
              <p className="text-gray-700 mb-4">
                Bạn có các quyền sau đối với thông tin cá nhân của mình:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                  <h4 className="font-semibold text-pink-900 mb-2">Quyền truy cập</h4>
                  <p className="text-pink-800 text-sm">
                    Xem và tải xuống tất cả dữ liệu cá nhân mà chúng tôi lưu trữ về bạn.
                  </p>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-2">Quyền chỉnh sửa</h4>
                  <p className="text-indigo-800 text-sm">
                    Cập nhật hoặc sửa đổi thông tin cá nhân bất kỳ lúc nào.
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Quyền xóa</h4>
                  <p className="text-green-800 text-sm">
                    Yêu cầu xóa hoàn toàn tài khoản và dữ liệu liên quan.
                  </p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-2">Quyền hạn chế</h4>
                  <p className="text-orange-800 text-sm">
                    Hạn chế việc xử lý dữ liệu trong một số trường hợp nhất định.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies và theo dõi</h2>
              <p className="text-gray-700 mb-4">
                Chúng tôi sử dụng cookies để cải thiện trải nghiệm người dùng:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Cookies thiết yếu:</strong> Cần thiết cho hoạt động cơ bản của website</li>
                <li><strong>Cookies phân tích:</strong> Giúp chúng tôi hiểu cách bạn sử dụng dịch vụ</li>
                <li><strong>Cookies marketing:</strong> Hiển thị quảng cáo phù hợp (có thể tắt)</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Lưu trữ dữ liệu</h2>
              <p className="text-gray-700 mb-4">
                Dữ liệu của bạn được lưu trữ:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Trong suốt thời gian sử dụng dịch vụ</li>
                <li>Tối đa 2 năm sau khi tài khoản bị xóa (để tuân thủ pháp luật)</li>
                <li>Tại các trung tâm dữ liệu bảo mật ở Việt Nam và Singapore</li>
                <li>Với bản sao lưu được mã hóa tại các địa điểm khác nhau</li>
              </ul>
            </section>

            {/* Contact Section */}
            <section className="bg-gray-50 p-6 rounded-lg border">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Liên hệ về bảo mật</h2>
              <p className="text-gray-700 mb-4">
                Nếu bạn có thắc mắc về chính sách bảo mật hoặc muốn thực hiện quyền của mình:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email bảo mật:</strong> security@iwedplan.com</p>
                <p><strong>Email hỗ trợ:</strong> micheldevweb2020@gmail.com</p>
                <p><strong>Điện thoại:</strong> +84 123 456 789</p>
                <p><strong>Địa chỉ:</strong> Lái Thiêu, Thuận An, Bình Dương</p>
              </div>
              
              <div className="mt-4 p-4 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Thời gian phản hồi:</strong> Chúng tôi cam kết phản hồi các yêu cầu về bảo mật trong vòng 72 giờ.
                </p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 