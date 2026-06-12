/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Parses raw CSV string data into an array of string arrays.
 * Handles UTF-8 BOM, nested quote characters, escaped sub-quotes, and linebreaks elegantly.
 */
export function parseCSV(content: string): string[][] {
  let cleanContent = content;
  // Strip UTF-8 BOM mark if present
  if (cleanContent.charCodeAt(0) === 0xFEFF) {
    cleanContent = cleanContent.substring(1);
  }

  const result: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < cleanContent.length; i++) {
    const char = cleanContent[i];
    const nextChar = cleanContent[i + 1] || "";

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          cell += '"';
          i++; // Skip the escaped quote
        } else {
          inQuotes = false; // Quote block end
        }
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(cell.trim());
        cell = "";
      } else if (char === "\n" || char === "\r") {
        if (char === "\r" && nextChar === "\n") {
          i++; // Skip linefeed in CRLF
        }
        row.push(cell.trim());
        // Only push non-empty rows
        if (row.length > 1 || (row.length === 1 && row[0] !== "")) {
          result.push(row);
        }
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }
  }

  // Handle last remainder cell
  if (cell !== "" || row.length > 0) {
    row.push(cell.trim());
    if (row.length > 1 || (row.length === 1 && row[0] !== "")) {
      result.push(row);
    }
  }

  return result;
}

export interface ParsedStudentRow {
  studentId: string;
  displayName: string;
  email: string;
  section: string;
}

export interface ParsedQuestionRow {
  questionId: string;
  topic: string;
  scenario: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

/**
 * Validates and converts raw CSV grid into typed student records
 */
export function validateStudentCSV(grid: string[][]): ParsedStudentRow[] {
  if (grid.length < 2) {
    throw new Error("ไฟล์ CSV ว่างเปล่า หรือมีระเบียนข้อมูลไม่เพียงพอ");
  }

  const headers = grid[0].map(h => h.trim().toLowerCase());
  
  const required = ["studentid", "displayname", "email", "section"];
  const missing = required.filter(f => !headers.includes(f));
  if (missing.length > 0) {
    throw new Error(`คอลัมน์สำคัญขาดหาย: ${missing.join(", ")} | คอลัมน์ที่ต้องระบุคือ studentId, displayName, email, section (ไม่คำนึงอักษรใหญ่น้อย)`);
  }

  const iId = headers.indexOf("studentid");
  const iName = headers.indexOf("displayname");
  const iEmail = headers.indexOf("email");
  const iSection = headers.indexOf("section");

  const records: ParsedStudentRow[] = [];

  for (let idx = 1; idx < grid.length; idx++) {
    const row = grid[idx];
    if (row.length < required.length) continue; // Skip incomplete lines

    const sId = row[iId]?.trim();
    const name = row[iName]?.trim();
    const email = row[iEmail]?.trim();
    const sect = row[iSection]?.trim();

    if (!sId || !name || !email) {
      throw new Error(`ระเบียนบรรทัดที่ ${idx + 1} ข้อมูลว่างเปลาไม่สมบูรณ์ (ต้องระบุรหัสชื่อและอีเมลสถาบันเพื่อความปลอดภัย)`);
    }

    if (!email.includes("@")) {
      throw new Error(`รูปแบบอีเมลในบรรทัดที่ ${idx + 1} ไม่ถูกต้อง (ระบุเป็น: ${email})`);
    }

    records.push({
      studentId: sId,
      displayName: name,
      email: email.toLowerCase(),
      section: sect || "ห้องเรียนทั่วไป"
    });
  }

  return records;
}

/**
 * Validates and converts raw CSV grid into typed question records
 */
export function validateQuestionCSV(grid: string[][]): ParsedQuestionRow[] {
  if (grid.length < 2) {
    throw new Error("ไฟล์ CSV สำหรับข้อสอบว่างหรือไม่มีข้อเสนอระเบียนข้อสอบ");
  }

  const headers = grid[0].map(h => h.trim().toLowerCase());
  const required = [
    "questionid", "topic", "scenario", "questiontext", 
    "optiona", "optionb", "optionc", "optiond", 
    "correctanswer", "explanation", "difficulty"
  ];
  
  const missing = required.filter(f => !headers.includes(f));
  if (missing.length > 0) {
    throw new Error(`คอลัมน์ข้อสอบสำคัญขาดหายในไฟล์ CSV: ${missing.join(", ")} | คอลัมน์พึงมีครบถ้วน: ${required.join(", ")}`);
  }

  const iId = headers.indexOf("questionid");
  const iTopic = headers.indexOf("topic");
  const iScenario = headers.indexOf("scenario");
  const iText = headers.indexOf("questiontext");
  const iA = headers.indexOf("optiona");
  const iB = headers.indexOf("optionb");
  const iC = headers.indexOf("optionc");
  const iD = headers.indexOf("optiond");
  const iCorrect = headers.indexOf("correctanswer");
  const iExp = headers.indexOf("explanation");
  const iDiff = headers.indexOf("difficulty");

  const records: ParsedQuestionRow[] = [];

  for (let idx = 1; idx < grid.length; idx++) {
    const row = grid[idx];
    if (row.length < required.length) continue; // skip broken lines

    const qId = row[iId]?.trim();
    const topic = row[iTopic]?.trim();
    const scenario = row[iScenario]?.trim();
    const text = row[iText]?.trim();
    const oA = row[iA]?.trim();
    const oB = row[iB]?.trim();
    const oC = row[iC]?.trim();
    const oD = row[iD]?.trim();
    const ans = row[iCorrect]?.trim().toLowerCase();
    const exp = row[iExp]?.trim();
    const rawDiff = row[iDiff]?.trim().toLowerCase();

    if (!qId || !topic || !text || !oA || !oB || !oC || !oD || !ans) {
      throw new Error(`บรรทัดที่ ${idx + 1} เสียหาย: ข้อมูลข้อสอบภาคบังคับขาดหาย (ต้องป้อน รหัสข้อสอบ, หัวข้อ, คำถาม, ตัวเลือก A-D และเฉลยข้อถูก)`);
    }

    if (!["a", "b", "c", "d"].includes(ans)) {
      throw new Error(`บรรทัดที่ ${idx + 1} เฉลยคำตอบผิดเงื่อนไข: ${ans} (ระบายเฉลยได้เฉพาะตัวเลือก: a, b, c, d เท่านั้น)`);
    }

    let diff: "easy" | "medium" | "hard" = "medium";
    if (rawDiff === "easy" || rawDiff === "ง่าย") diff = "easy";
    else if (rawDiff === "hard" || rawDiff === "ยาก") diff = "hard";

    records.push({
      questionId: qId,
      topic,
      scenario: scenario || "",
      questionText: text,
      optionA: oA,
      optionB: oB,
      optionC: oC,
      optionD: oD,
      correctAnswer: ans,
      explanation: exp || "ไม่มีคำอธิบายเพิ่มเติม",
      difficulty: diff
    });
  }

  return records;
}
