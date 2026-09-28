export const GENERAL_STREAMS = ["MPC", "BIPC", "CEC", "HEC"];

export const VOCATIONAL_STREAMS = ["M&AT", "CET", "MLT"];

export const GENERAL_STREAM_SUBJECTS = {
  MPC: [
    "Telugu/Sanskrit/Hindi",
    "English",
    "Maths",
    "Physics",
    "Chemistry",
  ],

  BIPC: [
    "Telugu/Sanskrit/Hindi",
    "English",
    "Botany",
    "Zoology",
    "Physics",
    "Chemistry",
  ],

  CEC: [
    "Telugu/Sanskrit/Hindi",
    "English",
    "Commerce",
    "Economics",
    "Civics",
  ],

  HEC: [
    "Telugu/Sanskrit/Hindi",
    "English",
    "History",
    "Economics",
    "Civics",
  ],
};

export function getSubjectsForStream(stream) {
  if (!stream) return [];

  const normalizedStream =
    stream === "BiPC" ? "BIPC" : stream;

  if (GENERAL_STREAMS.includes(normalizedStream)) {
    return GENERAL_STREAM_SUBJECTS[normalizedStream] || [];
  }

  if (VOCATIONAL_STREAMS.includes(stream)) {
    return [
      "GFC",
      "English",
      "V1/V4",
      "V2/V5",
      "V3/V6",
    ];
  }

  return [];
}