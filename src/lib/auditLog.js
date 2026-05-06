import AuditLog from "@/models/AuditLog";

function sanitizeValue(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "object") {
    const plain = typeof value.toObject === "function" ? value.toObject() : value;
    const next = {};
    Object.entries(plain).forEach(([key, nestedValue]) => {
      if (["password", "__v"].includes(key)) return;
      next[key] = sanitizeValue(nestedValue);
    });
    return next;
  }
  return value;
}

export function extractRequestIp(req) {
  const forwardedFor = req?.headers?.get?.("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return req?.headers?.get?.("x-real-ip") || "";
}

export async function createAuditLog({
  session,
  req,
  action,
  entity,
  entityId = "",
  message = "",
  before = null,
  after = null,
  metadata = null,
}) {
  try {
    const user = session?.user || {};
    await AuditLog.create({
      userId: String(user.id || user._id || ""),
      actorName: user.name || "",
      actorEmail: user.email || "",
      actorRole: user.role || "",
      action,
      entity,
      entityId: String(entityId || ""),
      message,
      before: sanitizeValue(before),
      after: sanitizeValue(after),
      metadata: sanitizeValue(metadata),
      ipAddress: extractRequestIp(req),
    });
  } catch (error) {
    console.error("Audit log write failed:", error);
  }
}
