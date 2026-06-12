/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { QuizAttempt } from "../../types";
import { compareAttempts } from "../../studentService";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Scale,
  Calendar,
  AlertTriangle
} from "lucide-react";

interface AttemptComparisonProps {
  attempts: QuizAttempt[];
}

export default function AttemptComparison({ attempts }: AttemptComparisonProps) {
  const [attemptAid, setAttemptAid] = useState<string>("");
  const [attemptBid, setAttemptBid] = useState<string>("");

  useEffect(() => {
    if (attempts && attempts.length >= 2) {
      setAttemptAid(attempts[1].attemptId); // standard is older
      setAttemptBid(attempts[0].attemptId); // standard is newer
    }
  }, [attempts]);

  if (!attempts || attempts.length < 2) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center max-w-lg mx-auto space-y-4">
        <Scale className="h-12 w-12 text-slate-350 mx-auto" />
        <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">เปรียบเทียบผลพยายามข้ามเวลา</h3>
        <p className="text-xs text-slate-500 leading-normal font-light">
          ⚠️ ต้องมีผลการทำแบบทดสอบอย่างน้อย <strong className="font-bold">2 ครั้ง</strong> เพื่อเปรียบเทียบพัฒนาการของทักษะการผดุงครรภ์เป็นรายครั้ง
        </p>
      </div>
    );
  }

  const attemptA = attempts.find((a) => a.attemptId === attemptAid);
  const attemptB = attempts.find((b) => b.attemptId === attemptBid);

  const compResult = attemptA && attemptB ? compareAttempts(attemptA, attemptB) : null;

  return (
    <div className="space-y-6" id="attempt-comparison-panel">
      
      {/* Top Controls Dropdowns */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Dropdown A */}
          <div className="space-y-1 w-full sm:w-64">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">แบบทดสอบอ้างอิง A (ครั้งเก่า)</label>
            <select
              value={attemptAid}
              onChange={(e) => setAttemptAid(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-teal-400"
            >
              {attempts.map((att) => (
                <option key={att.attemptId} value={att.attemptId}>
                  [{att.quizType.toUpperCase()}] {att.quizSetTitle} (#{att.attemptNo} - {new Date(att.submittedAt).toLocaleDateString("th-TH")})
                </option>
              ))}
            </select>
          </div>

          {/* Icon indicator */}
          <div className="hidden sm:flex items-center justify-center pt-4 text-slate-400 text-xs font-extrabold">
            VS
          </div>

          {/* Dropdown B */}
          <div className="space-y-1 w-full sm:w-64">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">แบบทดสอบเปรียบเทียบ B (ครั้งล่าสุด)</label>
            <select
              value={attemptBid}
              onChange={(e) => setAttemptBid(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-teal-400"
            >
              {attempts.map((att) => (
                <option key={att.attemptId} value={att.attemptId}>
                  [{att.quizType.toUpperCase()}] {att.quizSetTitle} (#{att.attemptNo} - {new Date(att.submittedAt).toLocaleDateString("th-TH")})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-center md:text-right shrink-0">
          <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-100 rounded-full px-3 py-1 font-bold inline-block">
            ⚖️ ตรวจสอบความก้าวหน้า
          </span>
        </div>
      </div>

      {attemptA && attemptB && compResult && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Summary Compare Cards (4 columns) */}
          <div className="md:col-span-4 space-y-4">
            
            {/* Diff Score Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ส่วนต่างความก้าวหน้าทั้งหมด</span>
              
              <div className="flex justify-center items-center space-x-2">
                <span className={`text-3xl font-extrabold font-mono ${
                  compResult.diffScore > 0 ? "text-emerald-600" : compResult.diffScore < 0 ? "text-rose-600" : "text-slate-500"
                }`}>
                  {compResult.diffScore > 0 ? `+${compResult.diffScore}` : compResult.diffScore}%
                </span>
                
                {compResult.diffScore > 0 ? (
                  <ArrowUpRight className="h-6 w-6 text-emerald-600" />
                ) : compResult.diffScore < 0 ? (
                  <ArrowDownRight className="h-6 w-6 text-rose-600" />
                ) : (
                  <Minus className="h-6 w-6 text-slate-400" />
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50 flex justify-between items-center text-[11px] font-medium">
                <div>
                  <span className="text-slate-400 block text-2xs">คะแนนสอบ A</span>
                  <span className="font-bold text-slate-700">{compResult.scoreA}%</span>
                </div>
                <div className="w-px h-6 bg-slate-200"></div>
                <div>
                  <span className="text-slate-400 block text-2xs">คะแนนสอบ B</span>
                  <span className="font-bold text-slate-700">{compResult.scoreB}%</span>
                </div>
              </div>
            </div>

            {/* Qualitative Changes Lists */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4 text-xs">
              
              {/* Improved */}
              <div>
                <span className="font-bold text-emerald-700 flex items-center space-x-1 mb-1.5">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>หัวข้อที่มีการพัฒนาขึ้น 📈</span>
                </span>
                {compResult.improvedTopics.length > 0 ? (
                  <div className="space-y-1 pl-4">
                    {compResult.improvedTopics.map((item) => (
                      <div key={item} className="text-slate-650 list-disc font-light">{item}</div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 pl-4 italic">ไม่มีหัวข้อเปลี่ยนไปทางบวก</p>
                )}
              </div>

              {/* Decline */}
              <div className="border-t border-slate-100 pt-3">
                <span className="font-bold text-rose-700 flex items-center space-x-1 mb-1.5">
                  <XCircle className="h-3.5 w-3.5" />
                  <span>หัวข้อที่คะแนนลดลง 📉</span>
                </span>
                {compResult.declinedTopics.length > 0 ? (
                  <div className="space-y-1 pl-4">
                    {compResult.declinedTopics.map((item) => (
                      <div key={item} className="text-slate-650 list-disc font-light">{item}</div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 pl-4 italic">ไม่มีหัวข้อตกฮวบในหน่วยพิจารณ์</p>
                )}
              </div>

              {/* Persistently weak */}
              <div className="border-t border-slate-100 pt-3">
                <span className="font-bold text-amber-700 flex items-center space-x-1 mb-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>ต่ำกว่าเกณฑ์ทั้งสองครั้ง ⚠️</span>
                </span>
                {compResult.persistentlyWeakTopics.length > 0 ? (
                  <div className="space-y-1 pl-4">
                    {compResult.persistentlyWeakTopics.map((item) => (
                      <div key={item} className="text-slate-650 list-disc font-light">{item}</div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 pl-4 font-light">ยินดีด้วยไม่มีหัวข้อใดต่ำกว่า 60% ทั้งสองครั้ง 🎉</p>
                )}
              </div>

            </div>

          </div>

          {/* Side-by-Side Topics Table (8 columns) */}
          <div className="md:col-span-8 bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">ตารางวิเคราะห์สัดส่วนคะแนนด้านสมรรถนะเปรียบเทียบ</h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold">
                    <th className="py-2.5">ชื่อกลุ่มสาระวิชา / หัวข้อ</th>
                    <th className="py-2.5 text-center">คะแนนเกณฑ์ A</th>
                    <th className="py-2.5 text-center">คะแนนเกณฑ์ B</th>
                    <th className="py-2.5 text-right">ผลต่างความต่าง</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 font-light">
                  {compResult.topicComparison.map((tc) => {
                    return (
                      <tr key={tc.topicName} className="hover:bg-slate-50/50 transition-all font-light">
                        <td className="py-3 font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">
                          {tc.topicName}
                        </td>
                        <td className="py-3 text-center font-mono font-bold text-slate-500">
                          {tc.scoreA !== null ? `${tc.scoreA}%` : "—"}
                        </td>
                        <td className="py-3 text-center font-mono font-bold text-slate-850">
                          {tc.scoreB !== null ? `${tc.scoreB}%` : "—"}
                        </td>
                        <td className="py-3 text-right">
                          {tc.diff !== null ? (
                            <span className={`font-mono font-extrabold ${
                              tc.diff > 0 ? "text-emerald-600" : tc.diff < 0 ? "text-rose-600" : "text-slate-500"
                            }`}>
                              {tc.diff > 0 ? `+${tc.diff}` : tc.diff}%
                            </span>
                          ) : (
                            <span className="text-slate-350 italic">ไม่สามารถประเมินได้</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Simple Graphic Bar Comparison Panel */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3.5 mt-2 text-2xs md:text-xs">
              <span className="font-bold text-slate-500 block uppercase">เกรียติผลการพยายามเปรียบเทียบในแอมพลิจูดรวม (Aggregated Amplitude Path)</span>
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                    <span>รอบพยายาม A (ครั้งระดับก่อนหน้า)</span>
                    <span className="font-mono">{compResult.scoreA}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-400 h-full rounded-full" style={{ width: `${compResult.scoreA}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                    <span>รอบพยายาม B (เป้าหมายช่วงหลัง)</span>
                    <span className="font-mono">{compResult.scoreB}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-500 h-full rounded-full" style={{ width: `${compResult.scoreB}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
