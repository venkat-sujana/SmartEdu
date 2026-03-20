import { isFast2SmsConfigured, sendFast2Sms } from "@/lib/sms/providers/fast2sms";

function getSmsProviderName() {
  return process.env.SMS_PROVIDER || "fast2sms";
}

export function isSmsConfigured() {
  const provider = getSmsProviderName();
  if (provider === "fast2sms") {
    return isFast2SmsConfigured();
  }

  return false;
}

export function getSmsProviderMeta() {
  return {
    provider: getSmsProviderName(),
    configured: isSmsConfigured(),
  };
}

export async function sendSms({ to, message }) {
  const provider = getSmsProviderName();

  if (provider === "fast2sms") {
    return sendFast2Sms({ to, message });
  }

  throw new Error(`Unsupported SMS provider: ${provider}`);
}
