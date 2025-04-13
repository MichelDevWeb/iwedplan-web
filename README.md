# IWedPlan - Wedding Website

A beautiful and modern wedding website built with Next.js, Tailwind CSS, and Framer Motion. This website features elegant animations, responsive design, and a romantic theme perfect for sharing wedding details with guests.

## Features

- 🎨 Beautiful and modern UI design
- ✨ Smooth animations and transitions
- 📱 Fully responsive layout
- 🎭 Interactive elements and hover effects
- 📅 Event details and RSVP functionality
- 📍 Location maps and directions
- 📸 Photo gallery
- 💌 Guest book and messages

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Images**: Next.js Image Optimization
- **Deployment**: Vercel

## Project Structure

```
src/
├── components/
│   ├── common/           # Reusable components
│   │   ├── AnimatedWeddingImages.tsx
│   │   └── ...
│   ├── sections/         # Page sections
│   │   ├── BrideGroomSection.tsx
│   │   ├── EventsSection.tsx
│   │   └── ...
│   └── ...
├── public/
│   ├── images/
│   │   ├── album/        # Wedding photos
│   │   └── ...
│   └── ...
└── ...
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/iwedplan-web.git
   cd iwedplan-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Customization

### Images
Place your wedding photos in the following directories:
- `/public/images/album/bride.png` - Bride's photo
- `/public/images/album/groom.png` - Groom's photo
- `/public/images/album/vuquy.png` - Lễ Vu Quy photo
- `/public/images/album/tanhon.png` - Lễ Thành Hôn photo

### Content
Update the following files to customize your wedding details:
- `src/components/sections/BrideGroomSection.tsx` - Bride and groom information
- `src/components/sections/EventsSection.tsx` - Wedding events and locations
- `src/components/sections/RSVPSection.tsx` - RSVP form and details

## Deployment

This project is configured for deployment on Vercel. To deploy:

1. Push your changes to GitHub
2. Connect your repository to Vercel
3. Deploy automatically or manually through the Vercel dashboard

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide React](https://lucide.dev/)
