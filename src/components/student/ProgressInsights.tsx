/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { QuizAttempt } from "../../types";
import { 
  calculateStudentProgress,
  getLatestAttemptByType,
  sortAttempts
} from "../../studentService";
import { 
  TrendingUp, 
  Calendar, 
  BookOpen, 
  Percent, 
  HelpCircle, 
  Award, 
  AlertCircle,
  Clock,
  LayoutGrid,
  Divide,
  Scale
} from "lucide-react";
import AttemptComparison from "./AttemptComparison";

interface ProgressInsightsProps {
  attempts: QuizAttempt[];
  onCompareTabTrigger?: () => void;
  onNavigateToQuizzes: () => void;
}

export default function ProgressInsights({
  attempts,
  onNavigateToQuizzes
}: ProgressInsightsProps) {
  const [subView, setSubView] = useState<"insights" | "comparison">("insights");

  const progress = calculateStudentProgress(attempts);
  const latestPre = getLatestAttemptByType(attempts, "pre");
  const latestPost = getLatestAttemptByType(attempts, "post");

  // Sorted list chronologically for charting (oldest to newest)
  const choronologicalAttempts = [...attempts]
    .sort((a,b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

  if (attempts.length === 0) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center max-w-lg mx-auto space-y-4">
        <TrendingUp className="h-12 w-12 text-slate-350 mx-auto" />
        <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">ยังไม่มีข้อมูลการวิเคราะห์พัฒนาการ</h3>
        <p className="text-xs text-slate-505 text-slate-500 leading-normal font-light">
          กรุณาทำแบบทดสอบสนามจำลองก่อนการวัดผล เพื่อให้ระบบสามารถพยากรณ์และจัดพารามิเตอร์พัฒนาการการเรียนรู้
        </p>
        <button
          onClick={onNavigateToQuizzes}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          ทำแนวข้อสอบจำลอง
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Sub Navigation */}
      <div className="flex border-b border-slate-200/60 pb-0.5 space-x-6 text-xs font-bold text-slate-400">
        <button
          onClick={() => setSubView("insights")}
          className={`pb-2.5 transition-all outline-none border-b-2 cursor-pointer ${
            subView === "insights" ? "text-teal-600 border-teal-600 font-extrabold" : "border-transparent hover:text-slate-800"
          }`}
        >
          สรุปความก้าวหน้า & กราฟแนวโน้ม
        </button>
        <button
          onClick={() => setSubView("comparison")}
          className={`pb-2.5 transition-all outline-none border-b-2 cursor-pointer ${
            subView === "comparison" ? "text-teal-600 border-teal-600 font-extrabold" : "border-transparent hover:text-slate-800"
          }`}
        >
          <Scale className="h-3.5 w-3.5 inline mr-1" />
          เปรียบเทียบผลรอบพยายาม (Attempt Comparison)
        </button>
      </div>

      {subView === "comparison" ? (
        <AttemptComparison attempts={attempts} />
      ) : (
        <div className="space-y-6">
          
          {/* Missing Milestone Guidance Callouts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!latestPre && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/55 flex items-start space-x-3 text-amber-900">
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                <div className="text-xs font-light">
                  <strong className="font-bold">⚠️ ยังไม่มีข้อมูล Pre-test:</strong> ควรทำ Pre-test ก่อนเพื่อประเมินฐานรากความรู้และประสิทธิภาพการดูแลมารดาระยะเจ็บครรภ์คลอดในสถานการณ์ระดับความยากสภา
                </div>
              </div>
            )}
            
            {!latestPost && (
              <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-200/55 flex items-start space-x-3 text-cyan-950">
                <AlertCircle className="h-5 w-5 shrink-0 text-cyan-600 mt-0.5" />
                <div className="text-xs font-light">
                  <strong className="font-bold">📚 ยังไม่มีข้อมูล Post-test:</strong> ควรทำแบบทดสอบ Post-test หลังการทบทวนรายหน่วยวิชาเพื่อเปรียบสถิติความพร้อมสัมบูรณ์อย่างมั่นใจ
                </div>
              </div>
            )}
          </div>

          {/* Development Insight Block */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* KPI details */}
            <div className="md:col-span-1 space-y-4 border-r border-slate-100 pr-0 md:pr-6">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ดัชนีคะแนนเฉลี่ยการฝึกฝน</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-extrabold font-mono text-slate-800">
                    {progress.practiceAverage !== null ? `${progress.practiceAverage}` : "—"}
                  </span>
                  {progress.practiceAverage !== null && <span className="text-xs text-slate-500 font-bold">%</span>}
                </div>
                <span className="text-[10px] text-slate-400 block pb-2">เฉลยละเอียดรอบฝึกซ้ำประคองผลลัพธ์</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">สอบ Pre-test:</span>
                  <span className="font-bold font-mono text-slate-800">{progress.latestPreScore !== null ? `${progress.latestPreScore}%` : "ไม่มีข้อสอบ"}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">สอบ Post-test:</span>
                  <span className="font-bold font-mono text-slate-800">{progress.latestPostScore !== null ? `${progress.latestPostScore}%` : "ไม่มีข้อสอบ"}</span>
                </div>
                <div className="border-t border-slate-200 pt-1.5 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-600">วิเคราะห์ผลลัพธ์:</span>
                  <span className={`font-mono font-bold ${
                    progress.progressScore !== null && progress.progressScore >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}>
                    {progress.progressScore !== null ? `${progress.progressScore >= 0 ? "+" : ""}${progress.progressScore}%` : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Comprehensive development summary text */}
            <div className="md:col-span-2 space-y-4 flex flex-col justify-center">
              <div className="space-y-1.5">
                <span className="text-[9px] bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-bold uppercase inline-block border border-teal-100">
                  DEVELOPMENT INSIGHT ANALYTICS
                </span>
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">บทสรุปความพยายามวิชาพยาบาลผดุงครรภ์ส่วนบุคคล</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-light mt-1">
                  {progress.summaryText}
                </p>
                <p className="text-[11px] text-slate-400 leading-normal font-light">
                  *ข้อมูลคะแนนนี้คำนวณแบบเวลาจริงบนเบราว์เซอร์ เพื่อรักษาประสิทธิภาพการอ่านฐานข้อมูล Spark Plan ของสถาบัน
                </p>
              </div>
            </div>

          </div>

          {/* TREND CHART PLOT */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-850 text-xs sm:text-sm">กราฟพัฒนาการคะแนนตามเวลาวิทยาการ (Chronological Score Trend Chart)</h4>
                <p className="text-[10px] text-slate-400 font-light leading-none mt-1">เปรียบเทียบทุกความพยายามเรียงลำดับจากอดีตสู่ปัจจุบันของคุณ</p>
              </div>
              <span className="text-2xs font-extrabold uppercase bg-teal-50 text-teal-600 border border-teal-100 px-2 py-0.5 rounded leading-none">
                {attempts.length} ATTEMPTS
              </span>
            </div>

            {/* LIGHTWEIGHT PREMIUM SVG CHART */}
            <div className="pt-2">
              <div className="relative h-64 w-full bg-slate-50 rounded-2xl border border-slate-100 flex items-end p-4 sm:p-6 overflow-hidden">
                {/* Horizontal gridlines */}
                <div className="absolute inset-x-0 h-full flex flex-col justify-between pointer-events-none text-[8px] font-mono text-slate-300 p-2 select-none">
                  <div className="border-b border-slate-200/50 w-full text-right pr-2">100% PASS LIMIT</div>
                  <div className="border-b border-slate-200/50 w-full text-right pr-2">80% HIGH SCORE</div>
                  <div className="border-b border-slate-200/50 w-full text-right pr-2">60% PASSING CRITERIA</div>
                  <div className="border-b border-slate-200/50 w-full text-right pr-2">40% LOW SCORE</div>
                  <div className="w-full text-right pr-2">0% RESET</div>
                </div>

                {/* Bars or coordinates */}
                <div className="relative z-10 w-full h-full flex items-end justify-around pt-8">
                  {choronologicalAttempts.map((att, index) => {
                    const isPassed = att.scorePercentage >= att.passingCriteria;
                    const heightPercent = att.scorePercentage; // can use as percentage height
                    
                    return (
                      <div key={att.attemptId} className="flex flex-col items-center group relative w-1/12 max-w-[50px]">
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full mb-2 bg-slate-800 text-white rounded-lg p-2.5 text-3xs sm:text-2xs opacity-0 group-hover:opacity-100 pointer-events-none transition-all w-32 shadow-xl border border-slate-700 z-30">
                          <p className="font-bold line-clamp-1">{att.quizSetTitle}</p>
                          <p className="font-mono text-teal-350 text-wrap mt-0.5">คะแนน: {att.scorePercentage}%</p>
                          <p className="text-[9px] text-slate-400">{new Date(att.submittedAt).toLocaleDateString("th-TH")}</p>
                        </div>

                        {/* Visual Node representation */}
                        <div className="w-full bg-slate-200/60 rounded-full h-32 flex items-end relative overflow-hidden shadow-inner border border-slate-200/30">
                          <div 
                            className={`w-full rounded-full transition-all duration-500 ease-out cursor-pointer ${
                              att.quizType === "pre" ? "bg-cyan-500" :
                              att.quizType === "post" ? "bg-indigo-650 bg-indigo-505 bg-indigo-600" :
                              "bg-teal-500"
                            }`}
                            style={{ height: `${heightPercent}%` }}
                          ></div>
                        </div>

                        {/* Label */}
                        <span className="text-[9px] font-bold text-slate-700 mt-2 block shrink-0 font-mono">
                          #{(att.quizType[0] ?? "").toUpperCase()}{index+1}
                        </span>
                        <span className="text-[7.5px] text-slate-400 block uppercase leading-none font-medium">
                          {att.quizType}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chart Legend indicators */}
              <div className="flex flex-wrap gap-4 justify-center pt-3 text-[10px] text-slate-500 font-semibold">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full inline-block"></span>
                  <span>Pre-test ท้องแรก</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 bg-teal-500 rounded-full inline-block"></span>
                  <span>Practice แบบฝึกหัด</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full inline-block"></span>
                  <span>Post-test สรุปผล</span>
                </span>
              </div>
            </div>
          </div>

          {/* Timeline of Attempts */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-850 text-xs sm:text-sm">ตารางรายละเอียดประวัติความเจริญเติบโต</h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="py-2.5">วันที่ทำ</th>
                    <th className="py-2.5">ชุดแบบทดสอบ</th>
                    <th className="py-2.5 text-center">ประเภท</th>
                    <th className="py-2.5 text-center">พยายามที่</th>
                    <th className="py-2.5 text-center">ร้อยละคะแนน</th>
                    <th className="py-2.5 text-right">สถานภาพวิญญาณ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 font-light">
                  {[...attempts].map((att) => (
                    <tr key={att.attemptId} className="hover:bg-slate-50/50 transition-all font-light">
                      <td className="py-3">
                        <span className="font-mono text-slate-500">
                          {new Date(att.submittedAt).toLocaleDateString("th-TH")}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-slate-800 truncate max-w-xs" title={att.quizSetTitle}>
                        {att.quizSetTitle}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          att.quizType === "pre" ? "bg-cyan-50 text-cyan-705 text-cyan-600" :
                          att.quizType === "practice" ? "bg-amber-50 text-amber-705 text-amber-705 text-amber-600" :
                          "bg-indigo-50 text-indigo-705 text-indigo-600"
                        }`}>
                          {att.quizType === "pre" ? "Pre-test" : att.quizType === "practice" ? "Practice" : "Post-test"}
                        </span>
                      </td>
                      <td className="py-3 text-center font-mono font-bold text-slate-650">{att.attemptNo}</td>
                      <td className="py-3 text-center font-mono font-bold text-teal-600">{att.scorePercentage}%</td>
                      <td className="py-3 text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          att.scorePercentage >= 60 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          {att.resultStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
