export const GENERAL_STREAMS = ["MPC", "BIPC", "CEC", "HEC"];
export const VOCATIONAL_STREAMS = ["M&AT", "CET", "MLT"];

export function getSubjectsForStream(stream) {
  if (!stream) return [];

  if (GENERAL_STREAMS.includes(stream)) {
    return [
      "Telugu/Sanskrit/Hindi",
      "English",
      "Maths",
      "Civics",
      "Biology",
      "Physics",
      "Economics",
      "Chemistry",
      "commerce"
    ];
  }

  if (VOCATIONAL_STREAMS.includes(stream)) {
    return ["GFC", "English", "V1/V4", "V2/V5", "V3/V6"];
  }

  return [];
}
