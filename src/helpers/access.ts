import { useSession } from "next-auth/react";

const { data: session } = useSession();

export const hasPremiumAccess =
    session &&
    session.user.premiumAccess.valid &&
    session.user.premiumAccess.accessTill > new Date;

export const hasGraderAccess =
    session &&
    session.user.graderAccess.valid &&
    session.user.graderAccess.accessTill > new Date;