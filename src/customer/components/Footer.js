import React from "react";
import { FaInstagram, FaFacebook, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>📍 Café Rustic — 123 Main Street, Your City</div>
        <div className="flex items-center gap-4">
          <a
            href="https://www.instagram.com/"
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-500 hover:text-pink-600 transition-colors"
          >
            <FaInstagram />
          </a>

          <a
            href="https://www.facebook.com/yourprofile"
            aria-label="Facebook"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 hover:text-blue-800 transition-colors"
          >
            <FaFacebook />
          </a>

          <a
            href="https://twitter.com/yourprofile"
            aria-label="Twitter"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-500 transition-colors"
          >
            <FaTwitter />
          </a>
        </div>
      </div>
    </footer>
  );
}
