const FAST2SMS_ENDPOINT = "https://www.fast2sms.com/dev/bulkV2";

function getFast2SmsConfig() {
  return {
    apiKey: process.env.FAST2SMS_API_KEY || "",
    route: process.env.FAST2SMS_ROUTE || "q",
    language: process.env.FAST2SMS_LANGUAGE || "unicode",
    flash: Number(process.env.FAST2SMS_FLASH || 0),
  };
}

function containsNonAscii(value) {
  return /[^\x00-\x7F]/.test(String(value || ""));
}

export function isFast2SmsConfigured() {
  return Boolean(getFast2SmsConfig().apiKey);
}

export async function sendFast2Sms({ to, message }) {
  const config = getFast2SmsConfig();

  if (!config.apiKey) {
    throw new Error("FAST2SMS_API_KEY is not configured");
  }

  const response = await fetch(FAST2SMS_ENDPOINT, {
    method: "POST",
    headers: {
      authorization: config.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      route: config.route,
      language: containsNonAscii(message) ? "unicode" : config.language,
      flash: config.flash,
      numbers: to,
      message,
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.return === false) {
    throw new Error(
      result?.message?.join?.(", ") ||
      result?.message ||
      result?.error ||
      "Fast2SMS request failed"
    );
  }

  return result;
}
