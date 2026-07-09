import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportLatePdf({
  records,
  fromDate,
  toDate,
  collegeName = "Government Junior College",
  academicYear = "",
}) {
  const doc = new jsPDF({
    orientation: "landscape",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(collegeName, pageWidth / 2, 15, {
    align: "center",
  });

  doc.setFontSize(13);
  doc.text("Late Entry Register", pageWidth / 2, 23, {
    align: "center",
  });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  doc.text(`From : ${fromDate}`, 14, 32);
  doc.text(`To : ${toDate}`, 70, 32);

  if (academicYear) {
    doc.text(
      `Academic Year : ${academicYear}`,
      pageWidth - 80,
      32
    );
  }

  autoTable(doc, {
    startY: 38,
    head: [[
      "Sl",
      "Date",
      "Adm No",
      "Student",
      "Group",
      "Year",
      "Late Time",
      "Lecturer",
    ]],
    body: records.map((r, i) => [
      i + 1,
      new Date(r.date).toLocaleDateString(),
      r.admissionNo,
      r.studentName,
      r.group,
      r.year,
      r.lateTime,
      r.lecturer,
    ]),
    theme: "grid",
    headStyles: {
      fillColor: [245, 158, 11],
    },
  });

  doc.save("LateEntryRegister.pdf");
}