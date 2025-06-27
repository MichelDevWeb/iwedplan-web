# iWEDPLAN Wedding Website

Beautiful and customizable wedding website built with Next.js and Tailwind CSS.

![iWEDPLAN Wedding Website](public/images/iWEDPLAN.png)

## Features

- 📱 Responsive design optimized for all devices
- 🎨 Beautiful wedding-themed UI with elegant animations
- 🌙 Light/dark mode support 
- 🗓️ Dynamic date calculations for countdown timers
- 📷 Image gallery with carousel
- 📋 RSVP form with guest management
- 📝 Interactive wishes/messages section
- 📅 Relationship timeline and calendar
- 🎬 Video integration
- 💝 Gift registry/money transfer options
- 🗺️ Maps and event location details
- 📝 Todo List Management: Quản lý công việc chuẩn bị đám cưới
  - Danh sách công việc được phân loại theo thời gian và mức độ ưu tiên
  - Theo dõi tiến độ hoàn thành công việc
  - Gán công việc cho các thành viên trong gia đình
  - Thông báo nhắc nhở khi đến hạn
  - Gợi ý quảng cáo thông minh cho từng loại công việc
- 🎨 Wedding Template Creator: Tạo thiệp mời điện tử
  - Nhiều mẫu thiệp đẹp mắt, dễ dàng tùy chỉnh
  - Tích hợp thông tin đám cưới tự động
  - Chia sẻ thiệp mời qua mạng xã hội hoặc tin nhắn
  - Theo dõi số lượng khách xác nhận tham dự

## Getting Started

### Prerequisites

- Node.js 14.6.0 or newer
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/iwedplan-web.git
   cd iwedplan-web
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

## Customization

### Personalization

1. Edit bride and groom information in `src/components/sections/BrideGroomSection.tsx`
2. Update wedding date and event details in `src/components/sections/EventsSection.tsx`
3. Change the relationship start date in `src/components/sections/CalendarSection.tsx`
4. Replace sample pictures in the `public/images` directory with your own

### Styling

The website uses Tailwind CSS for styling. Main theme colors can be modified in:

- `src/app/globals.css` - Contains wedding theme color variables
- `tailwind.config.js` - Extends the default theme with custom values

### Adding/Removing Sections

The main layout is defined in `src/app/page.tsx`. You can easily add, remove, or reorder sections by modifying this file.

## Project Structure

```
iwedplan-web/
├── public/           # Static assets (images, fonts, etc.)
├── src/
│   ├── app/          # Next.js app router
│   │   └── [weddingId]/   # Wedding routes
│   │       ├── template/  # Wedding template pages
│   │       └── todo/      # Smart To-do List pages
│   ├── components/   # React components
│   │   ├── common/   # Shared components (header, footer, etc.)
│   │   ├── sections/ # Main page sections
│   │   ├── todo/     # Todo list components
│   │   └── ui/       # UI components (buttons, cards, etc.)
│   └── lib/          # Utility functions
│       └── firebase/ # Firebase services
└── tailwind.config.js # Tailwind configuration
```

## Deployment

This project can be easily deployed on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fiwedplan-web)

For other deployment options, refer to the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Contributing

Contributions are welcome! Feel free to submit a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Built with [Next.js](https://nextjs.org)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Inspiration from various wedding websites and templates
