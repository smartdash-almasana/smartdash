import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, MessageCircle, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Producto',
      links: [
        { label: 'Características', href: '#alerts' },
        { label: 'Planes y Precios', href: '#pricing' },
        { label: 'Diagnóstico Gratuito', href: '#wizard' },
        { label: 'Integraciones', href: '#' },
      ],
    },
    {
      title: 'Empresa',
      links: [
        { label: 'Sobre Nosotros', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Carreras', href: '#' },
        { label: 'Prensa', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Términos de Servicio', href: '#' },
        { label: 'Política de Privacidad', href: '#' },
        { label: 'Política de Cookies', href: '#' },
        { label: 'Cumplimiento GDPR', href: '#' },
      ],
    },
    {
      title: 'Soporte',
      links: [
        { label: 'Centro de Ayuda', href: '#' },
        { label: 'Documentación', href: '#' },
        { label: 'Estado del Sistema', href: '#' },
        { label: 'Contactar', href: '#' },
      ],
    },
  ];

  const integrations = [
    { name: 'Mercado Libre', icon: '🛒' },
    { name: 'Tango', icon: '📊' },
    { name: 'Excel', icon: '📈' },
    { name: 'AFIP', icon: '🏛️' },
    { name: 'YouTube', icon: '▶️' },
    { name: 'TikTok', icon: '🎵' },
  ];

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: MessageCircle, href: '#', label: 'WhatsApp' },
  ];

  return (
    <footer className="bg-[#002D5E] border-t border-[#FF5733]/30 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Logo y Descripción */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {/* Asumiendo que tenés una versión blanca del logo, si no, se puede usar filtro o el mismo si contrasta */}
              <div className="bg-white/10 p-1 rounded-lg">
                <Image
                  src="/cerebrain.jpg"
                  alt="SmartDash Logo"
                  width={64}
                  height={64}
                  className=""
                />
              </div>
              <span className="text-lg font-bold tracking-tighter text-white">SMARTDASH</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              El Motor de Prevención de Riesgos que protege tu capital y te da tranquilidad estratégica.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-300 text-sm">
                <Mail className="h-4 w-4 text-[#FF5733]" />
                <a href="mailto:hola@smartdash.io" className="hover:text-white transition-colors">
                  hola@smartdash.io
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-300 text-sm">
                <MessageCircle className="h-4 w-4 text-[#FF5733]" />
                <a href="https://wa.me/5491122334455" className="hover:text-white transition-colors">
                  +54 9 11 2233-4455
                </a>
              </div>
            </div>
          </div>

          {/* Secciones de Enlaces */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider border-b border-white/10 pb-2 inline-block">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-[#FF5733] transition-colors text-sm font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Sección de Integraciones */}
        <div className="border-t border-white/10 pt-12 mb-12">
          <h3 className="font-semibold text-white mb-6 text-sm uppercase tracking-wider text-center md:text-left">
            Integraciones Nativas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="flex items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#FF5733] hover:bg-white/10 transition-all group cursor-default"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2 grayscale group-hover:grayscale-0 transition-all filter brightness-200 contrast-100">{integration.icon}</div>
                  <p className="text-xs text-slate-300 font-medium group-hover:text-white">{integration.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sección Inferior */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
            {/* Redes Sociales */}
            <div className="flex items-center gap-4">
              <p className="text-slate-400 text-sm hidden md:block">Síguenos:</p>
              <div className="flex gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#FF5733] hover:border-[#FF5733] hover:text-white text-slate-400 transition-all group"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Info de Empresa */}
            <div className="text-center md:text-right text-slate-400 text-sm space-y-1">
              <p className="font-semibold text-white">SmartDash Risk Engine © {currentYear}</p>
              <p>Todos los derechos reservados</p>
            </div>
          </div>

          {/* Copyright y Cumplimiento */}
          <div className="border-t border-white/5 pt-8 text-center text-slate-500 text-xs space-y-2">
            <p>
              SmartDash es una plataforma de análisis de riesgos operativos. Hecho con ❤️ en Argentina.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}