/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Question, QuizSet, QuizAttemptSummary, AppSettings, QuizAttempt } from "./types";

export const mockSettings: AppSettings = {
  passingCriteria: 60,
  riskCriteria: 60,
  questionsPerSet: 40,
  isOpenRegistration: true
};

export const mockStudents: Student[] = [
  {
    studentId: "651101001",
    uid: "student_u1",
    displayName: "นางสาวกานดา วิชิตสกุล",
    section: "ห้อง A1",
    email: "kanda.w@stin.ac.th",
    status: "excellent",
    preTestScore: 28, // 70%
    postTestScore: 35, // 87.5%
    practiceCount: 5
  },
  {
    studentId: "651101002",
    uid: "student_u2",
    displayName: "นางสาวชลดา รอดภัย",
    section: "ห้อง A1",
    email: "chonlada.r@stin.ac.th",
    status: "safe",
    preTestScore: 25, // 62.5%
    postTestScore: 30, // 75%
    practiceCount: 3
  },
  {
    studentId: "651101003",
    uid: "student_u3",
    displayName: "นางสาวเบญจมาศ เพ็ชรทับ",
    section: "ห้อง A2",
    email: "benjamas.p@stin.ac.th",
    status: "risk",
    preTestScore: 18, // 45%
    postTestScore: 22, // 55%
    practiceCount: 1
  },
  {
    studentId: "651101004",
    uid: "student_u4",
    displayName: "นางสาวศิริพร บุญเหลือ",
    section: "ห้อง A2",
    email: "siriporn.b@stin.ac.th",
    status: "safe",
    preTestScore: 24, // 60%
    postTestScore: 28, // 70%
    practiceCount: 4
  },
  {
    studentId: "651101005",
    uid: "student_u5",
    displayName: "นายปกรณ์ เกียรติวรวงศ์",
    section: "ห้อง B1",
    email: "pakorn.k@stin.ac.th",
    status: "risk",
    preTestScore: 15, // 37.5%
    postTestScore: null,
    practiceCount: 2
  },
  {
    studentId: "651101006",
    uid: "student_u6",
    displayName: "นางสาวณิชาภา รักดี",
    section: "ห้อง B1",
    email: "nichapa.r@stin.ac.th",
    status: "safe",
    preTestScore: 22, // 55%
    postTestScore: 26, // 65%
    practiceCount: 3
  },
  {
    studentId: "651101007",
    uid: "student_u7",
    displayName: "นางสาวพิมพิศา สมบูรณ์",
    section: "ห้อง A1",
    email: "pimpisa.s@stin.ac.th",
    status: "excellent",
    preTestScore: 30, // 75%
    postTestScore: 36, // 90%
    practiceCount: 6
  },
  {
    studentId: "651101008",
    uid: "student_u8",
    displayName: "นายอภิสิทธิ์ มั่นคง",
    section: "ห้อง A2",
    email: "aphisit.m@stin.ac.th",
    status: "risk",
    preTestScore: 16, // 40%
    postTestScore: 20, // 50%
    practiceCount: 2
  },
  {
    studentId: "651101009",
    uid: "student_u9",
    displayName: "นางสาววรรณิษา ใจดี",
    section: "ห้อง B1",
    email: "wannisa.j@stin.ac.th",
    status: "safe",
    preTestScore: 21, // 52.5%
    postTestScore: 27, // 67.5%
    practiceCount: 4
  },
  {
    studentId: "651101010",
    uid: "student_u10",
    displayName: "นางสาวอรธิดา พูนทรัพย์",
    section: "ห้อง B2",
    email: "onthida.p@stin.ac.th",
    status: "excellent",
    preTestScore: 31, // 77.5%
    postTestScore: 37, // 92.5%
    practiceCount: 7
  }
];

