import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  if (process.env.DEV_SKIP_PAYMENT !== "true") {
    return NextResponse.json(
      { error: "개발 모드가 비활성화되어 있습니다" },
      { status: 403 }
    );
  }

  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json(
        { error: "username이 필요합니다" },
        { status: 400 }
      );
    }

    const orderId = `DEV-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const supabase = createServerClient();

    // Create a fake confirmed payment record
    const { error } = await supabase.from("payments").insert({
      order_id: orderId,
      username,
      amount: 0,
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
      ab_group: "dev",
    });

    if (error) {
      console.error("Dev payment insert error:", error);
      return NextResponse.json(
        { error: "테스트 레코드 생성 실패" },
        { status: 500 }
      );
    }

    return NextResponse.json({ orderId, username });
  } catch (err) {
    console.error("Dev start error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
