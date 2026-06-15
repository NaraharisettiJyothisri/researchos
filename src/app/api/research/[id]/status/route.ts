import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.researchProject.findUnique({
      where: { id },
      include: {
        plan: true,
        report: true,
        sources: true,
        facts: true
      }
    });

    if (!project) {
      return NextResponse.json({ error: "Research project not found." }, { status: 404 });
    }

    // Parse steps progress from project's temporary log storage
    let steps = [];
    if (project.error) {
      try {
        const parsed = JSON.parse(project.error);
        if (Array.isArray(parsed)) {
          steps = parsed;
        } else if (parsed && parsed.steps) {
          steps = parsed.steps;
        }
      } catch (e) {
        // Fallback for simple string error
      }
    }

    return NextResponse.json({
      id: project.id,
      query: project.query,
      mode: project.mode,
      status: project.status,
      createdAt: project.createdAt,
      steps,
      plan: project.plan ? {
        steps: JSON.parse(project.plan.steps),
        metrics: JSON.parse(project.plan.metrics),
        entities: JSON.parse(project.plan.entities),
        dateRange: project.plan.dateRange
      } : null,
      report: project.report ? {
        summary: project.report.summary,
        keyFindings: JSON.parse(project.report.keyFindings),
        statsTable: JSON.parse(project.report.statsTable),
        chartData: JSON.parse(project.report.chartData),
        confidenceScore: project.report.confidenceScore,
        outlierAnalysis: project.report.outlierAnalysis,
        images: JSON.parse(project.report.images)
      } : null,
      sources: project.sources.map((s: any) => ({
        id: s.id,
        title: s.title,
        url: s.url,
        snippet: s.snippet,
        reliabilityScore: s.reliabilityScore
      })),
      facts: project.facts
    });

  } catch (error: any) {
    console.error("API Route /api/research/[id]/status error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
