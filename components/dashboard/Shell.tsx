'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ShellProps {
    children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
    const pathname = usePathname();

    const navItems = [
        { label: 'Diagnosis', icon: 'medical_services', href: '/dashboard' },
        { label: 'Signals', icon: 'sensors', href: '/dashboard/signals' },
        { label: 'Questions', icon: 'question_answer', href: '/dashboard/questions' },
        { label: 'History', icon: 'history', href: '/dashboard/history' },
        { label: 'Telemetry', icon: 'query_stats', href: '/dashboard/telemetry' },
    ];

    return (
        <div className="bg-background-light dark:bg-[#0A0F1D] text-slate-900 dark:text-slate-100 min-h-screen pb-24 font-sans antialiased transition-colors duration-300">
            {/* Dynamic Header */}
            <header className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center bg-background-light/80 dark:bg-[#0A0F1D]/80 backdrop-blur-md border-b border-transparent dark:border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#FF5C35] rounded-lg flex items-center justify-center">
                        <span className="material-icons-round text-white text-xl">shield</span>
                    </div>
                    <h1 className="font-extrabold text-xl tracking-tight">SmartDash</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#161D2F] flex items-center justify-center transition-colors">
                        <span className="material-icons-round text-slate-600 dark:text-slate-400">notifications</span>
                    </button>
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#161D2F] flex items-center justify-center border border-white/10 overflow-hidden">
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIUU1fp5Gsp8g5mZUf_g9BmCneBjHC_umn6VZBMstfHdqV8ey6UWsksJtTFS02IUSIdbwDGXW93N_MZ6A-G3VNu_VhW9YqBgnP1QOenpQbLprmDrli4s0wVwx5mjlh-5XMQQBHMsDyT1rPk9pzv06z2m6UMLGG3Gf-D10Tsv_2K27hCtsqju35mMAK5SskL7HS3PNqrebCZQnyWf9NnykmQkqrb5dHr4CGsIxQda_iJIddxug0LABLGDjGD8-6WGoxriAMx-ts2F0C"
                            alt="User"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto transition-all duration-500">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 px-6 py-4 bg-white/95 dark:bg-[#161D2F]/95 backdrop-blur-xl border-t border-slate-100 dark:border-white/5 flex justify-between items-center z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-[#FF5C35] scale-110' : 'text-slate-400 hover:text-slate-500'}`}
                        >
                            <span className={`material-icons-round ${isActive ? 'filled' : 'outlined'}`}>{item.icon}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                            {isActive && <div className="w-1 h-1 rounded-full bg-[#FF5C35] mt-0.5" />}
                        </Link>
                    );
                })}
            </nav>

            {/* External CSS for Material Icons */}
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
        </div>
    );
};
