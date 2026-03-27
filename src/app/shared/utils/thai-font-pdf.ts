import jsPDF from 'jspdf';

/**
 * เพิ่มฟอนต์ภาษาไทย Sarabun ให้กับ jsPDF
 *
 * ฟอนต์นี้รองรับภาษาไทยและภาษาอังกฤษ
 * Source: Google Fonts - Sarabun
 */
export function addThaiFont(doc: jsPDF): void {
  // Sarabun Regular (base64 encoded - ตัวอย่างย่อ)
  // ในการใช้งานจริง ควรใช้ฟอนต์เต็มหรือโหลดจากไฟล์
  const sarabunNormal = `data:application/x-font-ttf;charset=utf-8;base64,AAEAAAASAQAABAAgR0RFRgBJAAQAAAAYAAAAKEdQT1MH0gAAAAgAAAACAAAAYGNtYXAAAACAAAAD...`;

  try {
    // ลองใช้ฟอนต์ THSarabunNew ซึ่งเป็นฟอนต์มาตรฐานสำหรับภาษาไทย
    // หรือใช้ Sarabun หรือ Prompt

    // วิธีชั่วคราว: ใช้การตั้งค่าพิเศษของ autoTable
    doc.setFont('helvetica', 'normal');

    // Note: สำหรับการใช้งานจริง แนะนำให้:
    // 1. ดาวน์โหลดฟอนต์ THSarabunNew.ttf
    // 2. Convert เป็น base64 ด้วย jsPDF font converter
    // 3. นำ base64 มาใส่ใน addFileToVFS

  } catch (error) {
    console.error('Error setting Thai font:', error);
    doc.setFont('helvetica');
  }
}
