import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from 'next-intl';

// Custom Social Media Icon Components (since lucide-react deprecated brand icons)
const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

const Footer = () => {
  const t = useTranslations('footer');

  return (
    <footer className="w-full bg-gradient-to-b from-secondary to-secondary/95 text-secondary-foreground border-t border-white/10">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        {/* Main Footer Content */}
        <div className="py-12 md:py-16">
          {/* Brand Section */}
          <div className="mb-10 pb-8 border-b border-white/10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="Company Logo"
                  width={140}
                  height={70}
                  className="object-contain"
                />
              </div>
              <p className="text-white/70 text-body max-w-md">
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 pb-10">
            {/* Quick Links */}
            <div>
              <h3 className="text-h6 font-semibold mb-5 text-white">
                {t('quickLinks')}
              </h3>
              <ul className="space-y-3 text-body-sm">
                <li>
                  <Link
                    href="/"
                    className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    {t('home')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    {t('about')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services"
                    className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    {t('ourServices')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    {t('searchFlights')}
                  </Link>
                </li>
                {/* <li>
                  <Link
                    href="/client"
                    className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    My Bookings
                  </Link>
                </li> */}
                {/* <li>
                  <Link
                    href="/#"
                    className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    Travel Deals
                  </Link>
                </li> */}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-h6 font-semibold mb-5 text-white">{t('support')}</h3>
              <ul className="space-y-3 text-body-sm">
                <li>
                  <Link
                    href="/help-center"
                    className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    {t('helpCenter')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faqs"
                    className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    {t('faqs')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    {t('terms')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    {t('privacy')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact & Social */}
            <div>
              <h3 className="text-h6 font-semibold mb-5 text-white">
                {t('getInTouch')}
              </h3>

              {/* Contact Info */}
              <div className="space-y-3 mb-6 text-body-sm">
                <div className="flex items-start gap-3 text-white/80">
                  <Mail
                    size={18}
                    className="mt-0.5 flex-shrink-0 text-accent"
                  />
                  <span>support@flightbooking.com</span>
                </div>
                <div className="flex items-start gap-3 text-white/80">
                  <Phone
                    size={18}
                    className="mt-0.5 flex-shrink-0 text-accent"
                  />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-start gap-3 text-white/80">
                  <MapPin
                    size={18}
                    className="mt-0.5 flex-shrink-0 text-accent"
                  />
                  <span>123 Travel Street, Sky City</span>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h4 className="text-body-sm font-semibold mb-3 text-white">
                  {t('followUs')}
                </h4>
                <div className="flex gap-4">
                  <Link
                    href="#"
                    className="text-white/80 hover:text-white transition-all duration-200 hover:scale-110 hover:-translate-y-1"
                    aria-label="Facebook"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/10 dark:bg-white/15 hover:bg-accent/30 dark:hover:bg-accent/40 flex items-center justify-center transition-colors">
                      <FacebookIcon size={20} />
                    </div>
                  </Link>
                  <Link
                    href="#"
                    className="text-white/80 hover:text-white transition-all duration-200 hover:scale-110 hover:-translate-y-1"
                    aria-label="Instagram"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/10 dark:bg-white/15 hover:bg-accent/30 dark:hover:bg-accent/40 flex items-center justify-center transition-colors">
                      <InstagramIcon size={20} />
                    </div>
                  </Link>
                  <Link
                    href="#"
                    className="text-white/80 hover:text-white transition-all duration-200 hover:scale-110 hover:-translate-y-1"
                    aria-label="Twitter"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/10 dark:bg-white/15 hover:bg-accent/30 dark:hover:bg-accent/40 flex items-center justify-center transition-colors">
                      <TwitterIcon size={20} />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-body-sm text-white/60">
            <p>
              &copy; {new Date().getFullYear()} Flight Booking. {t('allRightsReserved')}
            </p>
            <div className="flex gap-6 text-body-sm">
              <Link href="/sitemap" className="hover:text-white transition-colors">
                {t('sitemap')}
              </Link>
              <Link href="/accessibility" className="hover:text-white transition-colors">
                {t('accessibility')}
              </Link>
              <Link href="/cookie-settings" className="hover:text-white transition-colors">
                {t('cookieSettings')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
