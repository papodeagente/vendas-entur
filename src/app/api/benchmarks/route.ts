import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const benchmarks = await prisma.benchmark.findMany();
  return NextResponse.json(benchmarks);
}
