"use client";

import Image from "next/image";
import Logo from "@/public/logo.png";
import { useState } from "react";
import { Menu, X, ChevronDown, Moon, Settings } from "lucide-react";

function Navbar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="h-14 bg-amber-700 flex flex-row justify-between items-center box-border px-5 relative">
            {/* Logo */}
            <div id="logo">
                <Image
                    alt="Logo"
                    src={Logo}
                    className="w-11 h-11 rounded-full object-cover"
                />
            </div>

            {/* Mobile Menu Button */}
            <button
                className="md:hidden text-white focus:outline-none"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
            >
                {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <Menu className="w-6 h-6" />
                )}
            </button>

            {/* Desktop Navigation */}
            <div
                id="nav-menu"
                className="hidden md:flex h-full flex-row items-center gap-6"
            >
                <a
                    href="#"
                    className="text-white hover:text-amber-200 transition-colors"
                >
                    menu 1
                </a>
                <a
                    href="#"
                    className="text-white hover:text-amber-200 transition-colors"
                >
                    menu 2
                </a>
                <a
                    href="#"
                    className="text-white hover:text-amber-200 transition-colors"
                >
                    menu 3
                </a>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        id="profile"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex flex-row items-center gap-2 hover:bg-amber-600 px-3 py-2 rounded-lg transition-colors"
                    >
                        <Image
                            alt="Profile"
                            src={Logo}
                            className="w-9 h-9 rounded-full object-cover"
                        />
                        <div className="text-left">
                            <p className="text-white text-sm font-medium">
                                Rizki Febriansyah
                            </p>
                            <p className="text-amber-200 text-xs">rizki@mail.com</p>
                        </div>
                        <ChevronDown
                            className={`w-4 h-4 text-white transition-transform ${isDropdownOpen ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                            <a
                                href="#"
                                className="block px-4 py-2 text-gray-700 hover:bg-amber-50 transition-colors"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                <span className="flex items-center gap-2">
                                    <Moon className="w-5 h-5" />
                                    Atur Mode
                                </span>
                            </a>

                            <a
                                href="#"
                                className="block px-4 py-2 text-gray-700 hover:bg-amber-50 transition-colors"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                <span className="flex items-center gap-2">
                                    <Settings className="w-5 h-5" />
                                    Setting Akun
                                </span>
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-14 left-0 right-0 bg-white md:hidden shadow-xl z-40 border-t border-gray-200">
                    <div className="flex flex-col max-h-[calc(100vh-3.5rem)] overflow-y-auto">
                        {/* Profile Section */}
                        <div className="px-4 py-4 bg-amber-50">
                            <div className="flex items-center gap-3 px-3 py-2">
                                <Image
                                    alt="Profile"
                                    src={Logo}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-200"
                                />
                                <div className="flex-1">
                                    <p className="text-gray-900 text-sm font-semibold">
                                        Rizki Febriansyah
                                    </p>
                                    <p className="text-gray-600 text-xs">rizki@mail.com</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="px-4 py-3 space-y-1">
                            <a
                                href="#"
                                className="block px-4 py-3 text-gray-700 hover:bg-amber-50 rounded-lg transition-colors font-medium"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Menu 1
                            </a>
                            <a
                                href="#"
                                className="block px-4 py-3 text-gray-700 hover:bg-amber-50 rounded-lg transition-colors font-medium"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Menu 2
                            </a>
                            <a
                                href="#"
                                className="block px-4 py-3 text-gray-700 hover:bg-amber-50 rounded-lg transition-colors font-medium"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Menu 3
                            </a>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200"></div>

                        {/* Divider */}
                        <div className="border-t border-gray-200"></div>

                        {/* Settings Links */}
                        <div className="px-4 py-3 space-y-1">
                            <a
                                href="#"
                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-amber-50 rounded-lg transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Moon className="w-5 h-5 text-amber-600" />
                                <span className="font-medium">Atur Mode</span>
                            </a>
                            <a
                                href="#"
                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-amber-50 rounded-lg transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Settings className="w-5 h-5 text-amber-600" />
                                <span className="font-medium">Setting Akun</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;
