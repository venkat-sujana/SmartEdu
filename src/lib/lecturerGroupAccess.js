export function getLecturerGroupFromSubject(subject) {
  switch (subject) {
    case "MandAT":
      return "M&AT";
    case "CET":
      return "CET";
    case "MLT":
      return "MLT";
    case "Botany":
    case "Zoology":
      return "BiPC";
    case "Civics":
    case "Economics":
    case "Commerce":
      return "CEC";
    case "History":
      return "HEC";
    case "GFC":
      return "GFC";
    case "Maths":
    case "Physics":
    case "Chemistry":
    default:
      return "MPC";
  }
}

export function canLecturerAccessGroup(session, groupName) {
  if (session?.user?.role !== "lecturer") {
    return true;
  }

  const allowedGroup = getLecturerGroupFromSubject(session?.user?.subject);
  return allowedGroup === groupName;
}
