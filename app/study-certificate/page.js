
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const generateStudyCertificatePDF = (student) => {
    const doc = new jsPDF();

    // Add Watermark
    doc.saveGraphicsState();
    doc.setFontSize(40);
    doc.setTextColor(200);
    doc.setFont("helvetica", "bold");
    doc.text("S.K.R.GJC", 105, 150, {
      align: "center",
      angle: 45,
    });
    doc.restoreGraphicsState();

    // Border
    doc.setDrawColor(0);
    doc.setLineWidth(1);
    doc.rect(10, 10, 190, 270);

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("S.K.R. GOVERNMENT JUNIOR COLLEGE - GUDUR", 105, 30, {
      align: "center",
    });

    doc.setFontSize(14);
    doc.setFont("helvetica", "italic");
    doc.text("THILAK NAGAR, GUDUR - 524101, TIRUPATI Dt", 105, 38, {
      align: "center",
    });

    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);

    // Certificate Title
    doc.setFontSize(18);
    doc.setFont("times", "bold");
    doc.text("STUDY & CONDUCT CERTIFICATE", 105, 60, { align: "center" });

    // Content
    let y = 75;
    const admissionYear = student.admissionYear;
    const leavingYear = admissionYear + 2;
    const currentDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });

    const paragraph = `This is to certify that Mr/Mrs/Kum ${student.name}, Son/Daughter of ${student.fatherName}, was a bonafide student of this college during the academic years ${admissionYear} to ${leavingYear}. During this period, his/her academic performance and conduct were found to be good/satisfactory.`;

    doc.setFontSize(13);
    doc.setFont("times", "normal");
    doc.text(paragraph, 25, y, {
      maxWidth: 160,
      align: "justify",
    });

    // Place & Date
    y += 50;
    doc.setFont("times", "bold");
    doc.text("Place: GUDUR", 25, y);
    doc.text(`Date: ${currentDate}`, 25, y + 10);

    // Signature
    y += 40;
    doc.setFont("times", "bold");
    doc.text("Signature", 150, y);
    doc.setFont("times", "normal");
    doc.text("(Principal/Head of Institution)", 120, y + 7);

    doc.save(`study-certificate-${student.name}.pdf`);
  };
  export default generateStudyCertificatePDF;