/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { QuizAttempt } from "../../types";
import { 
  buildTopicReviewPlan, 
  ALL_MIDWIFERY_TOPICS 
} from "../../studentService";
import { 
  BookOpen, 
  CheckCircle, 
  AlertTriangle, 
  Flame, 
  ChevronRight, 
  Activity, 
  ShieldCheck,
  Compass
} from "lucide-react";

interface TopicReviewPlanProps {
  attempts: QuizAttempt[];
  onNavigateToQuizzes: () => void;
  passingCriteria?: number;
}

export default function TopicReviewPlan({
  attempts,
  onNavigateToQuizzes,
  passingCriteria = 60
}: TopicReviewPlanProps) {
  
  const dummySettings = {
    passingCriteria,
    riskCriteria: passingCriteria,
    questionsPerSet: 10,
    isOpenRegistration: true
  };

  const planItems = buildTopicReviewPlan(attempts, ALL_MIDWIFERY_TOPICS, dummySettings);

  return (
    <div className="space-y-6" id="topic-review-plan-panel">
      
      {/* Intro Header */}
      <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800">แผนทบทวนขอบข่ายความรู้รายย่อย (Topic-Specific Review Plan)</h2>
          <p className="text-xs text-slate-500 mt-1">ประมวลสมรรถนะสะสมจากรอบพยายามทั้งหมดเพื่อจัดระดับความเสี่ยงตามหัวข้อ Blueprint สภา</p>
        </div>
        <span className="text-2xs font-extrabold uppercase bg-slate-100 text-slate-600 border border-slate-200/50 px-2.5 py-1 rounded">
          PASS REGULATION: &gt;= {passingCriteria}%
        </span>
      </div>

      {/* Grid of Topics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="topics-review-grid">
        {planItems.map((item) => {
          
          // Select badge and styles depending on the status
          let badgeColor = "bg-slate-100 text-slate-700 border-slate-200";
          let statusIcon = <Activity className="h-3.5 w-3.5" />;
          let accentBorder = "hover:border-slate-300";

          if (item.status === "แข็งแรง") {
            badgeColor = "bg-emerald-55 bg-emerald-50 text-emerald-800 border-emerald-200";
            statusIcon = <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />;
            accentBorder = "hover:border-emerald-300";
          } else if (item.status === "ผ่านเกณฑ์") {
            badgeColor = "bg-teal-50 text-teal-800 border-teal-200";
            statusIcon = <CheckCircle className="h-3.5 w-3.5 text-teal-600" />;
            accentBorder = "hover:border-teal-300";
          } else if (item.status === "ควรทบทวน") {
            badgeColor = "bg-amber-50 text-amber-800 border-amber-200";
            statusIcon = <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />;
            accentBorder = "hover:border-amber-300";
          } else if (item.status === "ต้องให้ความสำคัญ") {
            badgeColor = "bg-rose-50 text-rose-800 border-rose-250 border-rose-200";
            statusIcon = <Flame className="h-3.5 w-3.5 text-rose-600 shrink-0" />;
            accentBorder = "hover:border-rose-400";
          }

          return (
            <div 
              key={item.topicId} 
              className={`bg-white border border-slate-100 p-5 rounded-3xl shadow-sm transition-all flex flex-col justify-between space-y-4 ${accentBorder}`}
            >
              {/* Header block inside card */}
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider bg-slate-50 border border-slate-150 px-2 py-0.5 rounded text-slate-555">
                    {item.topicId}
                  </span>
                  
                  {/* Status Badge */}
                  <span className={`inline-flex items-center space-x-1 py-0.5 px-3 rounded-full text-[10.5px] font-bold border ${badgeColor}`}>
                    {statusIcon}
                    <span>{item.status}</span>
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-850 text-xs sm:text-sm leading-normal">
                  {item.topicName}
                </h3>
              </div>

              {/* Stats Block */}
              <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 grid grid-cols-3 text-center text-xs">
                <div>
                  <span className="text-slate-400 text-3xs font-semibold block uppercase leading-none mb-1">คะแนนทำล่าสุด</span>
                  <span className="font-mono font-extrabold text-slate-800">
                    {item.latestScore !== null ? `${item.latestScore}%` : "—"}
                  </span>
                </div>
                <div className="border-x border-slate-200/60 text-center">
                  <span className="text-slate-400 text-3xs font-semibold block uppercase leading-none mb-1">คะแนเฉลี่ยสะสม</span>
                  <span className="font-mono font-extrabold text-slate-750">
                    {item.averageScore !== 0 ? `${item.averageScore}%` : "—"}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-slate-400 text-3xs font-semibold block uppercase leading-none mb-1">จานวนครั้งต่ำเกณฑ์</span>
                  <span className="font-mono font-extrabold text-rose-650">
                    {item.weakCount} ครั้ง
                  </span>
                </div>
              </div>

              {/* Recommendation guidelines */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">คำแนะนำในขอบวิชา:</span>
                <p className="text-xs text-slate-550 leading-relaxed font-light">
                  {item.recommendation}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-light max-w-[60%] leading-tight block">
                  * หมายเหตุ: ฝึกย่อย V2 เฉพาะทางแบบละเอียดจะเปิดให้บริการเร็วๆ นี้
                </span>
                <button
                  onClick={onNavigateToQuizzes}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-xl text-[10px] font-bold transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <Compass className="h-3.5 w-3.5 text-slate-600" />
                  <span>ฝึกข้อสอบหัวข้อนี้</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
