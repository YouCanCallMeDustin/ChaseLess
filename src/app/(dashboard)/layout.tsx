"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, FileText, Settings, LogOut, Menu, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigation = [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Invoices", href: "/invoices", icon: FileText },
        { name: "Clients", href: "/clients", icon: Users },
        { name: "Templates", href: "/settings/templates", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-white border-b px-4 py-4 flex items-center justify-between">
                <div className="font-bold text-xl text-blue-700">ChaseLess.</div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-500">
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Sidebar */}
            <div className={`${isMobileMenuOpen ? "block" : "hidden"} md:block w-full md:w-64 bg-white border-r min-h-screen flex flex-col absolute md:relative z-10`}>
                <div className="hidden md:flex h-16 items-center px-6 border-b">
                    <div className="font-bold text-2xl text-blue-700">ChaseLess.</div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition ${isActive
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? "text-blue-700" : "text-slate-400"}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t">
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center w-full gap-3 px-3 py-2.5 rounded-md font-medium text-slate-600 hover:bg-slate-50 hover:text-red-600 transition"
                    >
                        <LogOut className="w-5 h-5 text-slate-400" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
                {children}
            </main>
        </div>
    );
}
