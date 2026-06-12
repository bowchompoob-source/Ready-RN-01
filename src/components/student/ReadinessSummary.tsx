/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { QuizAttempt } from "../../types";
import { 
  calculateReadinessScore, 
  buildTopicReviewPlan, 
  buildPersonalRecommendations,
  ALL_MIDWIFERY_TOPICS 
} from "../../studentService";
import { 
  Sparkles, 
  Zap, 
  BookOpenCheck, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle,
  Clock,
  Award,
  ChevronRight,
  Info
} from "lucide-react";

interface ReadinessSummaryProps {
  attempts: QuizAttempt[];
  onNavigateToQuizzes: () => void;
  passingCriteria?: number;
}

export default function ReadinessSummary({
  attempts,
  onNavigateToQuizzes,
  passingCriteria = 60
}: ReadinessSummaryProps) {
  
  const dummySettings = {
    passingCriteria,
    riskCriteria: passingCriteria,
    questionsPerSet: 10,
    isOpenRegistration: true
  };

  const { readinessScore, readinessGrade, isPreliminary, reason } = calculateReadinessScore(attempts, dummySettings);
  const topicPlans = buildTopicReviewPlan(attempts, ALL_MIDWIFERY_TOPICS, dummySettings);
  const recommendations = buildPersonalRecommendations(attempts, ALL_MIDWIFERY_TOPICS, dummySettings);

  // Group strengths & focuses
  const strengths = topicPlans.filter(t => t.status === "แข็งแรง" || t.status === "ผ่านเกณฑ์");
  const weaknessPlans = topicPlans.filter(t => t.status === "ควรทบทวน" || t.status === "ต้องให้ความสำคัญ");

  return (
    <div className="space-y-6" id="readiness-summary-panel">
      
      {/* Page Intro header */}
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-800 font-sans">สรุปความพร้อมประเมินก่อนสอบจริง (Readiness Diagnostic Summary)</h2>
        <p className="text-xs text-slate-505 text-slate-500 mt-1">ประเมินอัลกอริทึมเพื่อจำลองผลลัพธ์อัตราความน่าจะเป็นของการสอบผ่านข้อสอบวิชาผดุงครรภ์สะสม</p>
      </div>

      {isPreliminary && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-205 border-amber-200 flex items-start space-x-3 text-amber-900">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="text-xs font-light">
            <strong className="font-bold">⚠️ ข้อควรทราบ:</strong> คะแนนความพร้อมนี้เป็นการประเมินเบื้องต้น เนื่องจากยังไม่มีผลคะแนนแบบสอบหลังเรียน (Post-test) ของตัวผู้ศึกษาส่งผลประปราย ระบบจึงสำรองใช้คะแนนดิบล่าสุดประกอบแทนชั่วคราว
          </div>
        </div>
      )}

      {/* Main Metric Visualization Block */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100/80 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Rounded Gauge (4 cols) */}
        <div className="md:col-span-5 text-center flex flex-col items-center justify-center space-y-3 md:border-r border-slate-100 pr-0 md:pr-6">
          <div className="relative w-36 h-36 flex items-center justify-center rounded-full bg-slate-50 border-4 border-slate-100 shadow-inner">
            {/* Center score */}
            <div className="text-center space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block leading-none uppercase">Readiness</span>
              <span className="text-4xl font-extrabold font-mono text-slate-800 leading-none">
                {readinessScore}
              </span>
              <span className="text-[11px] text-slate-400 font-bold block leading-none">%</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-2xs uppercase tracking-wider font-bold text-slate-400">ระดับวินิจฉัยความก้าวหน้า:</span>
            <div className="pt-0.5">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                readinessGrade === "พร้อมมาก" ? "bg-emerald-55 bg-emerald-50 text-emerald-800 border border-emerald-150" :
                readinessGrade === "ค่อนข้างพร้อม" ? "bg-teal-50 text-teal-800 border border-teal-150" :
                readinessGrade === "ควรทบทวนเพิ่มเติม" ? "bg-amber-100 bg-amber-50 text-amber-800 border border-amber-150" :
                "bg-rose-50 text-rose-800 border border-rose-150"
              }`}>
                {readinessGrade}
              </span>
            </div>
          </div>
        </div>

        {/* Text Diagnostics Summary (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          <div className="space-y-2">
            <span className="text-[9px] bg-slate-100 text-slate-600 px-3 py-1 rounded font-bold uppercase inline-block">
              DIAGNOSTIC REPORT
            </span>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">รายงานวิเคราะห์ระบบเตรียมสอบสะสม</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-light">
              {reason}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150/60 text-xs text-slate-505 space-y-2 font-light">
            <span className="font-bold text-slate-600 block">📊 สูตรองค์ความพร้อมสะสมเชิงอัตราส่วน:</span>
            <ul className="list-disc pl-4 space-y-1">
              <li>น้ำหนัก Post-test สูงสุดคิดเป็นสัดส่วนสะสม 50%</li>
              <li>คะแนนเฉลี่ยประเมินข้อสอบย่อยรายหน่วย (Blueprint Weights) คิดเป็น 30%</li>
              <li>การเติบโตเปรียบเทียบ Pre กับ Post (Progress Score Ratio) คิดเป็น 20%</li>
            </ul>
          </div>
        </div>

      </div>

      {/* Strengths and Weaknesses Details columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Strengths card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h4 className="font-bold text-emerald-800 text-xs sm:text-sm flex items-center space-x-1.5 pb-2 border-b border-slate-100">
            <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
            <span>กลุ่มสาระวิชาทำได้ดี (จุดแข็งในการสอบ)</span>
          </h4>

          {strengths.length > 0 ? (
            <div className="space-y-3">
              {strengths.map((item) => (
                <div key={item.topicId} className="flex justify-between items-center text-xs p-2 bg-emerald-50/30 border border-emerald-100/50 rounded-xl">
                  <span className="text-slate-700 font-semibold truncate max-w-[80%]">{item.topicName}</span>
                  <span className="font-bold font-mono text-emerald-700 shrink-0">{item.latestScore}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">ต้องการประเมินเพิ่มเติม คะแนนยังไม่เคยขยับขอบผ่านเกณฑ์</p>
          )}
        </div>

        {/* Focus reviews card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h4 className="font-bold text-rose-800 text-xs sm:text-sm flex items-center space-x-1.5 pb-2 border-b border-slate-100">
            <AlertTriangle className="h-4.5 w-4.5 text-rose-600" />
            <span>กลุ่มสาระวิชาที่ยังต่ำกว่าเกณฑ์ (สิ่งที่ควรเน้นทบทวน)</span>
          </h4>

          {weaknessPlans.length > 0 ? (
            <div className="space-y-3">
              {weaknessPlans.map((item) => (
                <div key={item.topicId} className="flex justify-between items-center text-xs p-2 bg-rose-50/30 border border-rose-100/50 rounded-xl">
                  <span className="text-slate-705 text-slate-700 font-semibold truncate max-w-[80%]">{item.topicName}</span>
                  <span className="font-bold font-mono text-rose-700 shrink-0">{item.latestScore !== null ? `${item.latestScore}%` : "ยังไม่สอบ"}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">ไม่มีหัวข้อต่ำกว่าเกณฑ์ ขอแสดงความยินดีด้วย! 🎉</p>
          )}
        </div>

      </div>

      {/* Recommended Next step actions block and recommendations rule-based messages */}
      <div className="bg-slate-55 bg-slate-50 p-6 rounded-3xl border border-slate-150 space-y-4">
        <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center space-x-1.5">
          <Zap className="h-4 w-4 text-amber-600" />
          <span>ขั้นตอนแนะนำถัดไปสำหรับคุณ (Recommended Personal Tactics)</span>
        </h4>

        <div className="space-y-3 pl-1">
          {recommendations.slice(0, 3).map((rec, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-xs text-slate-650">
              <span className="font-bold text-teal-600 shrink-0 mt-0.5">#{idx + 1}</span>
              <p className="font-light">{rec}</p>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-200 flex justify-center">
          <button
            onClick={onNavigateToQuizzes}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer inline-flex items-center space-x-1 hover:scale-101"
          >
            <span>ฝึกฝนแบบฝึกเสริมเพิ่มความพร้อม</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Legal & Preparation Safety Notes Disclaimer (Requirement #13) */}
      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200/50 space-y-2">
        <div className="flex items-center space-x-2 text-slate-500">
          <Info className="h-4 w-4 shrink-0 text-slate-500" />
          <span className="text-[10px] uppercase font-extrabold tracking-wider">Privacy and Safety Disclaimer</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed font-light">
          <strong>โปรดสังเกต:</strong> ข้อมูลสัดส่วนและประมาณการความพร้อมสำหรับการขึ้นทะเบียนใบอนุญาต (Readiness Score) คันคัดเลือกขึ้นแบบ client-side เพื่อใช้สำหรับวางแผนทบทวนทางความรู้ส่วนบุคคลแก่นักศึกษาเท่านั้น ไม่ใช่ผลประเมินสภาการพยาบาลจริงหรือการรับประกันความน่าจะเป็นของการผ่านสอบขึ้นทะเบียนตามกรอบกฎหมายแต่อย่างใด หากพบโจทย์หรือเกณฑ์เฉลยคลาดเคลื่อน กรุณาแจ้งโดยตรงที่ผู้รับผิดชอบรายวิชาผดุงครรภ์ของคณะพยาบาลศาสตร์
        </p>
      </div>

    </div>
  );
}
