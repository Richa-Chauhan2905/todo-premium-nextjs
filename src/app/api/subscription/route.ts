import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  //capture payment

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const subscriptionEnds = new Date();
    subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isSubsribed: true,
        subsriptionEnds: subscriptionEnds,
      },
    });

    return NextResponse.json({
      message: "Subscription successful",
      subscriptionEnds: updatedUser.subsriptionEnds,
    });
  } catch (err) {
    console.error("Error updating user", err);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isSubsribed: true,
        subsriptionEnds: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const now = new Date();

    if (user.subsriptionEnds && user.subsriptionEnds < now) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isSubsribed: false,
          subsriptionEnds: null,
        },
      });
      return NextResponse.json({
        isSubscribed: false,
        subscriptionEnds: null,
      });
    }
    return NextResponse.json({
      isSubscribed: user.isSubsribed,
      subscriptionEnds: user.subsriptionEnds,
    });
  } catch (err) {
    console.error("Error updating user", err);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
