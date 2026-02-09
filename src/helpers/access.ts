import { Session } from "next-auth";

export const hasPremiumAccess = (session: Session | null) =>
    session &&
    session.user.premiumAccess.valid &&
    session.user.premiumAccess.accessTill > new Date();

export const hasGraderAccess = (session: Session | null) =>
    session &&
    session.user.graderAccess.valid &&
    session.user.graderAccess.accessTill > new Date();