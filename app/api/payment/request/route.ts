import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "username이 필요합니다" },
        { status: 400 }
      );
    }

    const orderId = `INSTA-${Date.now()}-${randomUUID().slice(0, 8)}`;
    const amount = 4900;

    // A/B group assignment (simple random)
    const abGroup = Math.random() < 0.5 ? "demo" : "real";

    // Save payment record
    const supabase = createServerClient();
    const { error } = await supabase.from("payments").insert({
      order_id: orderId,
      username: username.toLowerCase().trim(),
      amount,
      status: "pending",
      ab_group: abGroup,
    });

    if (error) {
      console.error("Payment record insert error:", error);
      return NextResponse.json(
        { error: "결제 요청 생성에 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId,
      amount,
      clientKey: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
    });
  } catch (err) {
    console.error("Payment request error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
