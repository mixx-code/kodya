"use client";

import Lottie from "lottie-react";
import animationData from "@/public/lottie/404.json";

export default function LottieNotFound() {
  return (
    <div className="w-[40%]  md:w-[40%]  mb-6">
      <Lottie 
        animationData={animationData} 
        loop={true} 
      />
    </div>
  );
}