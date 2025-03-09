const { z } = require("zod");
const { OTP_LENGTH } = require("../utils/constants");

const sendOTPSchema = z.object({
  phoneNumber: z.string().nonempty({ message: "Phone number is required" }),
  countryCode: z.string().nonempty({ message: "Country code is required" }),
});

const registerSchema = z.object({
  phoneNumber: z.string().nonempty({ message: "Phone number is required" }),
  countryCode: z.string().nonempty({ message: "Country code is required" }),
  fullName: z.string().nonempty({ message: "Full name is required" }),
});

const verifyOTPSchema = z.object({
  phoneNumber: z.string().nonempty({ message: "Phone number is required" }),
  countryCode: z.string().nonempty({ message: "Country code is required" }),
  otp: z
    .string()
    .nonempty({ message: "OTP is required" })
    .length(OTP_LENGTH, {
      message: `OTP must be ${OTP_LENGTH} characters long`,
    }),
});

module.exports = {
  sendOTPSchema,
  verifyOTPSchema,
  registerSchema,
};
