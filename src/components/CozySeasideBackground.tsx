/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from "react";

export default function CozySeasideBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" id="cozy-seaside-bg">
      {/* 1. OBSTETRICS & MIDWIFERY INFANT PASTEL SUNSET SKY */}
      <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-[#FFF0F5] via-[#E2F1F8] to-[#EEF5F8]" />

      {/* 2. THE DISTANT COZY OCEAN (Soft turquoise-lavender water with hand-drawn wave feel) */}
      <div className="absolute inset-x-0 top-[45%] h-[20%] bg-[#8ABECD] border-t border-b border-[#72A6B5]/30 overflow-hidden">
        {/* Subtle wavy hand-drawn pencil lines in the water */}
        <div className="absolute inset-0 opacity-40">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="sea-waves" width="200" height="24" patternUnits="userSpaceOnUse">
                <path d="M 0 10 Q 50 15 100 10 T 200 10" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3,3" />
                <path d="M 50 20 Q 100 25 150 20 T 250 20" fill="none" stroke="#5293A6" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sea-waves)" />
          </svg>
        </div>
      </div>

      {/* 3. LAND / ROAD / CLINICAL PASS (Soft warm-beige sand / smooth health road look) */}
      <div className="absolute inset-x-0 top-[65%] bottom-0 bg-[#FAF7ED] border-t-2 border-[#EADFCB]" />

      {/* 4. HAND-DRAWN SPECIFIC DETAILS (Seaside Barrier, Crossing barriers, ECG Wave, Traffic mirror) */}
      <div className="absolute inset-x-0 top-[65%] h-full">
        <svg width="100%" height="100%" className="absolute inset-0" xmlns="http://www.w3.org/2000/svg">
          {/* Concrete barrier block dividing road & sea */}
          <line x1="0" y1="0" x2="3000" y2="0" stroke="#DDD4BD" strokeWidth="6" />

          {/* FETAL HEART RATE (FHR) ECG MOTIF - Subtle wave signifying Obstetric Nursing / Midwifery 01 */}
          <g transform="translate(0, -10)">
            <path d="M 0 15 L 220 15 L 230 5 L 235 32 L 243 -12 L 249 20 L 255 15 L 450 15 L 460 5 L 465 32 L 473 -12 L 479 20 L 485 15 L 750 15 L 760 5 L 765 32 L 773 -12 L 779 20 L 785 15 L 1150 15 L 1160 5 L 1165 32 L 1173 -12 L 1179 20 L 1185 15 L 1400 15 L 1410 5 L 1415 32 L 1423 -12 L 1429 20 L 1435 15 L 2000 15" fill="none" stroke="#F1A28A" strokeWidth="2.5" strokeDasharray="3,3" opacity="0.45" />
          </g>
          
          {/* Guard Rail Posts along coast */}
          <g stroke="#C6BBA3" strokeWidth="3" fill="none">
            {/* Loop-like placement of guard rail posts at regular intervals */}
            <line x1="100" y1="0" x2="100" y2="28" />
            <line x1="300" y1="0" x2="300" y2="28" />
            <line x1="500" y1="0" x2="500" y2="28" />
            <line x1="700" y1="0" x2="700" y2="28" />
            <line x1="900" y1="0" x2="900" y2="28" />
            <line x1="1100" y1="0" x2="1100" y2="28" />
            <line x1="1300" y1="0" x2="1300" y2="28" />
            <line x1="1500" y1="0" x2="1500" y2="28" />
            <line x1="1700" y1="0" x2="1700" y2="28" />
            <line x1="1900" y1="0" x2="1900" y2="28" />
            <line x1="2100" y1="0" x2="2100" y2="28" />
            <line x1="2300" y1="0" x2="2300" y2="28" />
          </g>

          {/* Rope/cable guard rail swagging between posts */}
          <path d="M 0 6 Q 50 14 100 6 Q 200 14 300 6 Q 400 14 500 6 Q 600 14 700 6 Q 800 14 900 6 Q 1000 14 1100 6 Q 1200 14 1300 6 Q 1400 14 1500 6 Q 1600 14 1700 6 Q 1800 14 1900 6 Q 2000 14 2100 6 Q 2200 14 2300 6" fill="none" stroke="#C6BBA3" strokeWidth="2.5" strokeDasharray="1,1" />

          {/* Road Crosswalk Markings (Cream chalk strokes) */}
          <g fill="#FFFFFF" fillOpacity="0.45">
            <rect x="250" y="60" width="100" height="28" rx="4" transform="skewX(-25)" />
            <rect x="380" y="60" width="100" height="28" rx="4" transform="skewX(-25)" />
            <rect x="510" y="60" width="100" height="28" rx="4" transform="skewX(-25)" />
            <rect x="640" y="60" width="100" height="28" rx="4" transform="skewX(-25)" />
            <rect x="770" y="60" width="100" height="28" rx="4" transform="skewX(-25)" />
            <rect x="900" y="60" width="100" height="28" rx="4" transform="skewX(-25)" />
          </g>

          {/* Hand-drawn Railway poles/warnings decoration on the left side */}
          <g id="railway-accessories" transform="translate(140, -100)">
            {/* Wooden Railroad Warning Post */}
            <path d="M 40 100 L 40 280" stroke="#5E6360" strokeWidth="7" strokeLinecap="round" />
            <circle cx="40" cy="115" r="14" fill="#ED7E63" stroke="#F9F5E6" strokeWidth="2.5" />
            <circle cx="40" cy="115" r="5" fill="#3D403E" />
            
            {/* Yellow and Black striped Crossing Sign (X) */}
            <g stroke="#3D403E" strokeWidth="4" strokeLinecap="round">
              <line x1="18" y1="140" x2="62" y2="180" stroke="#F1D175" strokeWidth="12" />
              <line x1="18" y1="140" x2="62" y2="180" />
              
              <line x1="62" y1="140" x2="18" y2="180" stroke="#F1D175" strokeWidth="12" />
              <line x1="62" y1="140" x2="18" y2="180" />
            </g>
            <path d="M 28 150 L 52 170 M 52 150 L 28 170" stroke="#3D403E" strokeWidth="2" />
          </g>

          {/* Traffic Curved Mirror (Right side) */}
          <g id="traffic-mirror" transform="translate(1120, -110)">
            <path d="M 30 110 L 30 280" stroke="#C55848" strokeWidth="6" strokeLinecap="round" />
            {/* Mirror Frame */}
            <circle cx="30" cy="110" r="28" fill="#D36050" stroke="#3D403E" strokeWidth="3.5" />
            {/* Inner Shiny Mirror Canvas */}
            <circle cx="30" cy="110" r="22" fill="#E4ECEF" />
            {/* Reflective shine lines */}
            <path d="M 20 100 Q 35 90 44 114" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            <path d="M 14 114 Q 24 124 34 126" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2,2" />
            {/* Mirror pole connector */}
            <path d="M 26 135 Q 30 142 34 135" fill="none" stroke="#3D403E" strokeWidth="3" />
          </g>
        </svg>
      </div>

      {/* 5. FLOATING ANIMATION EXTRAVAGANZA */}
      {/* Slow Moving Warm Clouds */}
      <div className="absolute top-[8%] left-[10%] opacity-70 animate-[floatCloud_85s_linear_infinite]">
        <svg width="210" height="100" viewBox="0 0 210 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 50 70 A 30 30 0 0 1 110 70 A 40 40 0 0 1 180 70 A 25 25 0 0 1 180 80 L 50 80 Z" fill="#FFFFFF" fillOpacity="0.85" />
          <path d="M 45 70 C 45 55 60 45 75 45 C 80 45 87 47 92 50 C 98 40 115 35 128 42 C 140 30 168 32 175 48 C 185 49 194 56 195 68 C 196 76 190 82 180 82 L 45 82 Z" fill="#FFFBF2" fillOpacity="0.9" />
        </svg>
      </div>

      {/* Stethoscope shaped cozy cloud on the right to match nursing content */}
      <div className="absolute top-[18%] left-[60%] opacity-60 animate-[floatCloud_125s_linear_infinite_reverse]">
        <svg width="150" height="80" viewBox="0 0 150 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 30 50 C 30 40 40 32 50 32 C 55 23 70 20 80 25 C 90 18 108 20 112 32 C 120 32 128 38 128 48 C 128 54 122 58 115 58 L 30 58 Z" fill="#FFFFFF" fillOpacity="0.9" />
          {/* Subtle stethoscope heart connection outline */}
          <path d="M 50 55 Q 60 70 70 55" stroke="#F1A28A" strokeWidth="2.5" fill="none" opacity="0.5" />
        </svg>
      </div>

      {/* 6. COZY MIDWIFE SYMBOL: Gentle Stork flying high in the sky, carrying a small bundle of joy */}
      <div className="absolute top-[5%] left-[45%] opacity-75 animate-[storkFlight_55s_linear_infinite]">
        <svg width="84" height="42" viewBox="0 0 84 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Stork Body Accent */}
          <path d="M 22 21 Q 40 12 58 21 Q 40 24 22 21" fill="#FFFDF9" stroke="#9BB2B8" strokeWidth="1" />
          {/* Beak & long head */}
          <path d="M 58 21 L 68 18 L 74 19 L 66 23 Z" fill="#F1A28A" />
          {/* Large graceful wings (Hand-drawn flutter animation) */}
          <path className="animate-[wingFlutter_1.2s_ease-in-out_infinite]" d="M 38 20 Q 32 -4 20 6 Q 30 10 38 20 Q 42 36 34 30" fill="#FFFDF9" stroke="#3D403E" strokeWidth="1" />
          <path className="animate-[wingFlutter_1.2s_ease-in-out_infinite_delay-150]" d="M 42 20 Q 46 -6 56 4 Q 48 8 42 20" fill="#EAEBF0" stroke="#9BB2B8" strokeWidth="1" />
          {/* The Bundle of Joy (Midwifery classic symbol) hanging from the beak */}
          <path d="M 64 21 L 58 35 L 53 32 Z" stroke="#F1A28A" strokeWidth="1" fill="#F2C2B8" />
          {/* Beautiful round baby sling */}
          <circle cx="53" cy="33" r="6" fill="#FAD1C9" stroke="#E59987" strokeWidth="1" />
        </svg>
      </div>

      {/* 7. AMBULATORY / FAMILY MATERNAL CAR (The lovely yellow bunny car) */}
      {/* Restructured with independent shadow and active wheel rotation suspension to fix floating/incomplete wheel graphics */}
      <div className="absolute top-[calc(65%+30px)] left-0 w-[140px] h-[85px] animate-[carTravel_38s_linear_infinite]" id="maternal-bunny-car">
        
        {/* Shadow (Placed flat on ground, scales slightly when body bounces but never floats off the road!) */}
        <div className="absolute inset-0 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 140 85">
            <ellipse cx="68" cy="76" rx="55" ry="5.5" fill="#DDD4BD" fillOpacity="0.8" className="animate-[shadowPulse_0.8s_ease-in-out_infinite]" style={{ transformOrigin: "68px 76px" }} />
          </svg>
        </div>

        <svg width="100%" height="100%" viewBox="0 0 140 85" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
          
          {/* A. BACKGROUND WHEELS (Other side, layered behind body to represent a complete 3D axle) */}
          <g transform="translate(42, 60)">
            <g className="animate-[wheelSpin_1.8s_linear_infinite]" style={{ transformOrigin: "0px 0px" }}>
              <circle cx="0" cy="0" r="14.5" fill="#3D403E" />
              <circle cx="0" cy="0" r="5" fill="#A19985" />
              <line x1="-12" y1="0" x2="12" y2="0" stroke="#2D2E2F" strokeWidth="1.5" />
              <line x1="0" y1="-12" x2="0" y2="12" stroke="#2D2E2F" strokeWidth="1.5" />
            </g>
          </g>
          <g transform="translate(108, 60)">
            <g className="animate-[wheelSpin_1.8s_linear_infinite]" style={{ transformOrigin: "0px 0px" }}>
              <circle cx="0" cy="0" r="14.5" fill="#3D403E" />
              <circle cx="0" cy="0" r="5" fill="#A19985" />
              <line x1="-12" y1="0" x2="12" y2="0" stroke="#2D2E2F" strokeWidth="1.5" />
              <line x1="0" y1="-12" x2="0" y2="12" stroke="#2D2E2F" strokeWidth="1.5" />
            </g>
          </g>

          {/* B. BOUNCING CHASSIS (Yellow cute cartoon Ghibli body, bouncing gently on soft suspension) */}
          <g className="animate-[carBounce_0.8s_ease-in-out_infinite]" style={{ transformOrigin: "68px 62px" }}>
            {/* Yellow Rounded Ghibli Style Car Body */}
            <path d="M 20 62 L 122 62 C 128 62 132 58 132 52 L 132 40 C 132 30 120 28 114 26 C 105 23 88 18 64 18 C 36 18 20 28 14 36 L 10 46 C 8 50 12 62 20 62 Z" fill="#F1DC83" stroke="#3D403E" strokeWidth="3.5" />
            
            {/* Soft Cream Accent Panel */}
            <path d="M 24 55 L 118 55 C 122 55 125 52 125 48 L 125 42 C 125 36 116 34 110 32 C 100 29 84 25 64 25 C 40 25 24 33 21 40 L 18 46 C 17 48 20 55 24 55 Z" fill="#FFF9DF" fillOpacity="0.5" />

            {/* Cute Red Nurse/Medwifery Cross Decal on the side doors */}
            <path d="M 72 38 H 82 V 44 H 72 Z M 75 35 H 79 V 47 H 75 Z" fill="#ED7E63" stroke="#3D403E" strokeWidth="1.2" />

            {/* Windows */}
            {/* Front Window */}
            <path d="M 26 40 Q 35 30 52 30 L 52 44 L 22 44 Z" fill="#FFFFFF" stroke="#3D403E" strokeWidth="3" />
            {/* Back Window */}
            <path d="M 58 30 L 102 30 C 108 30 114 36 114 44 L 58 44 Z" fill="#FFFFFF" stroke="#3D403E" strokeWidth="3" />

            {/* CUTE DRIVERS: Two white bunnies looking out of windows */}
            {/* Bunny 1 (Driver) */}
            <g transform="translate(32, 24)">
              {/* Ears */}
              <ellipse cx="6" cy="-2" rx="2" ry="7" fill="#FFFFFF" stroke="#3D403E" strokeWidth="2" />
              <ellipse cx="11" cy="-2" rx="2" ry="7" fill="#FFFFFF" stroke="#3D403E" strokeWidth="2" />
              <ellipse cx="6" cy="-2" rx="1" ry="4" fill="#FAD1C9" />
              <ellipse cx="11" cy="-2" rx="1" ry="4" fill="#FAD1C9" />
              {/* Face */}
              <circle cx="8" cy="8" r="7" fill="#FFFFFF" stroke="#3D403E" strokeWidth="2" />
              {/* Eyes */}
              <circle cx="6" cy="7" r="1" fill="#3D403E" />
              <circle cx="10" cy="7" r="1" fill="#3D403E" />
              {/* Blush */}
              <circle cx="4" cy="9" r="1.2" fill="#FAD1C9" />
              <circle cx="12" cy="9" r="1.2" fill="#FAD1C9" />
            </g>

            {/* Bunny 2 (Passenger) */}
            <g transform="translate(68, 24)">
              {/* Ears */}
              <ellipse cx="12" cy="-4" rx="2.2" ry="7" fill="#FFFFFF" stroke="#3D403E" strokeWidth="2" transform="rotate(8)" />
              <ellipse cx="17" cy="-3" rx="2.2" ry="7" fill="#FFFFFF" stroke="#3D403E" strokeWidth="2" transform="rotate(12)" />
              {/* Face */}
              <circle cx="14" cy="7" r="7" fill="#FFFFFF" stroke="#3D403E" strokeWidth="2" />
              <circle cx="12" cy="7" r="1.1" fill="#3D403E" />
              <circle cx="16" cy="7" r="1.1" fill="#3D403E" />
              <circle cx="11" cy="9" r="1.2" fill="#F2C2B8" />
              <circle cx="17" cy="9" r="1.2" fill="#F2C2B8" />
            </g>

            {/* Front headlight bumper */}
            <rect x="6" y="47" width="8" height="6" rx="3" fill="#FFF2AC" stroke="#3D403E" strokeWidth="2.5" />
            {/* Back tail-burner bumper */}
            <rect x="128" y="49" width="6" height="5" rx="2.5" fill="#ED7E63" stroke="#3D403E" strokeWidth="2" />
          </g>

          {/* C. FOREGROUND WHEELS (Foreground side, stay flat, roll perfectly without lifting from shadow/road) */}
          <g transform="translate(34, 62)">
            <g className="animate-[wheelSpin_1.8s_linear_infinite]" style={{ transformOrigin: "0px 0px" }}>
              <circle cx="0" cy="0" r="14.5" fill="#5F6366" stroke="#3D403E" strokeWidth="3.5" />
              <circle cx="0" cy="0" r="6" fill="#FFFBF0" stroke="#3D403E" strokeWidth="2.5" />
              {/* Multi-spoke pattern */}
              <line x1="-14" y1="0" x2="14" y2="0" stroke="#3D403E" strokeWidth="1.5" />
              <line x1="0" y1="-14" x2="0" y2="14" stroke="#3D403E" strokeWidth="1.5" />
              <line x1="-10" y1="-10" x2="10" y2="10" stroke="#3D403E" strokeWidth="1" />
              <line x1="10" y1="-10" x2="-10" y2="10" stroke="#3D403E" strokeWidth="1" />
            </g>
          </g>
          <g transform="translate(100, 62)">
            <g className="animate-[wheelSpin_1.8s_linear_infinite]" style={{ transformOrigin: "0px 0px" }}>
              <circle cx="0" cy="0" r="14.5" fill="#5F6366" stroke="#3D403E" strokeWidth="3.5" />
              <circle cx="0" cy="0" r="6" fill="#FFFBF0" stroke="#3D403E" strokeWidth="2.5" />
              {/* Multi-spoke pattern */}
              <line x1="-14" y1="0" x2="14" y2="0" stroke="#3D403E" strokeWidth="1.5" />
              <line x1="0" y1="-14" x2="0" y2="14" stroke="#3D403E" strokeWidth="1.5" />
              <line x1="-10" y1="-10" x2="10" y2="10" stroke="#3D403E" strokeWidth="1" />
              <line x1="10" y1="-10" x2="-10" y2="10" stroke="#3D403E" strokeWidth="1" />
            </g>
          </g>

        </svg>
      </div>

      <style>{`
        @keyframes floatCloud {
          0% { transform: translateX(-220px); }
          100% { transform: translateX(calc(100vw + 220px)); }
        }
        @keyframes storkFlight {
          0% { transform: translate(110vw, 0px) scaleX(-1); }
          50% { transform: translate(50vw, 15px) scaleX(-1); }
          100% { transform: translate(-120px, -10px) scaleX(-1); }
        }
        @keyframes wingFlutter {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-24deg) translateY(-2px); }
        }
        @keyframes carTravel {
          0% { transform: translateX(-160px); }
          100% { transform: translateX(calc(100vw + 160px)); }
        }
        @keyframes carBounce {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-3.5px) rotate(1.4deg); }
        }
        @keyframes wheelSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes shadowPulse {
          0%, 100% { transform: scaleX(1); opacity: 0.8; }
          50% { transform: scaleX(0.94); opacity: 0.65; }
        }
      `}</style>
    </div>
  );
}
