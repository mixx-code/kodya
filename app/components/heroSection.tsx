"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDarkMode } from "../contexts/DarkModeContext";

interface CarouselItem {
  id: number;
  title: string;
  description: string;
  price: string;
  image: string;
  bgColor: string;
}

function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    setMounted(true);
  }, []);

  const items: CarouselItem[] = [
    {
      id: 1,
      title: "Website Premium",
      description: "Template website profesional lengkap",
      price: "Rp 50.000",
      image: "/product-1.jpg", // Ganti dengan path gambar kamu
      bgColor: "bg-gradient-to-r from-blue-500 to-purple-600",
    },
    {
      id: 2,
      title: "Aplikasi Mobile Premium",
      description: "Aplikasi mobile modern dengan fitur lengkap",
      price: "Rp 500.000",
      image: "/product-2.jpg", // Ganti dengan path gambar kamu
      bgColor: "bg-gradient-to-r from-purple-500 to-pink-600",
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto play
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [mounted]);

  return (
    <div className="relative w-full h-[350px] md:h-[500px] rounded-xl md:rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--card-background)', boxShadow: 'var(--card-shadow)' }}>
      {/* Carousel Items */}
      <div
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={`min-w-full h-full ${item.bgColor} flex items-center justify-center relative`}
          >
            <div className="w-full px-4 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 max-w-7xl mx-auto">
              {/* Text Content */}
              <div className="max-w-lg space-y-2 md:space-y-4 text-center md:text-left z-10">
                <h2 className="text-2xl md:text-5xl font-bold leading-tight text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)', color: 'var(--text-primary)' }}>
                  {item.title}
                </h2>
                <p className="text-sm md:text-xl opacity-90 line-clamp-2 md:line-clamp-none text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)', color: 'var(--text-secondary)' }}>
                  {item.description}
                </p>
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 justify-center md:justify-start pt-2">
                  <p className="text-xl md:text-3xl font-bold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)', color: 'var(--text-primary)' }}>  <span className="font-semibold italic text-white/80">Mulai dari </span>{item.price}</p>

                </div>
              </div>

              {/* Product Image/Screenshot */}
              <div className="relative w-full md:w-[500px] h-[140px] md:h-[350px] flex-shrink-0">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-lg md:rounded-xl overflow-hidden shadow-2xl border border-white/20">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover object-top"
                    priority={currentIndex === item.id - 1}
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-product.jpg";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons - Hidden on mobile */}
      {mounted && (
        <>
          <button
            onClick={prevSlide}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm p-2 rounded-full transition items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={nextSlide}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm p-2 rounded-full transition items-center justify-center"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {mounted && (
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 md:h-3 rounded-full transition-all ${index === currentIndex
                  ? "bg-white w-6 md:w-8"
                  : "bg-white/50 hover:bg-white/75 w-2 md:w-3"
                }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default HeroSection;
