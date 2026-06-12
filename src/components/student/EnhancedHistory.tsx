/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { QuizAttempt } from "../../types";
import { sortAttempts } from "../../studentService";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  BookOpen, 
  Calendar, 
  Award, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  ClipboardList,
  Inbox
} from "lucide-react";

interface EnhancedHistoryProps {
  attempts: QuizAttempt[];
  onViewDetailedResult: (attempt: QuizAttempt) => void;
}

export default function EnhancedHistory({
  attempts,
  onViewDetailedResult
}: EnhancedHistoryProps) {
  // Filters & State Hooks
  const [searchTerm, setSearchTerm] = useState("");
  const [quizTypeFilter, setQuizTypeFilter] = useState<"all" | "pre" | "practice" | "post">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "passed" | "needs_review">("all");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "score_desc" | "score_asc">("date_desc");

  // Filter attempts first
  const filteredAttempts = attempts.filter((att) => {
    const matchesSearch = att.quizSetTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          att.quizSetId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesQuizType = quizTypeFilter === "all" || att.quizType === quizTypeFilter;
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "passed" && att.scorePercentage >= 60) || 
      (statusFilter === "needs_review" && att.scorePercentage < 60);

    return matchesSearch && matchesQuizType && matchesStatus;
  });

  // Then sort
  const sortedAndFiltered = sortAttempts(filteredAttempts, sortBy);

  return (
    <div className="space-y-6" id="enhanced-history-panel">
      
      {/* Intro Header */}
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-850">ประวัติและใบบันทึกผลสอบสภาจำลองละเอียด (Enhanced Student History)</h2>
        <p className="text-xs text-slate-500 mt-1">คัดลอก ค้นหา และจำแนกสถิติคะแนนความเจริญเติบโตพร้อมกดส่องเฉลยทฤษฎีละเอียด</p>
      </div>

      {/* SEARCH AND CONTROLS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อชุดแบบทดสอบ หรือรหัสเช่น QS001..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50/75 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-700 outline-none focus:border-teal-400 focus:bg-white transition-all"
          />
        </div>

        {/* Filters and sorting layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Quiz Type Filter */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">ประเภทแบบสอบ</label>
            <select
              value={quizTypeFilter}
              onChange={(e) => setQuizTypeFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-2xs md:text-xs font-semibold text-slate-650 outline-none focus:border-teal-300"
            >
              <option value="all">ทั้งหมด (All Types)</option>
              <option value="pre">Pre-test (สอบก่อนเรียน)</option>
              <option value="practice">Practice (แบบฝึกจำลอง)</option>
              <option value="post">Post-test (สอบท้ายเรียน)</option>
            </select>
          </div>

          {/* Passing Status Filter */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">สถานภาพการประเมิน</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-2xs md:text-xs font-semibold text-slate-650 outline-none focus:border-teal-300"
            >
              <option value="all">ทุกสถานะ (All Statuses)</option>
              <option value="passed">ผ่านเกณฑ์สะสม (&gt;= 60%)</option>
              <option value="needs_review">ควรทบทวนละเอียด (&lt; 60%)</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">จัดเรียงลาดบั</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-2xs md:text-xs font-semibold text-slate-650 outline-none focus:border-teal-300"
            >
              <option value="date_desc">วันที่ทำล่าสุด (Newest)</option>
              <option value="date_asc">วันที่ทำเก่าสุด (Oldest)</option>
              <option value="score_desc">คะแนนจากสูงสุด (Highest Score)</option>
              <option value="score_asc">คะแนนต่ำสุด (Lowest Score)</option>
            </select>
          </div>

        </div>

      </div>

      {/* RESULTS LISTING */}
      {sortedAndFiltered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 space-y-4 max-w-md mx-auto">
          <Inbox className="h-10 w-10 text-slate-350 mx-auto" />
          <div>
            <h4 className="font-extrabold text-slate-800 text-sm">ไม่พบใบบันทึกผลสอบสภาตามคัดกรอง</h4>
            <p className="text-2xs text-slate-400 leading-normal mt-1">
              โปรดลองพิมพ์รหัสอื่นหรือปลดฟิลเตอร์ประเภทกลับมาเป็นตัวเลือกทั้งหมด
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4" id="history-attempts-cards-container">
          {sortedAndFiltered.map((att) => {
            const isPassed = att.scorePercentage >= 60;

            return (
              <div 
                key={att.attemptId} 
                className="bg-white border border-slate-100 hover:border-slate-250 p-5 rounded-3xl shadow-sm hover:shadow transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left Info block */}
                <div className="space-y-3 max-w-2xl flex-grow">
                  
                  {/* Tags metadata row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[9px] bg-slate-100 border border-slate-150 px-2 py-0.5 rounded text-slate-500 font-bold uppercase leading-none">
                      {att.quizSetId}
                    </span>
                    
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      att.quizType === "pre" ? "bg-cyan-50 text-cyan-705 border border-cyan-100" :
                      att.quizType === "practice" ? "bg-amber-50 text-amber-705 border border-amber-100" :
                      "bg-indigo-50 text-indigo-705 border border-indigo-100"
                    }`}>
                      {att.quizType === "pre" ? "PRE-TEST (ก่อนเรียน)" :
                       att.quizType === "practice" ? "PRACTICE (แบบฝึกสอน)" :
                       "POST-TEST (หลังเรียนประเมิน)"}
                    </span>

                    <span className="text-[10px] bg-slate-100/75 border border-slate-150/50 px-2 rounded-full font-semibold text-slate-500 py-0.5 leading-none">
                      พยายามครั้งที่ #{att.attemptNo}
                    </span>

                    <span className="text-[10.5px] text-slate-400 font-medium flex items-center space-x-1 pl-1">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="font-mono">{new Date(att.submittedAt).toLocaleDateString("th-TH")} ({new Date(att.submittedAt).toLocaleTimeString("th-TH", {hour: '2-digit', minute:'2-digit'})} น.)</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-850 text-xs sm:text-sm">
                      {att.quizSetTitle}
                    </h3>
                  </div>

                  {/* Weak topics lists warnings */}
                  {att.reviewTopics && att.reviewTopics.length > 0 && (
                    <div className="space-y-2.5 pt-1.5">
                      <span className="text-[10px] text-rose-600 font-extrabold block tracking-wider uppercase">
                        🔴 หัวข้อกลุ่มสาระวิชาแนะนำให้รีบกลับไปทบทวนเร่งด่วน:
                      </span>
                      <div className="flex flex-wrap gap-2 text-3xs md:text-2xs">
                        {att.reviewTopics.map((top, index) => (
                          <span key={index} className="inline-block bg-rose-50 border border-rose-100 text-rose-800 font-medium px-2 py-0.5 rounded-xl">
                            {top}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!att.reviewTopics || att.reviewTopics.length === 0) && (
                    <div className="pt-1.5">
                      <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">
                        💚 ยินดีด้วยสมรรถนะยอดเยี่ยม เกณฑ์ผ่านประยุกต์ลุล่วง 100% ครบทุกด้าน
                      </span>
                    </div>
                  )}

                </div>

                {/* Score & button Block (Right) */}
                <div className="shrink-0 pt-2 md:pt-0 flex md:flex-col items-center md:items-end justify-between font-mono gap-4 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                  
                  {/* Score KPI box */}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-sans tracking-wide block uppercase font-semibold">ผลสัมฤทธิ์ใบงาน</span>
                    <div className="flex items-baseline space-x-0.5 justify-end">
                      <span className={`text-2xl font-extrabold ${isPassed ? "text-emerald-650 text-emerald-600" : "text-amber-600"}`}>
                        {att.scorePercentage}
                      </span>
                      <span className="text-xs text-slate-400 font-bold font-sans">%</span>
                    </div>
                    <span className="text-3xs text-slate-500 font-sans font-medium block">
                      (ถูก {att.correctAnswers} • ผิด {att.wrongAnswers} ข้อ)
                    </span>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-col gap-1.5 w-full md:w-auto">
                    <button
                      onClick={() => onViewDetailedResult(att)}
                      className="w-full md:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white rounded-xl text-3xs sm:text-2xs font-extrabold tracking-wide uppercase transition-all shadow-sm flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <ClipboardList className="h-3.5 w-3.5" />
                      <span>ดูผลละเอียด</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
