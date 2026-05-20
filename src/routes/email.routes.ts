import { Router } from "express";
import { z } from "zod";
import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler";
import { auth } from "../middleware/auth";
import { prisma } from "../config/prisma";
import { ok, fail } from "../utils/apiResponse";

const router = Router();

// GET /email/status — check current email verification status
router.get(
  "/status",
  auth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        email: true,
        emailVerified: true,
        emailVerificationSentAt: true,
        lastVerifiedAt: true,
      },
    });

    let status: string;
    if (!user?.email) {
      status = "NOT_LINKED";
    } else if (user.emailVerified) {
      status = "VERIFIED";
    } else {
      status = "PENDING";
    }

    ok(res, {
      status,
      email: user?.email ?? null,
      emailVerified: user?.emailVerified ?? false,
      lastVerifiedAt: user?.lastVerifiedAt ?? null,
      verificationSentAt: user?.emailVerificationSentAt ?? null,
    });
  })
);

// POST /email/link — submit VCET email for linking
router.post(
  "/link",
  auth,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      email: z.string().email().regex(/@vcetputtur\.ac\.in$/i, "Must be @vcetputtur.ac.in"),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, "Invalid email", 400, parsed.error.flatten());
    const email = parsed.data.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== req.user!.id) {
      return fail(res, "Email already linked to another account", 409);
    }

    const token = crypto.randomInt(100000, 999999).toString();

    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        email,
        emailVerified: false,
        emailVerificationToken: token,
        emailVerificationSentAt: new Date(),
      },
    });

    // In V1, log the token instead of sending email
    console.log(`[EMAIL] Verification token for ${email}: ${token}`);

    ok(res, { message: "Verification code sent", email });
  })
);

// POST /email/verify — verify with token
router.post(
  "/verify",
  auth,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      token: z.string().min(1),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, "Token required", 400);

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { emailVerificationToken: true, emailVerified: true, email: true },
    });

    if (!user?.email) return fail(res, "No email linked", 400);
    if (user.emailVerified) return fail(res, "Already verified", 400);

    if (user.emailVerificationToken !== parsed.data.token) {
      return fail(res, "Invalid token", 400);
    }

    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        lastVerifiedAt: new Date(),
      },
    });

    ok(res, { message: "Email verified successfully" });
  })
);

// POST /email/resend — resend verification code
router.post(
  "/resend",
  auth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { email: true, emailVerified: true },
    });

    if (!user?.email) return fail(res, "No email linked", 400);
    if (user.emailVerified) return fail(res, "Already verified", 400);

    const token = crypto.randomInt(100000, 999999).toString();

    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        emailVerificationToken: token,
        emailVerificationSentAt: new Date(),
      },
    });

    console.log(`[EMAIL] Resent verification token for ${user.email}: ${token}`);

    ok(res, { message: "Verification code resent" });
  })
);

export default router;
