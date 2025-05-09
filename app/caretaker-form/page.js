
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const generateCaretakerCertificatePDF = async (student) => {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();

    // Watermark
    doc.saveGraphicsState();
    doc.setFontSize(30);
    doc.setTextColor(200);
    doc.setFont("helvetica", "bold");
    doc.text("S.K.R.GJC", 105, 120, { align: "center", angle: 45 });
    doc.restoreGraphicsState();

    // Border
    doc.setDrawColor(0);
    doc.setLineWidth(1);
    doc.rect(10, 10, 190, 270);

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("S.K.R GOVERNMENT JUNIOR COLLEGE, GUDUR", 105, 25, {
      align: "center",
    });

    doc.setFontSize(13);
    doc.setFont("helvetica", "italic");
    doc.text("THILAK NAGAR, GUDUR - 524101, TIRUPATI Dt", 105, 32, {
      align: "center",
    });

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("CARE TAKER", 105, 42, { align: "center" });

    // Student Information
    doc.rect(160, 50, 30, 35);

    let y = 55;
    const x = 20;
    const gap = 6;

    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.text(`Student Name         : ${student.name}`, x, y);
    y += gap;
    doc.text(`Group                : ${student.group}`, x, y);
    y += gap;
    doc.text(`Gender               : ${student.gender}`, x, y);
    y += gap;
    doc.text(
      `Admission Date       : ${new Date(student.createdAt).toLocaleDateString(
        "en-GB"
      )}`,
      x,
      y
    );
    y += gap;
    doc.text(`Admission No.        : ${student.admissionNo}`, x, y);
    y += gap;
    doc.text(`Father Name          : ${student.fatherName}`, x, y);
    y += gap;
    doc.text(`Caste                : ${student.caste}`, x, y);
    y += gap;
    doc.text(
      `Date of Birth        : ${new Date(student.dob).toLocaleDateString(
        "en-GB"
      )}`,
      x,
      y
    );
    y += gap;
    doc.text(`Address              : ${student.address}`, x, y);
    y += gap;
    doc.text(`Mobile No.           : ${student.mobile}`, x, y);
    y += gap;

    // Exam Performance Table
    y = 120;
    doc.setFont("times", "bold");
    doc.text("Home Examinations", 15, y);

    const examHeaders = [
      "Exam",
      "Tel/Sansk",
      "English",
      "Math/Bot/Civ",
      "Math/Zool/His",
      "Phy/Eco",
      "Che/Com",
      "Total",
      "%",
      "Remarks",
    ];
    const examData = Array(7)
      .fill(["", "", "", "", "", "", "", "", "", ""])
      .map((row, i) => [
        [
          "Unit-I",
          "Unit-II",
          "Qtrly",
          "Unit-III",
          "Unit-IV",
          "Half Yrly",
          "Pre-Final",
        ][i],
        ...row,
      ]);

    autoTable(doc, {
      startY: y + 5,
      head: [examHeaders],
      body: examData,
      theme: "grid",
      styles: { fontSize: 9, lineWidth: 0.5, lineColor: [0, 0, 0] },
      headStyles: {
        fillColor: [50, 50, 50],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        lineColor: [0, 0, 0],
      },
    });

    // Attendance Table
    y = doc.lastAutoTable.finalY + 5;
    doc.setFont("times", "bold");
    doc.text("Monthly Attendance", 20, y);

    const monthHeaders = [
      "Month",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
      "JAN",
      "FEB",
      "MAR",
      "TOTAL",
    ];
    const attendanceData = [
      ["Working Days", "", "", "", "", "", "", "", "", "", "", ""],
      ["Present", "", "", "", "", "", "", "", "", "", "", ""],
      ["Percent", "", "", "", "", "", "", "", "", "", "", ""],
    ];

    autoTable(doc, {
      startY: y + 5,
      head: [monthHeaders],
      body: attendanceData,
      theme: "grid",
      styles: { fontSize: 9, lineWidth: 0.5, lineColor: [0, 0, 0] },
      headStyles: { lineColor: [0, 0, 0] },
    });

    // Footer
    y = doc.lastAutoTable.finalY + 10;
    doc.setFont("times", "bold");
    doc.text("Place: GUDUR", 20, y);
    doc.text(`Date: ${new Date().toLocaleDateString("en-GB")}`, 20, y + 8);
    doc.text("Signature", 150, y + 8);
    doc.setFont("times", "normal");
    doc.text("(Signature of the Student)", 125, y + 15);

    // Photo Handling
    if (student.photo) {
      try {
        if (student.photo.startsWith("data:image")) {
          doc.addImage(student.photo, "JPEG", 160, 50, 30, 35);
        } else {
          let imageUrl = student.photo;

          if (
            !imageUrl.startsWith("http") &&
            process.env.NODE_ENV === "production"
          ) {
            imageUrl = `https://${
              process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL
            }${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
          }

          if (
            !imageUrl.startsWith("http") &&
            process.env.NODE_ENV !== "production"
          ) {
            imageUrl = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
          }

          const response = await fetch(imageUrl);
          if (!response.ok)
            throw new Error(`Failed to fetch image: ${response.status}`);

          const blob = await response.blob();
          const base64Data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          doc.addImage(base64Data, "JPEG", 160, 50, 30, 35);
        }
      } catch (error) {
        console.error("Photo loading error:", error);
        doc.setFontSize(10);
        doc.text("Photo not available", 160, 70);
      }
    } else {
      doc.setFontSize(10);
      doc.text("Photo not provided", 160, 70);
    }

    doc.save(`caretaker-form-${student.name}.pdf`);
  };
  export default generateCaretakerCertificatePDF;