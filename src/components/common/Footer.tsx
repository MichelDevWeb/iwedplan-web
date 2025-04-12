import React from 'react';

const Footer = () => {
  // TODO: Replace with actual names
  const groomName = "Chú Rể";
  const brideName = "Cô Dâu";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-100 py-6 mt-16">
      <div className="container mx-auto text-center text-gray-600 text-sm">
        <p className="mb-1">
          Mãi mãi và luôn luôn ❤️ {brideName} & {groomName}
        </p>
        <p>
          &copy; {currentYear} | Made with love -
          {/* Optional: Add link to template creator or personal site */}
           <a href="mailto:micheldevweb2020@gmail.com" className="hover:text-pink-500">Designed by MichelDevWeb</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer; 