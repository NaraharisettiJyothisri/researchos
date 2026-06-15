import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { runDeepResearch } from "../../../../lib/agent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, mode } = body;

    if (!query || query.trim() === "") {
      return NextResponse.json({ error: "Research query is required." }, { status: 400 });
    }

    const modeName = mode || "deep";

    // 1. Create the database record
    const project = await prisma.researchProject.create({
      data: {
        query: query.trim(),
        mode: modeName,
        status: "pending"
      }
    });

    // 2. Start the research orchestrator asynchronously in the background
    runDeepResearch(project.id).catch(err => {
      console.error(`Background research task failed for project ${project.id}:`, err);
    });

    // 3. Return the project ID immediately for polling
    return NextResponse.json({ projectId: project.id }, { status: 201 });

  } catch (error: unknown) {

  console.error("API Route /api/research/create error:", error);

  const message =
    error instanceof Error
      ? error.message
      : "Internal Server Error";

  return NextResponse.json(
    { error: message },
    { status: 500 }
  );

  }
}
