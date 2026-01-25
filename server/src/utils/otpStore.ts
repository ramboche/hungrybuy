type OTPData = {
  otp: string;
  expiresAt: number;
  tries: number;
};

const OTP_EXPIRY = 2 * 60 * 1000;
const otpStore = new Map<string, OTPData>();

export function generateOtp(): string {
  // return Math.floor(100000 + Math.random() * 900000).toString();
  return "111111";
}

export function canRequestOtp(phone: string): boolean {
  const existing = otpStore.get(phone);
  if (!existing) return true;

  if (Date.now() > existing.expiresAt) {
    otpStore.delete(phone);
    return true;
  }

  return false;
}

export function saveOtp(phone: string, otp: string) {
  const expiresAt = Date.now() + OTP_EXPIRY;

  otpStore.set(phone, { otp, expiresAt, tries: 0 });
}

export function verifyOtp(phone: string, otp: string): boolean {
  const data = otpStore.get(phone);
  if (!data) return false;

  if (Date.now() > data.expiresAt) {
    otpStore.delete(phone);
    return false;
  }

  if (data.tries >= 3) {
    otpStore.delete(phone);
    return false;
  }

  if (data.otp !== otp) {
    data.tries++;
    return false;
  }
  
  return true;
}


export function deleteOtp(phone: string) {
  otpStore.delete(phone);
}
