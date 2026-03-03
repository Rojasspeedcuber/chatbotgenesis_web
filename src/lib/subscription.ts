import { prisma } from "./prisma";

const ADMIN_EMAIL = "henriquer01@rojasdev.cloud";

export async function checkSubscriptionAccess(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) return false;

  // Admin always has access
  if (user.email === ADMIN_EMAIL) return true;

  // Check for active subscription
  if (!user.subscription) return false;

  return ["ACTIVE", "AUTHORIZED"].includes(user.subscription.status);
}

export async function getSubscriptionStatus(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  return subscription;
}

export async function getUserWithSubscription(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });
}