export const mockQuestions: Question[] = [
  {
    questionId: "Q001",
    topic: "การฝากครรภ์",
    scenario: "หญิงตั้งครรภ์ครรภ์แรก อายุครรภ์ 34 สัปดาห์ มาตรวจตามนัด บ่นมีอาการปวดศีรษะ ตาพร่ามัว ซักประวัติพบมีอาการบวมที่มือและใบหน้า ผลการตรวจวัดสัญญาณชีพ BP 162/110 mmHg ผลตรวจปัสสาวะพบ Urine Protein 3+",
    questionText: "การพยาบาลข้อใดเป็นอันดับแรกที่สำคัญที่สุดสำหรับสตรีตั้งครรภ์รายนี้เพื่อความปลอดภัย",
    options: {
      a: "ประเมินอัตราหัวใจทารกในครรภ์ (Fetal Heart Rate) และจดบันทึกการดิ้น",
      b: "เตรียมอุปกรณ์ช่วยคลอดและยาออกซิโทซิน (Oxytocin)",
      c: "จัดให้นอนพักบนเตียงในห้องที่เงียบ แสงสลัว และเฝ้าระวังอาการชัก (Seizure precautions)",
      d: "แนะนำการจำกัดการรับประทานอาหารประเภทเค็มและโปรตีน"
    },
    correctAnswer: "c",
    explanation: "สตรีตั้งครรภ์รายนี้มีภาวะ Severe Pre-eclampsia (ครรภ์เป็นพิษรุนแรง) สังเกตจากความดันโลหิตสูง BP ≥ 160/110 mmHg, Urine Protein 3+, ปวดศีรษะ ตาพร่ามัว เสี่ยงต่อความก้าวหน้าไปสู่อาการชัก (Eclampsia) การพยาบาลที่สำคัญที่สุดคือการลดสิ่งกระตุ้นเพื่อป้องกันอาการชัก จัดให้อยู่ในห้องเงียบ แสงสลัว และเตรียมระบบควบคุมความปลอดภัย (Seizure precautions)",
    difficulty: "hard",
    status: "active"
  },
  {
    questionId: "Q002",
    topic: "ภาวะฉุกเฉินทางสูติกรรม",
    scenario: "มารดาหลังคลอดครรภ์ที่ 3 คลอดบุตรเพศชายน้ำหนัก 4,100 กรัม รกคลอดสมบูรณ์ คลอดพ้นไปแล้ว 2 ชั่วโมง พยาบาลตรวจพบมีเลือดสีแดงสดออกทางช่องคลอดประมาณ 300 ml เมื่อคลำหน้าท้องพบมดลูกกลมโตและหยุ่นคลายตัว (Atonic uterus) สูงเหนือระดับสะดือ",
    questionText: "ขั้นตอนการพยาบาลเบื้องต้นที่พยาบาลผดุงครรภ์ต้องปฏิบัติเป็นอันดับแรกคือข้อใด",
    options: {
      a: "นวดคลึงมดลูกให้หดรัดตัวและแจ้งแพทย์รักษา (Uterine massage)",
      b: "เตรียมส่งตรวจสวนปัสสาวะทิ้งเพื่อไม่ให้ขัดขวางการหดรัดตัวของมดลูก",
      c: "วัดสัญญาณชีพและประเมินปริมาณการเสียเลือดทันที",
      d: "เริ่มให้สารน้ำทางหลอดเลือดดำและเตรียมยาเพิ่มการหดรัดตัวของมดลูกตามแผนการรักษา"
    },
    correctAnswer: "a",
    explanation: "สาเหตุส่วนใหญ่ของการตกเลือดหลังคลอดเฉียบพลันเกิดจากมดลูกหดรัดตัวไม่ดี (Uterine Atony) โดยเฉพาะเมื่อคลอดบุตรตัวโต (Macrosomia) การพยาบาลเบื้องต้นที่รวดเร็วและสามารถทำได้ทันทีคือการนวดคลึงมดลูก (Uterine massage) เพื่อกระตุ้นการหดรัดตัวทันที เพื่อบีบหลอดเลือดที่เปิดอยู่ให้ปิดลงป้องกันการตกเลือดเพิ่มขึ้น",
    difficulty: "medium",
    status: "active"
  },
  {
    questionId: "Q003",
    topic: "การพยาบาลระยะคลอด",
    scenario: "ผู้คลอดครรภ์แรก อายุครรภ์ 39 สัปดาห์ มาโรงพยาบาลด้วยเจ็บครรภ์จริง มีมูกปนเลือดทางช่องคลอด ตรวจภายในพบ Cervix dilation 3 cm, Effacement 80%, Station -1, Membranes intact",
    questionText: "สตรีตั้งครรภ์รายนี้อยู่ในระยะใดของการเจ็บครรภ์ด่านแรกของการคลอด (Stage 1 of Labor)",
    options: {
      a: "Active phase",
      b: "Latent phase",
      c: "Transition phase",
      d: "Deceleration phase"
    },
    correctAnswer: "b",
    explanation: "ระยะที่ 1 ของการคลอดแบ่งออกเป็น Latent, Active, และ Transition phase ตามแนวปฏิบัติปัจจุบันขององค์การอนามัยโลกและประเทศไทย ระยะ Latent phase คือปากมดลูกเปิดตั้งแต่เริ่มเจ็บครรภ์จริงจนถึงประมาน 4 ถึง 5 ซม. (ในคำถามเปิด 3 ซม.) ดังนั้นจึงจัดอยู่ใน Latent phase หญิงตั้งครรภ์ควรได้รับแรงสนับสนุนและเฝ้าระวังเป็นระยะ",
    difficulty: "easy",
    status: "active"
  },
  {
    questionId: "Q004",
    topic: "การพยาบาลระยะคลอด",
    scenario: "ในการตรวจครรภ์สตรีระยะคลอด พบว่าศีรษะของทารกเคลื่อนผ่านเข้าสู่ช่องเชิงกราน (Engagement) และเส้นรอบวงที่กว้างที่สุดของศีรษะผ่านช่องเข้าเชิงกรานเรียบร้อยแล้ว",
    questionText: "กลไกการเคลื่อนต่ำของทารก (Descent) ในกลไกการคลอดปกติ จะเกิดควบคู่หรือส่งเสริมด้วยกลไกใดที่เป็นขั้นถัดไปเพื่อนำไปสู่การคลอด",
    options: {
      a: "Extension",
      b: "Flexion",
      c: "Internal rotation",
      d: "External rotation"
    },
    correctAnswer: "b",
    explanation: "กลไกการคลอดเริ่มจาก Engagement และตามด้วย Descent จากนั้นเมื่อศีรษะทารกกระทบความต้านทานของช่องทางคลอดและอุ้งเชิงกราน จะเกิดกลไกก้มศีรษะหรือ Flexion เพื่อให้เส้นผ่านศูนย์กลางที่เล็กที่สุดของศีรษะทารก (Suboccipitobregmatic) เคลื่อนต่ำผ่านเชิงกรานต่อไปได้อย่างเหมาะสม",
    difficulty: "medium",
    status: "active"
  },
  {
    questionId: "Q005",
    topic: "การพยาบาลในระยะหลังคลอด",
    scenario: "มารดาหลังคลอดวันที่ 2 สังเกตเห็นน้ำคาวปลา (Lochia) ของตนเองที่ไหลซึมออกทางช่องคลอด มีลักษณะสีแดงสดปนชมพูอ่อนๆ ปริมาณปานกลาง ไม่มีกลิ่นเหม็นเน่า และไม่มีลิ่มเลือดขนาดใหญ่",
    questionText: "ลักษณะสีและชนิดของน้ำคาวปลาในสตรีหลังคลอดวันที่ 2 รายนี้จัดเป็นข้อใด",
    options: {
      a: "Lochia rubra",
      b: "Lochia serosa",
      c: "Lochia alba",
      d: "Lochia purulenta"
    },
    correctAnswer: "a",
    explanation: "น้ำคาวปลาหลังคลอดมี 3 ชนิดตามลำดับระยะเวลา: 1) Lochia rubra สีแดงเข้ม/แดงปนชมพูพบบ่อยใน 1-3 วันแรกหลังคลอด 2) Lochia serosa สีชมพูปนน้ำตาลพบบ่อยวันที่ 4-10 และ 3) Lochia alba สีเหลืองนวลหรือขาวครีมพบช่วงประมาณวันที่ 11-21 การที่มารดาหลังคลอดรายนี้อยู่ในวันที่ 2 มีน้ำคาวปลาสีแดงสดปนชมพูจึงจัดเป็น Lochia rubra ปกติ",
    difficulty: "easy",
    status: "active"
  },
  {
    questionId: "Q006",
    topic: "การฝากครรภ์",
    scenario: "หญิงตั้งครรภ์อายุครรภ์ 24 สัปดาห์ มาตรวจครรภ์ตามนัด พยาบาลคำนวณหาน้ำหนักเพิ่มขึ้นรวม 8 กิโลกรัมตั้งแต่เริ่มฝากครรภ์ ผลการซักประวัติอาหารพบคาร์โบไฮเดรตสูง พยาบาลประสงค์ประเมินความเสี่ยงโรคเบาหวานขณะตั้งครรภ์ (GDM)",
    questionText: "ขั้นตอนการคัดกรองเบื้องต้นสำหรับ GDM ในรายที่มีความเสี่ยงสูงควรทำอย่างไรเป็นอันดับแรก",
    options: {
      a: "เจาะเลือดทำ 75 g OGTT ทันทีโดยไม่ต้องอดอาหาร",
      b: "ตรวจปัสสาวะหาคีโตน (Urine Ketone) และน้ำตาลในวันถัดไป",
      c: "ทำคัดกรองด้วยการให้ดื่มน้ำตาล 50-gram Glucose Challenge Test (GCT)",
      d: "สั่งการรับประทานอาหารที่อดคาร์โบไฮเดรตเป็นเวลา 3 วัน แล้วนัดมาตรวจเกลือแร่ในเลือด"
    },
    correctAnswer: "c",
    explanation: "การตรวจคัดกรองเบาหวานขณะตั้งครรภ์ (GDM) ในทางราชการและสภาการพยาบาลกำหนดให้ใช้ 50-g GCT เป็นอันดับแรก หากผลตรวจพบค่าน้ำตาลตั้งแต่ 140 mg/dL ขึ้นไป (หรือบางแนวทางใช้ 130 mg/dL) จึงจะทำการวินิจฉัยยืนยันด้วย 100-g OGTT หรือ 75-g OGTT ต่อไปตามเหมาะสม",
    difficulty: "easy",
    status: "active"
  },
  {
    questionId: "Q007",
    topic: "การประเมินความก้าวหน้าของการคลอดและ Partograph",
    scenario: "ในระยะเจ็บครรภ์คลอด พยาบาลผู้ดูแลทำการบันทึกกราฟความก้าวหน้าการคลอด (Partograph) พบว่าปากมดลูกผู้คลอดเปิดกว้างข้ามพ้นเส้นเฝ้าระวัง (Alert Line) ไปแตะและกำลังเข้าใกล้เส้นปฎิบัติการ (Action Line)",
    questionText: "เมื่อพบความก้าวหน้าการคลอดมีลักษณะคลาดเคลื่อนข้ามพ้นเส้นเฝ้าระวัง (Alert Line) พยาบาลควรดำเนินการอย่างไรที่เหมาะสมที่สุดตามหลักผดุงครรภ์",
    options: {
      a: "เจาะถุงน้ำคร่ำทันทีตามความก้าวหน้าเพื่อเร่งระยะคลอดโดยไม่ต้องแจ้งรายงาน",
      b: "เฝ้าระวังอย่างใกล้ชิด ประเมินซ้ำรายชั่วโมง รายงานแพทย์ และหาสาเหตุของความล่าช้า (เช่น มดลูกหดรัดตัวห่าง แรงเบ่งน้อย หรือศีรษะไม่ได้สัดส่วน)",
      c: "สั่งย้ายผู้คลอดส่งทางห้องผ่าตัดเพื่อทำ Caesarean Section โดยด่วนที่สุด",
      d: "บอกให้ผู้คลอดเริ่มเดินรอบๆ บริเวณตึกเพื่อกระตุ้นปากมดลูกโดยไม่ต้องปรับสัญญาณเตือน"
    },
    correctAnswer: "b",
    explanation: "เมื่อกราฟความก้าวหน้าปากมดลูกเบี่ยงข้ามพ้น Alert line (เส้นเฝ้าระวัง) บ่งชี้ว่าเกิดภาวะคลอดล่าช้า (Prolonged labor) พยาบาลต้องเฝ้าระวังอย่างใกล้ชิด ค้นหาสาเหตุหลัก (Passage, Passenger, Powers) และแจ้งแพทย์ผู้ดูแลเพื่อวางแนวทางการแก้ไขรักษาร่วมกันทันที เพื่อหลีกเลี่ยงภาวะอันตรายที่จะพาดผ่านไปแตะ Action line ซึ่งจำเป็นต้องได้รับการช่วยเหลือเร่งคลอด",
    difficulty: "hard",
    status: "active"
  },
  {
    questionId: "Q008",
    topic: "ภาวะฉุกเฉินทางสูติกรรม",
    scenario: "หญิงตั้งครรภ์ครรภ์หลัง ปากมดลูกเปิด 6 ซม. ถุงน้ำคร่ำแตกกะทันหัน ตรวจพบอัตราการเต้นของหัวใจทารกบีบสะเทือนลดต่ำลงอย่างรวดเร็ว (Severe variable deceleration) เมื่อคลำตรวจภายในพบสายสะดือสอดผ่านหรือย้อยต่ำกว่าส่วนนำ (Umbilical Cord Prolapsed)",
    questionText: "การปฏิบัติพยาบาลผดุงครรภ์เร่งด่วนในทันทีเพื่อรักษาชีวิตของทารกคือข้อใด",
    options: {
      a: "ใช้มือดันส่วนนำของทารกค้างไว้ไม่ให้กดทับสายสะดือ รีบจัดผู้คลอดในท่า Knee-chest หรือ Trendelenburg และเตรียมผ่าคลอดด่วน",
      b: "ทดลองจัดและสาวสายสะดือที่ย้อยกลับเข้าไปในโพรงมดลูกโดยเร็วที่สุด",
      c: "เริ่มให้ยาเร่งคลอดทันทีเพื่อเร่งให้ทารกคลอดออกมาทางช่องคลอดโดยไว",
      d: "จัดผู้คลอดพิงพนักกึ่งนั่งเพื่อให้ศีรษะทารกหย่อนต่ำขจัดแรงต้านทานของมดลูก"
    },
    correctAnswer: "a",
    explanation: "ภาวะสายสะดือย้อย (Cord prolapse) คือภาวะวิกฤตที่ต้องการการปกป้องการกดทับเส้นเลือดในสายสะดือทันที เพื่อป้องกันภาวะขาดออกซิเจนอย่างรุนแรงของทารก (Fetal Hypoxia) การปฏิบัติที่ถูกหลักคือ ใช้มือสอดเลื่อนดันส่วนนำทารกไว้เพื่อไม่ให้ทับสายสะดือ และจัดมารดาอยู่ท่าก้นโด่ง (Knee-chest) หรือ Trendelenburg เพื่อช่วยลดแรงกดดันของส่วนนำ แล้วรีบส่งผ่าตัดคลอดทำคลอดทันที",
    difficulty: "hard",
    status: "active"
  },
  {
    questionId: "Q009",
    topic: "การดูแลทารกแรกเกิด",
    scenario: "พยาบาลผดุงครรภ์ทำการประเมินสัญญาณชีพทารกแรกเกิดอายุประมาณ 1 นาที พบลักษณะ: อัตราเต้นของหัวใจ 110 ครั้ง/นาที, กำลังพยายามหายใจมีเสียงร้องเบาๆ, แขนขาพับงอปานกลาง (Flexion), มีปฏิกิริยาไอจามเมื่อใช้สายสวนกระตุ้นจมูก, และมีลำตัวสีชมพูแต่ปลายมือปลายเท้าเขียวคล้ำ (Acrocyanosis)",
    questionText: "จงประเมินคะแนนสภาพชีวิตแรกคลอดทารกรายนี้และกำหนดช่วงคะแนนของ APGAR Score ข้อที่ได้ถูกต้อง",
    options: {
      a: "APGAR score = 9 คะแนน จัดอยู่ในเกณฑ์ปกติ",
      b: "APGAR score = 8 คะแนน จัดอยู่ในภาวะฟื้นตัวได้ดี (Mild depression)",
      c: "APGAR score = 7 คะแนน จัดอยู่ในเกณฑ์ปกติ (Active newborn)",
      d: "APGAR score = 5 คะแนน จัดอยู่ในเกณฑ์อันตรายต้องช่วยฟื้นคืนชีพด่วน"
    },
    correctAnswer: "c",
    explanation: "การคิดคะแนน APGAR Score ของทารกรายนี้: 1) Heart rate = 110 bpm (>100 bpm) = 2 คะแนน, 2) Respiratory effort = ร้องเบาๆ พยายามหายใจ = 1 คะแนน, 3) Muscle tone = แขนขาพับงอปานกลาง = 1 คะแนน, 4) Reflex irritability = ไอจามเมื่อใส่สายสวน = 2 คะแนน, 5) Color = ตัวชมพู ปลายเขียว = 1 คะแนน รวมเป็น 2+1+1+2+1 = 7 คะแนน ซึ่งถือว่าอยู่ในเกณฑ์ปกติ (7-10 คะแนน)",
    difficulty: "medium",
    status: "active"
  },
  {
    questionId: "Q010",
    topic: "การดูแลทารกแรกเกิด",
    scenario: "หลังทำคลอดสมบูรณ์ 30 นาที มารดาหลังคลอดมีความตั้งใจอย่างยิ่งที่จะเลี้ยงทารกด้วยนมแม่ และประสงค์จะเริ่มให้ทารกดูดนมจากเต้าตั้งแต่ในชั่วโมงแรกหลังคลอด ขณะที่ทารกตื่นตัวและสัญญาณชีพอยู่ในเกณฑ์ปกติ",
    questionText: "การส่งเสริมการเริ่มเลี้ยงลูกด้วยนมแม่ทันทีหลังคลอด (Early Breastfeeding) พยาบาลควรให้คำแนะนำและจัดท่าดูดข้อใดที่ปลอดภัยและส่งผลกระตุ้นฮอร์โมนได้ดีที่สุด",
    options: {
      a: "อุ้มทารกแนบชิดอกมารดา ท้องแนบท้อง คางชิดเต้านม หัวนมแตะจมูกทารกเพื่อกระตุ้น Rooting reflex และเริ่มอมหัวนมและลานนมให้มิด",
      b: "อุ้มลูกให้ดูดเฉพาะบริเวณหัวนมส่วนยอด โดยเว้นการอมลานนมเพื่อป้องกันมารดาปวดเจ็บ",
      c: "ให้ป้อนนมผสมปริมาณ 10 ml เป็นการประเมินปฏิกิริยากลืนอาหารก่อนเริ่มดูดนมแม่ชั่วโมงถัดไป",
      d: "แนะนำให้มารดานอนราบบนนอนตะแคง และเว้นระยะการดูดนมไม่น้อยกว่า 6 ชั่วโมงเพื่อลดภาวะเหนื่อยล้าหลังคลอด"
    },
    correctAnswer: "a",
    explanation: "การเริ่มสัมผัสคลอเคลียแบบผิวเนื้อแนบผิว (Skin-to-skin contact) และดูดนมมารดาภายใน 1 ชม. แรก (Early Inititaion of Breastfeeding) ช่วยส่งเสริมสายใยรักและเร่งการหลั่งฮอร์โมนออกซิโทซินประสิทธิผลสูง การสวมคอหรือจัดท่าดูดที่ถูกต้องคืออุ้มลูกแนบชิด ท้องแนบท้อง คางชนเต้า และให้ทารกอ้าปากได้กว้าง เพื่ออมหัวนมรวมถึงลานนมได้เหมาะสมมิดชิด ป้องกันการหัวนมแตกเจ็บ",
    difficulty: "medium",
    status: "active"
  }
];

