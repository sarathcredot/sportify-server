const { z } = require("zod");

const bankAccountSchema = z.object({

    accountHolderName: z.string().min(1, "Account holder name is required"),
    accountNumber: z.string().min(1, "Account number is required"),

    accountType: z.enum(["savings", "current"], {
        required_error: "Account type is required",
    }),

    ifscCode: z.string().min(1, "IFSC code is required"),

    bankName: z.string().min(1, "Bank name is required"),

    branchName: z.string().optional(),

    currency: z.enum(["INR", "USD", "EUR"]).default("INR"),

    isInternational: z.boolean().default(false),

    swiftCode: z.string().optional(),

    iban: z.string().optional(),

    razorpayContactId: z.string().optional(),

    razorpayFundAccountId: z.string().optional(),

    accountVerificationStatus: z
        .enum(["pending", "verified", "failed"])
        .default("pending"),

    panNumber: z.string().min(1, "PAN number is required"),

    gstin: z.string().optional(),

    taxResidency: z.string().optional(),

    isPrimary: z.boolean().default(true),
});

module.exports = {
    bankAccountSchema,
};
