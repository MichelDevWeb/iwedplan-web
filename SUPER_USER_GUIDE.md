# Super User Guide

## Tổng quan
Super User là role đặc biệt cho phép quản trị viên có thể truy cập và thao tác với tất cả các website cưới trong hệ thống, không chỉ giới hạn ở những website do họ tạo ra.

## Tính năng Super User

### 1. Xem tất cả website cưới
- Super User có thể xem tất cả website cưới của tất cả người dùng trong hệ thống
- Hiển thị thông tin owner của từng website

### 2. Chỉnh sửa bất kỳ website nào
- Có thể truy cập và chỉnh sửa template, thiết kế, nội dung của bất kỳ website cưới nào
- Quyền chỉnh sửa không bị giới hạn bởi ownership

### 3. Xoá bất kỳ website nào
- Có thể xoá website cưới của bất kỳ người dùng nào
- Tính năng này yêu cầu xác nhận để tránh xoá nhầm

## Cách thiết lập Super User

### Phương pháp 1: Sử dụng Firebase Console
1. Truy cập Firebase Console
2. Vào Firestore Database
3. Tìm collection `users`
4. Tìm document của user cần cấp quyền
5. Thêm field `role` với giá trị `"super_user"`

### Phương pháp 2: Sử dụng code (Development)
```javascript
import { setSuperUserRole } from '@/lib/firebase/userService';

// Cấp quyền Super User cho một email
await setSuperUserRole('admin@example.com');
```

### Phương pháp 3: Update trực tiếp
```javascript
import { updateUserRole } from '@/lib/firebase/userService';

// Cập nhật role cho một user ID
await updateUserRole('user-id-here', 'super_user');
```

## Interface thay đổi cho Super User

### 1. Template Management Page
- Hiển thị badge "Super User" ở header
- Title thay đổi thành "Tất cả website cưới" thay vì "Website cưới của bạn"
- Hiển thị thông tin owner cho mỗi website
- Description thay đổi thành "Tạo và quản lý tất cả website cưới trong hệ thống"

### 2. Wedding Cards
- Hiển thị thông tin owner (User ID) cho mỗi website
- Super User có thể xem, chỉnh sửa và xoá bất kỳ wedding nào

## Bảo mật

### Kiểm tra quyền
- Mọi thao tác đều được kiểm tra quyền thông qua function `isSuperUser()`
- Chỉ Super User mới có thể:
  - Xem tất cả weddings
  - Xoá wedding của người khác
  - Truy cập vào các function admin

### Logging
- Tất cả hoạt động của Super User đều được log
- Console log khi cấp quyền Super User

## Lưu ý quan trọng

1. **Sử dụng cẩn thận**: Quyền Super User rất mạnh, có thể xoá dữ liệu của tất cả người dùng
2. **Chỉ dành cho admin**: Không nên cấp quyền này cho người dùng thường
3. **Testing**: Nên test trên môi trường development trước khi áp dụng production
4. **Backup**: Luôn backup dữ liệu trước khi thực hiện các thao tác quan trọng

## Các role hiện tại

- `"user"`: Người dùng thường (default)
- `"super_user"`: Quản trị viên hệ thống

## Future Extensions

Có thể mở rộng thêm các role khác như:
- `"moderator"`: Kiểm duyệt nội dung
- `"support"`: Hỗ trợ khách hàng
- `"admin"`: Quản trị cấp cao nhất 