export const mockQuizSets: QuizSet[] = [
  {
    quizSetId: "QS001",
    title: "แบบทดสอบก่อนทบทวน (Pre-test) - ประสิทธิภาพและพื้นฐาน",
    type: "pre_test",
    description: "แบบทดสอบประเมินความรู้พื้นฐานเรื่องการผดุงครรภ์เพื่อระบุจุดเด่นและจุดบกพร่องที่ควรได้รับการพัฒนาอย่างเร่งด่วนก่อนเจาะลึกเนื้อหา",
    totalQuestions: 10,
    timeLimitMinutes: 60,
    status: "completed"
  },
  {
    quizSetId: "QS002",
    title: "แบบฝึกข้อสอบสถานการณ์ (Practice Mode) - เน้นข้อสอบสถานการณ์ผดุงครรภ์ 01",
    type: "practice",
    description: "ฝึกทำโจทย์จำลองเชิงสถานการณ์คลินิกแบบอินเตอร์แอคทีฟ พร้อมคำเฉลยอย่างละเอียดและทฤษฎีอ้างอิงทันทีหลังส่งข้อสอบในแต่ละข้อ",
    totalQuestions: 10,
    timeLimitMinutes: 90,
    status: "ready"
  },
  {
    quizSetId: "QS003",
    title: "แบบทดสอบหลังทบทวน (Post-test) - วัดระดับประเมินความพร้อมสู่การสอบจริง",
    type: "post_test",
    description: "แบบทดสอบจำลองเสมือนจริงสำหรับประเมินสภาวะสุดท้ายเพื่อชี้ระดับความพร้อมในการสอบใบประกอบวิชาชีพของสภาการพยาบาล",
    totalQuestions: 10,
    timeLimitMinutes: 60,
    status: "not_started"
  }
];

