import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.researchProject.findMany({
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        query: true,
        mode: true,
        status: true,
        createdAt: true
      }
    });

    return NextResponse.json(projects);
  } catch (error: any) {
    console.error("API Route /api/research/history error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";
