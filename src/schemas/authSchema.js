const { z } = require("zod");
const { OTP_LENGTH } = require("../utils/constants");

const loginSchema = z.object({
  email: z.string().nonempty({ message: "Email is required" }),
  password: z.string().nonempty({ message: "Password is required" }),
});

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

const updateUserSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  isVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
}).openapi({
  example: {
    fullName: "John Doe",
    email: "john.doe@example.com",
    phoneNumber: "+1234567890",
    isVerified: true,
    isActive: true,
  }
})

module.exports = {
  sendOTPSchema,
  verifyOTPSchema,
  registerSchema,
  loginSchema,
  updateUserSchema,
};