export const mockQuizAttempts: QuizAttemptSummary[] = [
  {
    attemptId: "ATT001",
    studentId: "651101001",
    studentName: "นางสาวกานดา วิชิตสกุล",
    quizSetId: "QS001",
    quizSetTitle: "แบบทดสอบก่อนทบทวน (Pre-test) - ประสิทธิภาพและพื้นฐาน",
    score: 7,
    totalQuestions: 10,
    percentage: 70,
    completedAt: "2026-06-05T14:30:00+07:00",
    isPassed: true,
    topicBreakdown: [
      { topic: "การฝากครรภ์", correct: 2, total: 3 },
      { topic: "การพยาบาลระยะคลอด", correct: 2, total: 3 },
      { topic: "ภาวะฉุกเฉินทางสูติกรรม", correct: 1, total: 2 },
      { topic: "การดูแลทารกแรกเกิด", correct: 2, total: 2 }
    ]
  }
];

// Generates 20 detailed mock QuizAttempt records for Demo Mode
export const mockDetailedAttempts: QuizAttempt[] = [
  // 1. นางสาวกานดา วิชิตสกุล (excellent)
  {
    attemptId: "DA_001",
    uid: "student_u1",
    studentId: "651101001",
    studentName: "นางสาวกานดา วิชิตสกุล",
    studentEmail: "kanda.w@stin.ac.th",
    section: "ห้อง A1",
    year: "2569",
    quizSetId: "QS001",
    quizSetTitle: "แบบทดสอบก่อนทบทวน (Pre-test) - ประสิทธิภาพและพื้นฐาน",
    quizType: "pre",
    attemptNo: 1,
    submittedAt: "2026-06-01T09:00:00Z",
    totalQuestions: 10,
    correctAnswers: 7,
    wrongAnswers: 3,
    scorePercentage: 70,
    passingCriteria: 60,
    topicPassingCriteria: 60,
    resultStatus: "ผ่านเกณฑ์",
    reviewTopics: ["การพยาบาลระยะคลอด"],
    topicScores: [
      { topicId: "T001", topicName: "การฝากครรภ์", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100, status: "ผ่านเกณฑ์" },
      { topicId: "T002", topicName: "การพยาบาลระยะคลอด", totalQuestions: 3, correctAnswers: 1, scorePercentage: 33.3, status: "ควรทบทวนเพิ่มเติม" },
      { topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T006", topicName: "การดูแลทารกแรกเกิด", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100, status: "ผ่านเกณฑ์" }
    ],
    answers: [
      { questionId: "Q001", topicId: "T001", topicName: "การฝากครรภ์", selectedOption: "c", correctOption: "c", isCorrect: true },
      { questionId: "Q002", topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", selectedOption: "a", correctOption: "a", isCorrect: true },
      { questionId: "Q003", topicId: "T002", topicName: "การพยาบาลระยะคลอด", selectedOption: "a", correctOption: "b", isCorrect: false },
      { questionId: "Q004", topicId: "T002", topicName: "การพยาบาลระยะคลอด", selectedOption: "b", correctOption: "b", isCorrect: true },
      { questionId: "Q005", topicId: "T005", topicName: "การพยาบาลในระยะหลังคลอด", selectedOption: "b", correctOption: "a", isCorrect: false }
    ],
    questionSnapshot: [],
    revealPolicy: "score_only",
    createdAt: "2026-06-01T09:00:00Z"
  },
  {
    attemptId: "DA_002",
    uid: "student_u1",
    studentId: "651101001",
    studentName: "นางสาวกานดา วิชิตสกุล",
    studentEmail: "kanda.w@stin.ac.th",
    section: "ห้อง A1",
    year: "2569",
    quizSetId: "QS003",
    quizSetTitle: "แบบทดสอบหลังทบทวน (Post-test) - วัดระดับประเมินความพร้อมสู่การสอบจริง",
    quizType: "post",
    attemptNo: 1,
    submittedAt: "2026-06-10T14:30:00Z",
    totalQuestions: 10,
    correctAnswers: 9,
    wrongAnswers: 1,
    scorePercentage: 90,
    passingCriteria: 60,
    topicPassingCriteria: 60,
    resultStatus: "ผ่านเกณฑ์",
    reviewTopics: [],
    topicScores: [
      { topicId: "T001", topicName: "การฝากครรภ์", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100, status: "ผ่านเกณฑ์" },
      { topicId: "T002", topicName: "การพยาบาลระยะคลอด", totalQuestions: 3, correctAnswers: 3, scorePercentage: 100, status: "ผ่านเกณฑ์" },
      { topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T006", topicName: "การดูแลทารกแรกเกิด", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100, status: "ผ่านเกณฑ์" }
    ],
    answers: [
      { questionId: "Q001", topicId: "T001", topicName: "การฝากครรภ์", selectedOption: "c", correctOption: "c", isCorrect: true },
      { questionId: "Q002", topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", selectedOption: "a", correctOption: "a", isCorrect: true },
      { questionId: "Q003", topicId: "T002", topicName: "การพยาบาลระยะคลอด", selectedOption: "b", correctOption: "b", isCorrect: true },
      { questionId: "Q004", topicId: "T002", topicName: "การพยาบาลระยะคลอด", selectedOption: "b", correctOption: "b", isCorrect: true },
      { questionId: "Q005", topicId: "T005", topicName: "การพยาบาลในระยะหลังคลอด", selectedOption: "a", correctOption: "a", isCorrect: true }
    ],
    questionSnapshot: [],
    revealPolicy: "full_reveal",
    createdAt: "2026-06-10T14:30:00Z"
  },

  // 2. นางสาวชลดา รอดภัย (safe)
  {
    attemptId: "DA_003",
    uid: "student_u2",
    studentId: "651101002",
    studentName: "นางสาวชลดา รอดภัย",
    studentEmail: "chonlada.r@stin.ac.th",
    section: "ห้อง A1",
    year: "2569",
    quizSetId: "QS001",
    quizSetTitle: "แบบทดสอบก่อนทบทวน (Pre-test) - ประสิทธิภาพและพื้นฐาน",
    quizType: "pre",
    attemptNo: 1,
    submittedAt: "2026-06-02T10:00:00Z",
    totalQuestions: 10,
    correctAnswers: 6,
    wrongAnswers: 4,
    scorePercentage: 60,
    passingCriteria: 60,
    topicPassingCriteria: 60,
    resultStatus: "ผ่านเกณฑ์",
    reviewTopics: ["ภาวะฉุกเฉินทางสูติกรรม"],
    topicScores: [
      { topicId: "T001", topicName: "การฝากครรภ์", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100, status: "ผ่านเกณฑ์" },
      { topicId: "T002", topicName: "การพยาบาลระยะคลอด", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", totalQuestions: 3, correctAnswers: 1, scorePercentage: 33.3, status: "ควรทบทวนเพิ่มเติม" },
      { topicId: "T006", topicName: "การดูแลทารกแรกเกิด", totalQuestions: 2, correctAnswers: 1, scorePercentage: 50.0, status: "ควรทบทวนเพิ่มเติม" }
    ],
    answers: [
      { questionId: "Q001", topicId: "T001", topicName: "การฝากครรภ์", selectedOption: "c", correctOption: "c", isCorrect: true },
      { questionId: "Q002", topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", selectedOption: "b", correctOption: "a", isCorrect: false },
      { questionId: "Q003", topicId: "T002", topicName: "การพยาบาลระยะคลอด", selectedOption: "b", correctOption: "b", isCorrect: true }
    ],
    questionSnapshot: [],
    revealPolicy: "score_only",
    createdAt: "2026-06-02T10:00:00Z"
  },
  {
    attemptId: "DA_004",
    uid: "student_u2",
    studentId: "651101002",
    studentName: "นางสาวชลดา รอดภัย",
    studentEmail: "chonlada.r@stin.ac.th",
    section: "ห้อง A1",
    year: "2569",
    quizSetId: "QS003",
    quizSetTitle: "แบบทดสอบหลังทบทวน (Post-test) - วัดระดับประเมินความพร้อมสู่การสอบจริง",
    quizType: "post",
    attemptNo: 1,
    submittedAt: "2026-06-11T13:00:00Z",
    totalQuestions: 10,
    correctAnswers: 8,
    wrongAnswers: 2,
    scorePercentage: 80,
    passingCriteria: 60,
    topicPassingCriteria: 60,
    resultStatus: "ผ่านเกณฑ์",
    reviewTopics: [],
    topicScores: [
      { topicId: "T001", topicName: "การฝากครรภ์", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100, status: "ผ่านเกณฑ์" },
      { topicId: "T002", topicName: "การพยาบาลระยะคลอด", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T006", topicName: "การดูแลทารกแรกเกิด", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100, status: "ผ่านเกณฑ์" }
    ],
    answers: [
      { questionId: "Q001", topicId: "T001", topicName: "การฝากครรภ์", selectedOption: "c", correctOption: "c", isCorrect: true },
      { questionId: "Q002", topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", selectedOption: "a", correctOption: "a", isCorrect: true },
      { questionId: "Q003", topicId: "T002", topicName: "การพยาบาลระยะคลอด", selectedOption: "b", correctOption: "b", isCorrect: true }
    ],
    questionSnapshot: [],
    revealPolicy: "full_reveal",
    createdAt: "2026-06-11T13:00:00Z"
  },

  // 3. นางสาวเบญจมาศ เพ็ชรทับ (risk - score is 45 and 55, < 60)
  {
    attemptId: "DA_005",
    uid: "student_u3",
    studentId: "651101003",
    studentName: "นางสาวเบญจมาศ เพ็ชรทับ",
    studentEmail: "benjamas.p@stin.ac.th",
    section: "ห้อง A2",
    year: "2569",
    quizSetId: "QS001",
    quizSetTitle: "แบบทดสอบก่อนทบทวน (Pre-test) - ประสิทธิภาพและพื้นฐาน",
    quizType: "pre",
    attemptNo: 1,
    submittedAt: "2026-06-03T11:00:00Z",
    totalQuestions: 10,
    correctAnswers: 4,
    wrongAnswers: 6,
    scorePercentage: 40,
    passingCriteria: 60,
    topicPassingCriteria: 60,
    resultStatus: "ควรทบทวนเพิ่มเติม",
    reviewTopics: ["การฝากครรภ์", "ภาวะฉุกเฉินทางสูติกรรม", "การดูแลทารกแรกเกิด"],
    topicScores: [
      { topicId: "T001", topicName: "การฝากครรภ์", totalQuestions: 2, correctAnswers: 0, scorePercentage: 0, status: "ควรทบทวนเพิ่มเติม" },
      { topicId: "T002", topicName: "การพยาบาลระยะคลอด", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", totalQuestions: 3, correctAnswers: 1, scorePercentage: 33.3, status: "ควรทบทวนเพิ่มเติม" },
      { topicId: "T006", topicName: "การดูแลทารกแรกเกิด", totalQuestions: 2, correctAnswers: 1, scorePercentage: 50.0, status: "ควรทบทวนเพิ่มเติม" }
    ],
    answers: [
      { questionId: "Q001", topicId: "T001", topicName: "การฝากครรภ์", selectedOption: "a", correctOption: "c", isCorrect: false },
      { questionId: "Q002", topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", selectedOption: "b", correctOption: "a", isCorrect: false },
      { questionId: "Q003", topicId: "T002", topicName: "การพยาบาลระยะคลอด", selectedOption: "b", correctOption: "b", isCorrect: true }
    ],
    questionSnapshot: [],
    revealPolicy: "score_only",
    createdAt: "2026-06-03T11:00:00Z"
  },
  {
    attemptId: "DA_006",
    uid: "student_u3",
    studentId: "651101003",
    studentName: "นางสาวเบญจมาศ เพ็ชรทับ",
    studentEmail: "benjamas.p@stin.ac.th",
    section: "ห้อง A2",
    year: "2569",
    quizSetId: "QS003",
    quizSetTitle: "แบบทดสอบหลังทบทวน (Post-test) - วัดระดับประเมินความพร้อมสู่การสอบจริง",
    quizType: "post",
    attemptNo: 1,
    submittedAt: "2026-06-11T14:00:00Z",
    totalQuestions: 10,
    correctAnswers: 5,
    wrongAnswers: 5,
    scorePercentage: 50,
    passingCriteria: 60,
    topicPassingCriteria: 60,
    resultStatus: "ควรทบทวนเพิ่มเติม",
    reviewTopics: ["การฝากครรภ์", "ภาวะฉุกเฉินทางสูติกรรม"],
    topicScores: [
      { topicId: "T001", topicName: "การฝากครรภ์", totalQuestions: 2, correctAnswers: 1, scorePercentage: 50, status: "ควรทบทวนเพิ่มเติม" },
      { topicId: "T002", topicName: "การพยาบาลระยะคลอด", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", totalQuestions: 3, correctAnswers: 1, scorePercentage: 33.3, status: "ควรทบทวนเพิ่มเติม" },
      { topicId: "T006", topicName: "การดูแลทารกแรกเกิด", totalQuestions: 2, correctAnswers: 1, scorePercentage: 50.0, status: "ควรทบทวนเพิ่มเติม" }
    ],
    answers: [
      { questionId: "Q001", topicId: "T001", topicName: "การฝากครรภ์", selectedOption: "c", correctOption: "c", isCorrect: true },
      { questionId: "Q002", topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", selectedOption: "b", correctOption: "a", isCorrect: false },
      { questionId: "Q003", topicId: "T002", topicName: "การพยาบาลระยะคลอด", selectedOption: "b", correctOption: "b", isCorrect: true }
    ],
    questionSnapshot: [],
    revealPolicy: "full_reveal",
    createdAt: "2026-06-11T14:00:00Z"
  },

  // 4. นางสาวศิริพร บุญเหลือ (safe)
  {
    attemptId: "DA_007",
    uid: "student_u4",
    studentId: "651101004",
    studentName: "นางสาวศิริพร บุญเหลือ",
    studentEmail: "siriporn.b@stin.ac.th",
    section: "ห้อง A2",
    year: "2569",
    quizSetId: "QS001",
    quizSetTitle: "แบบทดสอบก่อนทบทวน (Pre-test) - ประสิทธิภาพและพื้นฐาน",
    quizType: "pre",
    attemptNo: 1,
    submittedAt: "2026-06-03T15:00:00Z",
    totalQuestions: 10,
    correctAnswers: 6,
    wrongAnswers: 4,
    scorePercentage: 60,
    passingCriteria: 60,
    topicPassingCriteria: 60,
    resultStatus: "ผ่านเกณฑ์",
    reviewTopics: ["การพยาบาลระยะคลอด"],
    topicScores: [
      { topicId: "T001", topicName: "การฝากครรภ์", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100, status: "ผ่านเกณฑ์" },
      { topicId: "T002", topicName: "การพยาบาลระยะคลอด", totalQuestions: 3, correctAnswers: 1, scorePercentage: 33.3, status: "ควรทบทวนเพิ่มเติม" },
      { topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T006", topicName: "การดูแลทารกแรกเกิด", totalQuestions: 2, correctAnswers: 1, scorePercentage: 50.0, status: "ควรทบทวนเพิ่มเติม" }
    ],
    answers: [
      { questionId: "Q001", topicId: "T001", topicName: "การฝากครรภ์", selectedOption: "c", correctOption: "c", isCorrect: true },
      { questionId: "Q002", topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", selectedOption: "a", correctOption: "a", isCorrect: true },
      { questionId: "Q003", topicId: "T002", topicName: "การพยาบาลระยะคลอด", selectedOption: "c", correctOption: "b", isCorrect: false }
    ],
    questionSnapshot: [],
    revealPolicy: "score_only",
    createdAt: "2026-06-03T15:00:00Z"
  },
  {
    attemptId: "DA_008",
    uid: "student_u4",
    studentId: "651101004",
    studentName: "นางสาวศิริพร บุญเหลือ",
    studentEmail: "siriporn.b@stin.ac.th",
    section: "ห้อง A2",
    year: "2569",
    quizSetId: "QS003",
    quizSetTitle: "แบบทดสอบหลังทบทวน (Post-test) - วัดระดับประเมินความพร้อมสู่การสอบจริง",
    quizType: "post",
    attemptNo: 1,
    submittedAt: "2026-06-11T15:30:00Z",
    totalQuestions: 10,
    correctAnswers: 7,
    wrongAnswers: 3,
    scorePercentage: 70,
    passingCriteria: 60,
    topicPassingCriteria: 60,
    resultStatus: "ผ่านเกณฑ์",
    reviewTopics: [],
    topicScores: [
      { topicId: "T001", topicName: "การฝากครรภ์", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100, status: "ผ่านเกณฑ์" },
      { topicId: "T002", topicName: "การพยาบาลระยะคลอด", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T006", topicName: "การดูแลทารกแรกเกิด", totalQuestions: 2, correctAnswers: 1, scorePercentage: 50.0, status: "ควรทบทวนเพิ่มเติม" }
    ],
    answers: [
      { questionId: "Q001", topicId: "T001", topicName: "การฝากครรภ์", selectedOption: "c", correctOption: "c", isCorrect: true },
      { questionId: "Q002", topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", selectedOption: "a", correctOption: "a", isCorrect: true },
      { questionId: "Q003", topicId: "T002", topicName: "การพยาบาลระยะคลอด", selectedOption: "b", correctOption: "b", isCorrect: true }
    ],
    questionSnapshot: [],
    revealPolicy: "full_reveal",
    createdAt: "2026-06-11T15:30:00Z"
  },

  // 5. นายปกรณ์ เกียรติวรวงศ์ (risk - only pre, no post, score 37.5%)
  {
    attemptId: "DA_009",
    uid: "student_u5",
    studentId: "651101005",
    studentName: "นายปกรณ์ เกียรติวรวงศ์",
    studentEmail: "pakorn.k@stin.ac.th",
    section: "ห้อง B1",
    year: "2569",
    quizSetId: "QS001",
    quizSetTitle: "แบบทดสอบก่อนทบทวน (Pre-test) - ประสิทธิภาพและพื้นฐาน",
    quizType: "pre",
    attemptNo: 1,
    submittedAt: "2026-06-04T08:00:00Z",
    totalQuestions: 10,
    correctAnswers: 3,
    wrongAnswers: 7,
    scorePercentage: 30,
    passingCriteria: 60,
    topicPassingCriteria: 60,
    resultStatus: "ควรทบทวนเพิ่มเติม",
    reviewTopics: ["การฝากครรภ์", "การพยาบาลระยะคลอด", "ภาวะฉุกเฉินทางสูติกรรม"],
    topicScores: [
      { topicId: "T001", topicName: "การฝากครรภ์", totalQuestions: 2, correctAnswers: 0, scorePercentage: 0, status: "ควรทบทวนเพิ่มเติม" },
      { topicId: "T002", topicName: "การพยาบาลระยะคลอด", totalQuestions: 3, correctAnswers: 1, scorePercentage: 33.3, status: "ควรทบทวนเพิ่มเติม" },
      { topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", totalQuestions: 3, correctAnswers: 1, scorePercentage: 33.3, status: "ควรทบทวนเพิ่มเติม" },
      { topicId: "T006", topicName: "การดูแลทารกแรกเกิด", totalQuestions: 2, correctAnswers: 1, scorePercentage: 50.0, status: "ควรทบทวนเพิ่มเติม" }
    ],
    answers: [
      { questionId: "Q001", topicId: "T001", topicName: "การฝากครรภ์", selectedOption: "a", correctOption: "c", isCorrect: false },
      { questionId: "Q002", topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", selectedOption: "c", correctOption: "a", isCorrect: false },
      { questionId: "Q003", topicId: "T002", topicName: "การพยาบาลระยะคลอด", selectedOption: "a", correctOption: "b", isCorrect: false }
    ],
    questionSnapshot: [],
    revealPolicy: "score_only",
    createdAt: "2026-06-04T08:00:00Z"
  },

  // 6. นางสาวณิชาภา รักดี (safe)
  {
    attemptId: "DA_010",
    uid: "student_u6",
    studentId: "651101006",
    studentName: "นางสาวณิชาภา รักดี",
    studentEmail: "nichapa.r@stin.ac.th",
    section: "ห้อง B1",
    year: "2569",
    quizSetId: "QS001",
    quizSetTitle: "แบบทดสอบก่อนทบทวน (Pre-test) - ประสิทธิภาพและพื้นฐาน",
    quizType: "pre",
    attemptNo: 1,
    submittedAt: "2026-06-04T11:00:00Z",
    totalQuestions: 10,
    correctAnswers: 5,
    wrongAnswers: 5,
    scorePercentage: 50,
    passingCriteria: 60,
    topicPassingCriteria: 60,
    resultStatus: "ควรทบทวนเพิ่มเติม",
    reviewTopics: ["การฝากครรภ์", "ภาวะฉุกเฉินทางสูติกรรม"],
    topicScores: [
      { topicId: "T001", topicName: "การฝากครรภ์", totalQuestions: 2, correctAnswers: 1, scorePercentage: 50, status: "ควรทบทวนเพิ่มเติม" },
      { topicId: "T002", topicName: "การพยาบาลระยะคลอด", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", totalQuestions: 3, correctAnswers: 1, scorePercentage: 33.3, status: "ควรทบทวนเพิ่มเติม" },
      { topicId: "T006", topicName: "การดูแลทารกแรกเกิด", totalQuestions: 2, correctAnswers: 1, scorePercentage: 50.0, status: "ควรทบทวนเพิ่มเติม" }
    ],
    answers: [
      { questionId: "Q001", topicId: "T001", topicName: "การฝากครรภ์", selectedOption: "b", correctOption: "c", isCorrect: false },
      { questionId: "Q002", topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", selectedOption: "d", correctOption: "a", isCorrect: false },
      { questionId: "Q003", topicId: "T002", topicName: "การพยาบาลระยะคลอด", selectedOption: "b", correctOption: "b", isCorrect: true }
    ],
    questionSnapshot: [],
    revealPolicy: "score_only",
    createdAt: "2026-06-04T11:00:00Z"
  },
  {
    attemptId: "DA_011",
    uid: "student_u6",
    studentId: "651101006",
    studentName: "นางสาวณิชาภา รักดี",
    studentEmail: "nichapa.r@stin.ac.th",
    section: "ห้อง B1",
    year: "2569",
    quizSetId: "QS003",
    quizSetTitle: "แบบทดสอบหลังทบทวน (Post-test) - วัดระดับประเมินความพร้อมสู่การสอบจริง",
    quizType: "post",
    attemptNo: 1,
    submittedAt: "2026-06-11T16:00:00Z",
    totalQuestions: 10,
    correctAnswers: 7,
    wrongAnswers: 3,
    scorePercentage: 70,
    passingCriteria: 60,
    topicPassingCriteria: 60,
    resultStatus: "ผ่านเกณฑ์",
    reviewTopics: [],
    topicScores: [
      { topicId: "T001", topicName: "การฝากครรภ์", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100, status: "ผ่านเกณฑ์" },
      { topicId: "T002", topicName: "การพยาบาลระยะคลอด", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T006", topicName: "การดูแลทารกแรกเกิด", totalQuestions: 2, correctAnswers: 1, scorePercentage: 50, status: "ควรทบทวนเพิ่มเติม" }
    ],
    answers: [
      { questionId: "Q001", topicId: "T001", topicName: "การฝากครรภ์", selectedOption: "c", correctOption: "c", isCorrect: true },
      { questionId: "Q002", topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", selectedOption: "a", correctOption: "a", isCorrect: true },
      { questionId: "Q003", topicId: "T002", topicName: "การพยาบาลระยะคลอด", selectedOption: "b", correctOption: "b", isCorrect: true }
    ],
    questionSnapshot: [],
    revealPolicy: "full_reveal",
    createdAt: "2026-06-11T16:00:00Z"
  },

  // 7. นางสาวพิมพิศา สมบูรณ์ (excellent)
  {
    attemptId: "DA_012",
    uid: "student_u7",
    studentId: "651101007",
    studentName: "นางสาวพิมพิศา สมบูรณ์",
    studentEmail: "pimpisa.s@stin.ac.th",
    section: "ห้อง A1",
    year: "2569",
    quizSetId: "QS001",
    quizSetTitle: "แบบทดสอบก่อนทบทวน (Pre-test) - ประสิทธิภาพและพื้นฐาน",
    quizType: "pre",
    attemptNo: 1,
    submittedAt: "2026-06-05T09:00:00Z",
    totalQuestions: 10,
    correctAnswers: 8,
    wrongAnswers: 2,
    scorePercentage: 80,
    passingCriteria: 60,
    topicPassingCriteria: 60,
    resultStatus: "ผ่านเกณฑ์",
    reviewTopics: [],
    topicScores: [
      { topicId: "T001", topicName: "การฝากครรภ์", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100, status: "ผ่านเกณฑ์" },
      { topicId: "T002", topicName: "การพยาบาลระยะคลอด", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T006", topicName: "การดูแลทารกแรกเกิด", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100, status: "ผ่านเกณฑ์" }
    ],
    answers: [
      { questionId: "Q001", topicId: "T001", topicName: "การฝากครรภ์", selectedOption: "c", correctOption: "c", isCorrect: true },
      { questionId: "Q002", topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", selectedOption: "a", correctOption: "a", isCorrect: true },
      { questionId: "Q003", topicId: "T002", topicName: "การพยาบาลระยะคลอด", selectedOption: "b", correctOption: "b", isCorrect: true }
    ],
    questionSnapshot: [],
    revealPolicy: "score_only",
    createdAt: "2026-06-05T09:00:00Z"
  },
  {
    attemptId: "DA_013",
    uid: "student_u7",
    studentId: "651101007",
    studentName: "นางสาวพิมพิศา สมบูรณ์",
    studentEmail: "pimpisa.s@stin.ac.th",
    section: "ห้อง A1",
    year: "2569",
    quizSetId: "QS003",
    quizSetTitle: "แบบทดสอบหลังทบทวน (Post-test) - วัดระดับประเมินความพร้อมสู่การสอบจริง",
    quizType: "post",
    attemptNo: 1,
    submittedAt: "2026-06-11T17:00:00Z",
    totalQuestions: 10,
    correctAnswers: 9,
    wrongAnswers: 1,
    scorePercentage: 90,
    passingCriteria: 60,
    topicPassingCriteria: 60,
    resultStatus: "ผ่านเกณฑ์",
    reviewTopics: [],
    topicScores: [
      { topicId: "T001", topicName: "การฝากครรภ์", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100, status: "ผ่านเกณฑ์" },
      { topicId: "T002", topicName: "การพยาบาลระยะคลอด", totalQuestions: 3, correctAnswers: 3, scorePercentage: 100, status: "ผ่านเกณฑ์" },
      { topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T006", topicName: "การดูแลทารกแรกเกิด", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100, status: "ผ่านเกณฑ์" }
    ],
    answers: [
      { questionId: "Q001", topicId: "T001", topicName: "การฝากครรภ์", selectedOption: "c", correctOption: "c", isCorrect: true },
      { questionId: "Q002", topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", selectedOption: "a", correctOption: "a", isCorrect: true },
      { questionId: "Q003", topicId: "T002", topicName: "การพยาบาลระยะคลอด", selectedOption: "b", correctOption: "b", isCorrect: true }
    ],
    questionSnapshot: [],
    revealPolicy: "full_reveal",
    createdAt: "2026-06-11T17:00:00Z"
  },

  // 8. นายอภิสิทธิ์ มั่นคง (risk - score 40 and 50)
  {
    attemptId: "DA_014",
    uid: "student_u8",
    studentId: "651101008",
    studentName: "นายอภิสิทธิ์ มั่นคง",
    studentEmail: "aphisit.m@stin.ac.th",
    section: "ห้อง A2",
    year: "2569",
    quizSetId: "QS001",
    quizSetTitle: "แบบทดสอบก่อนทบทวน (Pre-test) - ประสิทธิภาพและพื้นฐาน",
    quizType: "pre",
    attemptNo: 1,
    submittedAt: "2026-06-05T10:00:00Z",
    totalQuestions: 10,
    correctAnswers: 4,
    wrongAnswers: 6,
    scorePercentage: 40,
    passingCriteria: 60,
    topicPassingCriteria: 60,
    resultStatus: "ควรทบทวนเพิ่มเติม",
    reviewTopics: ["การฝากครรภ์", "การพยาบาลระยะคลอด"],
    topicScores: [
      { topicId: "T001", topicName: "การฝากครรภ์", totalQuestions: 2, correctAnswers: 0, scorePercentage: 0, status: "ควรทบทวนเพิ่มเติม" },
      { topicId: "T002", topicName: "การพยาบาลระยะคลอด", totalQuestions: 3, correctAnswers: 1, scorePercentage: 33.3, status: "ควรทบทวนเพิ่มเติม" },
      { topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T006", topicName: "การดูแลทารกแรกเกิด", totalQuestions: 2, correctAnswers: 1, scorePercentage: 50.0, status: "ควรทบทวนเพิ่มเติม" }
    ],
    answers: [
      { questionId: "Q001", topicId: "T001", topicName: "การฝากครรภ์", selectedOption: "b", correctOption: "c", isCorrect: false },
      { questionId: "Q002", topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", selectedOption: "a", correctOption: "a", isCorrect: true },
      { questionId: "Q003", topicId: "T002", topicName: "การพยาบาลระยะคลอด", selectedOption: "c", correctOption: "b", isCorrect: false }
    ],
    questionSnapshot: [],
    revealPolicy: "score_only",
    createdAt: "2026-06-05T10:00:00Z"
  },
  {
    attemptId: "DA_015",
    uid: "student_u8",
    studentId: "651101008",
    studentName: "นายอภิสิทธิ์ มั่นคง",
    studentEmail: "aphisit.m@stin.ac.th",
    section: "ห้อง A2",
    year: "2569",
    quizSetId: "QS003",
    quizSetTitle: "แบบทดสอบหลังทบทวน (Post-test) - วัดระดับประเมินความพร้อมสู่การสอบจริง",
    quizType: "post",
    attemptNo: 1,
    submittedAt: "2026-06-11T18:00:00Z",
    totalQuestions: 10,
    correctAnswers: 5,
    wrongAnswers: 5,
    scorePercentage: 50,
    passingCriteria: 60,
    topicPassingCriteria: 60,
    resultStatus: "ควรทบทวนเพิ่มเติม",
    reviewTopics: ["การฝากครรภ์", "การดูแลทารกแรกเกิด"],
    topicScores: [
      { topicId: "T001", topicName: "การฝากครรภ์", totalQuestions: 2, correctAnswers: 1, scorePercentage: 50, status: "ควรทบทวนเพิ่มเติม" },
      { topicId: "T002", topicName: "การพยาบาลระยะคลอด", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", totalQuestions: 3, correctAnswers: 1, scorePercentage: 33.3, status: "ควรทบทวนเพิ่มเติม" },
      { topicId: "T006", topicName: "การดูแลทารกแรกเกิด", totalQuestions: 2, correctAnswers: 1, scorePercentage: 50.0, status: "ควรทบทวนเพิ่มเติม" }
    ],
    answers: [
      { questionId: "Q001", topicId: "T001", topicName: "การฝากครรภ์", selectedOption: "c", correctOption: "c", isCorrect: true },
      { questionId: "Q002", topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", selectedOption: "b", correctOption: "a", isCorrect: false },
      { questionId: "Q003", topicId: "T002", topicName: "การพยาบาลระยะคลอด", selectedOption: "b", correctOption: "b", isCorrect: true }
    ],
    questionSnapshot: [],
    revealPolicy: "full_reveal",
    createdAt: "2026-06-11T18:00:00Z"
  },

  // 9. นางสาววรรณิษา ใจดี (safe)
  {
    attemptId: "DA_016",
    uid: "student_u9",
    studentId: "651101009",
    studentName: "นางสาววรรณิษา ใจดี",
    studentEmail: "wannisa.j@stin.ac.th",
    section: "ห้อง B1",
    year: "2569",
    quizSetId: "QS001",
    quizSetTitle: "แบบทดสอบก่อนทบทวน (Pre-test) - ประสิทธิภาพและพื้นฐาน",
    quizType: "pre",
    attemptNo: 1,
    submittedAt: "2026-06-05T11:00:00Z",
    totalQuestions: 10,
    correctAnswers: 5,
    wrongAnswers: 5,
    scorePercentage: 50,
    passingCriteria: 60,
    topicPassingCriteria: 60,
    resultStatus: "ควรทบทวนเพิ่มเติม",
    reviewTopics: ["การฝากครรภ์", "การพยาบาลระยะคลอด"],
    topicScores: [
      { topicId: "T001", topicName: "การฝากครรภ์", totalQuestions: 2, correctAnswers: 1, scorePercentage: 50, status: "ควรทบทวนเพิ่มเติม" },
      { topicId: "T002", topicName: "การพยาบาลระยะคลอด", totalQuestions: 3, correctAnswers: 1, scorePercentage: 33.3, status: "ควรทบทวนเพิ่มเติม" },
      { topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T006", topicName: "การดูแลทารกแรกเกิด", totalQuestions: 2, correctAnswers: 1, scorePercentage: 50.0, status: "ควรทบทวนเพิ่มเติม" }
    ],
    answers: [
      { questionId: "Q001", topicId: "T001", topicName: "การฝากครรภ์", selectedOption: "c", correctOption: "c", isCorrect: true },
      { questionId: "Q002", topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", selectedOption: "a", correctOption: "a", isCorrect: true },
      { questionId: "Q003", topicId: "T002", topicName: "การพยาบาลระยะคลอด", selectedOption: "a", correctOption: "b", isCorrect: false }
    ],
    questionSnapshot: [],
    revealPolicy: "score_only",
    createdAt: "2026-06-05T11:00:00Z"
  },
  {
    attemptId: "DA_017",
    uid: "student_u9",
    studentId: "651101009",
    studentName: "นางสาววรรณิษา ใจดี",
    studentEmail: "wannisa.j@stin.ac.th",
    section: "ห้อง B1",
    year: "2569",
    quizSetId: "QS003",
    quizSetTitle: "แบบทดสอบหลังทบทวน (Post-test) - วัดระดับประเมินความพร้อมสู่การสอบจริง",
    quizType: "post",
    attemptNo: 1,
    submittedAt: "2026-06-11T19:00:00Z",
    totalQuestions: 10,
    correctAnswers: 7,
    wrongAnswers: 3,
    scorePercentage: 70,
    passingCriteria: 60,
    topicPassingCriteria: 60,
    resultStatus: "ผ่านเกณฑ์",
    reviewTopics: [],
    topicScores: [
      { topicId: "T001", topicName: "การฝากครรภ์", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100, status: "ผ่านเกณฑ์" },
      { topicId: "T002", topicName: "การพยาบาลระยะคลอด", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T006", topicName: "การดูแลทารกแรกเกิด", totalQuestions: 2, correctAnswers: 1, scorePercentage: 50.0, status: "ควรทบทวนเพิ่มเติม" }
    ],
    answers: [
      { questionId: "Q001", topicId: "T001", topicName: "การฝากครรภ์", selectedOption: "c", correctOption: "c", isCorrect: true },
      { questionId: "Q002", topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", selectedOption: "a", correctOption: "a", isCorrect: true },
      { questionId: "Q003", topicId: "T002", topicName: "การพยาบาลระยะคลอด", selectedOption: "b", correctOption: "b", isCorrect: true }
    ],
    questionSnapshot: [],
    revealPolicy: "full_reveal",
    createdAt: "2026-06-11T19:00:00Z"
  },

  // 10. นางสาวอรธิดา พูนทรัพย์ (excellent)
  {
    attemptId: "DA_018",
    uid: "student_u10",
    studentId: "651101010",
    studentName: "นางสาวอรธิดา พูนทรัพย์",
    studentEmail: "onthida.p@stin.ac.th",
    section: "ห้อง B2",
    year: "2569",
    quizSetId: "QS001",
    quizSetTitle: "แบบทดสอบก่อนทบทวน (Pre-test) - ประสิทธิภาพและพื้นฐาน",
    quizType: "pre",
    attemptNo: 1,
    submittedAt: "2026-06-05T12:00:00Z",
    totalQuestions: 10,
    correctAnswers: 8,
    wrongAnswers: 2,
    scorePercentage: 80,
    passingCriteria: 60,
    topicPassingCriteria: 60,
    resultStatus: "ผ่านเกณฑ์",
    reviewTopics: [],
    topicScores: [
      { topicId: "T001", topicName: "การฝากครรภ์", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100, status: "ผ่านเกณฑ์" },
      { topicId: "T002", topicName: "การพยาบาลระยะคลอด", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T006", topicName: "การดูแลทารกแรกเกิด", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100, status: "ผ่านเกณฑ์" }
    ],
    answers: [
      { questionId: "Q001", topicId: "T001", topicName: "การฝากครรภ์", selectedOption: "c", correctOption: "c", isCorrect: true },
      { questionId: "Q002", topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", selectedOption: "a", correctOption: "a", isCorrect: true },
      { questionId: "Q003", topicId: "T002", topicName: "การพยาบาลระยะคลอด", selectedOption: "b", correctOption: "b", isCorrect: true }
    ],
    questionSnapshot: [],
    revealPolicy: "score_only",
    createdAt: "2026-06-05T12:00:00Z"
  },
  {
    attemptId: "DA_019",
    uid: "student_u10",
    studentId: "651101010",
    studentName: "นางสาวอรธิดา พูนทรัพย์",
    studentEmail: "onthida.p@stin.ac.th",
    section: "ห้อง B2",
    year: "2569",
    quizSetId: "QS003",
    quizSetTitle: "แบบทดสอบหลังทบทวน (Post-test) - วัดระดับประเมินความพร้อมสู่การสอบจริง",
    quizType: "post",
    attemptNo: 1,
    submittedAt: "2026-06-11T20:00:00Z",
    totalQuestions: 10,
    correctAnswers: 9,
    wrongAnswers: 1,
    scorePercentage: 90,
    passingCriteria: 60,
    topicPassingCriteria: 60,
    resultStatus: "ผ่านเกณฑ์",
    reviewTopics: [],
    topicScores: [
      { topicId: "T001", topicName: "การฝากครรภ์", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100, status: "ผ่านเกณฑ์" },
      { topicId: "T002", topicName: "การพยาบาลระยะคลอด", totalQuestions: 3, correctAnswers: 3, scorePercentage: 100, status: "ผ่านเกณฑ์" },
      { topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T006", topicName: "การดูแลทารกแรกเกิด", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100, status: "ผ่านเกณฑ์" }
    ],
    answers: [
      { questionId: "Q001", topicId: "T001", topicName: "การฝากครรภ์", selectedOption: "c", correctOption: "c", isCorrect: true },
      { questionId: "Q002", topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", selectedOption: "a", correctOption: "a", isCorrect: true },
      { questionId: "Q003", topicId: "T002", topicName: "การพยาบาลระยะคลอด", selectedOption: "b", correctOption: "b", isCorrect: true }
    ],
    questionSnapshot: [],
    revealPolicy: "full_reveal",
    createdAt: "2026-06-11T20:00:00Z"
  },

  // Extra practice attempt to make exactly 20 (นางสาวกานดา)
  {
    attemptId: "DA_020",
    uid: "student_u1",
    studentId: "651101001",
    studentName: "นางสาวกานดา วิชิตสกุล",
    studentEmail: "kanda.w@stin.ac.th",
    section: "ห้อง A1",
    year: "2569",
    quizSetId: "QS002",
    quizSetTitle: "แบบฝึกข้อสอบสถานการณ์ (Practice Mode) - เน้นข้อสอบสถานการณ์ผดุงครรภ์ 01",
    quizType: "practice",
    attemptNo: 1,
    submittedAt: "2026-06-08T15:00:00Z",
    totalQuestions: 10,
    correctAnswers: 8,
    wrongAnswers: 2,
    scorePercentage: 80,
    passingCriteria: 60,
    topicPassingCriteria: 60,
    resultStatus: "ผ่านเกณฑ์",
    reviewTopics: [],
    topicScores: [
      { topicId: "T001", topicName: "การฝากครรภ์", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100, status: "ผ่านเกณฑ์" },
      { topicId: "T002", topicName: "การพยาบาลระยะคลอด", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", totalQuestions: 3, correctAnswers: 2, scorePercentage: 66.7, status: "ผ่านเกณฑ์" },
      { topicId: "T006", topicName: "การดูแลทารกแรกเกิด", totalQuestions: 2, correctAnswers: 2, scorePercentage: 100, status: "ผ่านเกณฑ์" }
    ],
    answers: [
      { questionId: "Q001", topicId: "T001", topicName: "การฝากครรภ์", selectedOption: "c", correctOption: "c", isCorrect: true },
      { questionId: "Q002", topicId: "T004", topicName: "ภาวะฉุกเฉินทางสูติกรรม", selectedOption: "a", correctOption: "a", isCorrect: true },
      { questionId: "Q003", topicId: "T002", topicName: "การพยาบาลระยะคลอด", selectedOption: "b", correctOption: "b", isCorrect: true }
    ],
    questionSnapshot: [],
    revealPolicy: "full_reveal",
    createdAt: "2026-06-08T15:00:00Z"
  }
];
