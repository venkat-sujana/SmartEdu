import { jsPDF } from "jspdf";
import "jspdf-autotable";

const generateAdmissionCertificatePDF = async (student) => {
  const doc = new jsPDF();

  // 1. ఫోటో లోడ్ చేసే ఫంక్షన్
  const loadImage = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  // 2. PDF బేసిక్ సెటప్
  // బార్డర్
  doc.setDrawColor(0);
  doc.setLineWidth(1);
  doc.rect(10, 10, 190, 277);

  // కళాశాల పేరు
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("S.K.R.GOVERNMENT JUNIOR COLLEGE-GUDUR", 105, 30, {
    align: "center",
  });

  doc.setFontSize(14);
  doc.setFont("helvetica", "italic");
  doc.text("THILAK NAGAR, GUDUR--524101,TIRUPATI Dt", 105, 38, {
    align: "center",
  });

  // హారిజాంటల్ లైన్
  doc.setLineWidth(0.5);
  doc.line(20, 45, 190, 45);

  // సర్టిఫికేట్ టైటిల్
  doc.setFontSize(18);
  doc.setFont("times", "bold");
  doc.text("ADMISSION CERTIFICATE", 105, 60, { align: "center" });

  // 3. ఫోటో సెక్షన్
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.rect(140, 65, 32, 33); // ఫోటో ఫ్రేమ్
  
//   doc.setFontSize(10);
//   doc.text(`${student.name}`, 140, 63);

  if (student.photo) {
    try {
      const img = await loadImage(student.photo);
      
      if (img) {
        doc.addImage(img, 'JPEG', 141, 66, 30, 30); // ఫోటోని జోడించడం
      } else {
        doc.setFontSize(12);
        doc.text("No Photo", 150, 90);
      }
    } catch (err) {
      console.error("Error loading photo:", err);
      doc.setFontSize(12);
      doc.text("No Photo", 150, 90);
    }
  } else {
    doc.setFontSize(12);
    doc.text("No Photo", 150, 90);
  }
  
  doc.setFontSize(12);
  doc.text(`${student.name}`, 148, 104);
  doc.setFont("helvetica", "normal");




  // 4. స్టూడెంట్ వివరాలు
  let y = 70;
  doc.setFontSize(12);
  doc.setFont("times", "normal");

  doc.text(
    `This is to certify that the following student has been admitted`,
    20,
    y
  );
  y += 10;
  doc.text(
    `into the institution for the academic year ${student.admissionYear}-${
      student.admissionYear + 1
    }`,
    20,
    y
  );

  y += 10;
  doc.setFont("times", "bold");
  doc.text("Student Details", 20, y);

  y += 5;
  doc.setFont("times", "normal");
  doc.text(`Name             : ${student.name}`, 30, y);
  y += 10;
  doc.text(`Father's Name    : ${student.fatherName}`, 30, y);
  y += 10;
  doc.text(
    `Date of Birth    : ${new Date(student.dob).toLocaleDateString("en-GB")}`,
    30,
    y
  );
  y += 10;
  doc.text(`Gender           : ${student.gender}`, 30, y);
  y += 10;
  doc.text(`Caste            : ${student.caste}`, 30, y);
  y += 10;
  doc.text(`Group            : ${student.group}`, 30, y);
  y += 10;
  doc.text(`Mobile Number    : ${student.mobile}`, 30, y);
  y += 10;
  doc.text(`Admission No    : ${student.admissionNo}`, 30, y);

  y += 10;
  doc.text(
    `Date of Admission: ${new Date(student.createdAt).toLocaleDateString(
      "en-GB"
    )}`,
    30,
    y
  );

  y += 10;
  doc.setFont("times", "italic");
  doc.text(
    "This certificate is issued on request of the student for official purposes.",
    20,
    y
  );

  // 5. సిగ్నేచర్ సెక్షన్
  y += 30;
  doc.setFont("times", "bold");
  doc.text("Signature", 160, y);
  doc.setFont("times", "normal");
  doc.text("(Principal/Head of Institution)", 130, y + 7);

  // 6. PDFని సేవ్ చేయడం
  doc.save(`admission-certificate-${student.name}.pdf`);
};

export default generateAdmissionCertificatePDF;