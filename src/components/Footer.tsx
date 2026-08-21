import React from 'react';
import { MessageSquare, MapPin, Mail, Phone, Globe, Share2, ShieldCheck, Terminal, Cpu } from 'lucide-react';
import { NanuCloudLogo } from './NanuCloudLogo';
import { SystemSettings } from '../types';

interface FooterProps {
  settings?: SystemSettings | null;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  const companyName = settings?.companyName || 'NANUCLOUD';
  const address = settings?.companyAddress || 'Angola, Luanda, Viana, Capalanca';
  const email = settings?.companyEmail1 || settings?.supportEmail || 'suporte.simulador@nanucloud.com';
  const phone1 = settings?.companyPhone1 || '+244 929 462 681';
  const phone2 = settings?.companyPhone2 || '+244 954 269 353';
  const whatsapp1 = settings?.whatsappSupport1 || '244944935617';
  const whatsapp2 = settings?.whatsappSupport2 || '244944935618';
  const copyright = settings?.footerCopyrightText || '2026 NANUCLOUD | ALL RIGHTS RESERVED';

  // Check which social networks are defined
  const hasSocials = Boolean(
    settings?.socialFacebook ||
    settings?.socialInstagram ||
    settings?.socialLinkedIn ||
    settings?.socialTwitterX ||
    settings?.socialYouTube ||
    settings?.socialWhatsApp
  );

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 mt-auto">
      {/* Top Details & WhatsApp Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left border-b border-slate-800/80">
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <NanuCloudLogo className="h-7" isDarkTheme={true} customLogoUrl={settings?.companyLogoUrl} />
          </div>
          <span className="hidden sm:inline text-slate-700">|</span>
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{address}</span>
          </p>
          <span className="hidden sm:inline text-slate-700">|</span>
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>{email}</span>
          </p>
          <span className="hidden sm:inline text-slate-700">|</span>
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>{phone1} / {phone2}</span>
          </p>
        </div>

        {/* WhatsApp Support & Social Links */}
        <div className="flex flex-wrap items-center gap-2">
          {/* WhatsApp Direct Support buttons */}
          <a
            href={`https://wa.me/${whatsapp1.replace(/\D/g, '')}?text=Ola%2C%20preciso%20de%20ajuda%20com%20o%20Simulador%20Nanucloud`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 px-3 py-1 rounded-lg text-xs font-mono transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>+244 944 935 617</span>
          </a>
          <a
            href={`https://wa.me/${whatsapp2.replace(/\D/g, '')}?text=Ola%2C%20preciso%20de%20ajuda%20com%20o%20Simulador%20Nanucloud`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 px-3 py-1 rounded-lg text-xs font-mono transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>+244 944 935 618</span>
          </a>

          {/* Optional Social Buttons - Only shown if configured by Super Admin */}
          {settings?.socialFacebook && (
            <a
              href={settings.socialFacebook}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Facebook Oficial"
            >
              <span className="font-bold text-xs px-1">FB</span>
            </a>
          )}
          {settings?.socialInstagram && (
            <a
              href={settings.socialInstagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Instagram Oficial"
            >
              <span className="font-bold text-xs px-1">IG</span>
            </a>
          )}
          {settings?.socialLinkedIn && (
            <a
              href={settings.socialLinkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white border border-slate-700 transition"
              title="LinkedIn Oficial"
            >
              <span className="font-bold text-xs px-1">IN</span>
            </a>
          )}
          {settings?.socialTwitterX && (
            <a
              href={settings.socialTwitterX}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="X / Twitter Oficial"
            >
              <span className="font-bold text-xs px-1">X</span>
            </a>
          )}
        </div>
      </div>

      {/* Sleek Console Status Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <span>
            API STATUS: <span className="text-emerald-400 font-bold">OPERATIONAL</span>
          </span>
          <span>
            ENCRYPTION: <span className="text-emerald-400 font-bold">AES-256 / BCRYPT</span>
          </span>
          <span>
            SESSION TIMEOUT: <span className="text-slate-400">24H</span>
          </span>
          <span className="hidden md:inline">
            SYSTEM: <span className="text-emerald-400 font-bold">ONLINE & SECURE</span>
          </span>
        </div>
        <span>&copy; {copyright}</span>
      </div>
    </footer>
  );
};
