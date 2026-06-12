/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { GraduationCap, Award, BarChart3, ShieldAlert, CheckCircle2 } from "lucide-react";

interface LandingPageProps {
  onSelectRole: (role: "student" | "teacher") => void;
}

export default function LandingPage({ onSelectRole }: LandingPageProps) {
  return (
    <div className="bg-transparent min-h-screen flex flex-col justify-between" id="landing-container">
      {/* Top Header */}
      <header className="bg-white/75 backdrop-blur-md border-b border-slate-200/30 py-4 px-6 sticky top-0 z-10" id="landing-header">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl border border-teal-100">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="font-bold text-xl text-slate-800 tracking-tight block">Ready RN 01</span>
              <span className="text-xs text-slate-500 font-medium tracking-wide">การพยาบาลและการผดุงครรภ์ 01</span>
            </div>
          </div>
          <div className="text-xs bg-slate-100 text-slate-600 py-1.5 px-3 rounded-full font-mono md:block hidden">
            Clinical Readiness Prep v1.0
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 justify-center flex flex-col" id="landing-hero">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-teal-50 text-teal-700 px-3.5 py-1.5 rounded-full text-sm font-medium border border-teal-100 mx-auto lg:mx-0">
              <Award className="h-4 w-4" />
              <span>เตรียมพร้อมสู่ใบประกอบวิชาชีพอย่างมั่นใจ</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              Ready RN 01
              <span className="block text-2xl sm:text-3xl font-semibold text-teal-600 mt-2">
                ระบบทบทวนความรู้วิชา 01 การผดุงครรภ์
              </span>
            </h1>
            
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              สำหรับนักศึกษาพยาบาล ในการฝึกทำแบบฝึกหัดการผดุงครรภ์ วิเคราะห์ความรู้หัวข้ออย่างเจาะลึก และติดตามพัฒนาการตลอดระยะเวลาการเตรียมสอบสภาการพยาบาล
            </p>

            {/* CTA Button Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                id="btn-login-student"
                onClick={() => onSelectRole("student")}
                className="w-full sm:w-auto px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 flex items-center justify-center space-x-2 text-base cursor-pointer"
              >
                <span>เข้าสู่ระบบนักศึกษา</span>
                <span className="bg-teal-500 text-teal-100 text-xs px-2 py-0.5 rounded-md font-normal">Student</span>
              </button>
              
              <button
                id="btn-login-teacher"
                onClick={() => onSelectRole("teacher")}
                className="w-full sm:w-auto px-8 py-4 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 flex items-center justify-center space-x-2 text-base cursor-pointer"
              >
                <span>เข้าสู่ระบบอาจารย์</span>
                <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-md font-normal">Teacher</span>
              </button>
            </div>

            {/* Compliance Note */}
            <div className="text-xs text-slate-400 border-t border-slate-200/60 pt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center lg:justify-start">
              <span>✓ พัฒนาภายใต้สถาบันการพยาบาล</span>
              <span>✓ Firebase Spark & Auth Ready</span>
              <span>✓ ลิขสิทธิ์วิชาการ 01 การผดุงครรภ์</span>
            </div>
          </div>

          {/* Hero Right Content - CSS Illustration of Midwifery Concept */}
          <div className="lg:col-span-5 flex justify-center" id="landing-illustration">
            <div className="relative w-full max-w-sm bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-xl shadow-slate-200/30">
              
              {/* Card Header Header Mock */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-teal-400"></div>
                </div>
                <span className="text-xs text-slate-400 font-mono">Exam Engine Preview</span>
              </div>

              {/* Patient Scenario Card Simulation */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-red-600 block mb-1">✓ เคสจำลองสถานการณ์สูติศาสตร์</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    &quot;หญิงตั้งครรภ์ครรภ์หลัง G2P1 อายุครรภ์ 39 สัปดาห์ เจ็บครรภ์คลอด ปากมดลูกเปิด 4 ซม. ความแรงหดรัดตัว Interval 3 นาที Duration 40 วินาที...&quot;
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs bg-teal-50 border border-teal-100 text-teal-800 p-2.5 rounded-lg flex items-center space-x-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                    <span>A: บันทึกความก้าวหน้าและการพยาบาลบน Partograph</span>
                  </div>
                  <div className="text-xs bg-slate-50 border border-slate-100 text-slate-600 p-2.5 rounded-lg flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center font-mono text-[10px] shrink-0">B</div>
                    <span>B: เตรียมสวนปัสสาวะและเร่งคลอดทันที</span>
                  </div>
                </div>

                {/* Score breakdown visualization mock */}
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">การวิเคราะห์ความพึงใจในกลุ่มวิชาการ</span>
                    <span className="font-mono text-teal-600 font-bold">85%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-500 h-full rounded-full" style={{ width: "85%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Features Highlights Section */}
      <section className="bg-white/45 backdrop-blur-md border-t border-slate-200/20 py-12 md:py-16" id="landing-features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              จุดเด่นหลักในการช่วยคุณพิชิตสอบสภาการพยาบาล
            </h2>
            <p className="text-slate-600 font-medium text-sm sm:text-base mt-2">
              กระบวนการเรียนรู้และทบทวนเพื่อเตรียมความพร้อมในรายวิชา 01 การผดุงครรภ์โดยเฉพาะ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white/85 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/40 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-50/50 transition-all duration-200">
              <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center mb-5 font-bold shadow-sm shadow-teal-100">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">
                1. ฝึกทำข้อสอบสถานการณ์ทางคลินิก
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                จำลองข้อสอบแบบตัวเลือกตอบ (Multiple Choice) อ้างอิงตาม Blue Print ของสภาการพยาบาล เน้นการแก้ไขภาวะฉุกเฉิน มิติมารดาและทารกในครรภ์
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/85 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/40 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-50/50 transition-all duration-200">
              <div className="w-12 h-12 bg-sky-100 text-sky-700 rounded-xl flex items-center justify-center mb-5 font-bold shadow-sm shadow-sky-100">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">
                2. วิเคราะห์คะแนนรายหัวข้อ
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                ระบบแจกแจงวิเคราะห์ผลการสอบรายหน่วยย่อย เช่น ระยะคลอด ครรภ์เสี่ยงสูง เพื่อให้ผู้ใช้มองเห็นจุดบกพร่องและทบทวนเนื้อหาได้ตรงเป้า
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/85 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/40 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-50/50 transition-all duration-200">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center mb-5 font-bold shadow-sm shadow-indigo-100">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">
                3. ติดตามพัฒนาการ Pre / Post
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                เปรียบเทียบผลลัพธ์คะแนนเก็บก่อนเรียน (Pre-test) และแบบทดสอบสภาประเมินผลหลังเรียน (Post-test) เพื่อวัดระดับความมั่นใจเป็นเชิงปริมาณ
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-[#1A2E3D]/95 text-slate-300 py-8 px-6 text-center text-xs border-t border-slate-850/40 backdrop-blur-md" id="landing-footer">
        <div className="max-w-7xl mx-auto space-y-2">
          <p className="font-medium text-slate-300">Ready RN 01 • ระบบเตรียมความพร้อมตอบประเด็นข้อสอบสภาการพยาบาล</p>
          <p className="bg-amber-400/10 text-amber-200 py-1.5 px-3.5 rounded-xl border border-amber-500/20 max-w-xl mx-auto text-xs my-3 font-semibold">
            ⚠️ Ready RN 01 เป็นระบบทบทวนความรู้เพื่อเตรียมความพร้อม ไม่ใช่ระบบสอบจริง
          </p>
          <p>
            รองรับสถาปัตยกรรมไร้เซิร์ฟเวอร์แบบ Static Web Deploy (เช่น Netlify) ร่วมกับ Firebase Spark Plan
          </p>
          <p className="text-slate-500 text-[10px] pt-2">
            © 2026 Ready RN 01. สงวนลิขสิทธิ์ข้อมูลข้อสอบสถานการณ์ทางการพยาบาลและการผดุงครรภ์
          </p>
        </div>
      </footer>
    </div>
  );
}
