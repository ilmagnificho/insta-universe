import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { confirmPayment } from "@/lib/toss";

export async function POST(req: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await req.json();

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: "결제 정보가 올바르지 않습니다" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Verify payment record exists and is pending
    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("*")
      .eq("order_id", orderId)
      .eq("status", "pending")
      .single();

    if (fetchError || !payment) {
      return NextResponse.json(
        { error: "유효하지 않은 결제 요청입니다" },
        { status: 400 }
      );
    }

    // Verify amount matches
    if (payment.amount !== amount) {
      return NextResponse.json(
        { error: "결제 금액이 일치하지 않습니다" },
        { status: 400 }
      );
    }

    // Confirm with Toss
    await confirmPayment({ paymentKey, orderId, amount });

    // Update payment status
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status: "confirmed",
        payment_key: paymentKey,
        confirmed_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);

    if (updateError) {
      console.error("Payment update error:", updateError);
    }

    return NextResponse.json({ success: true, username: payment.username });
  } catch (err) {
    console.error("Payment confirm error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "결제 승인에 실패했습니다",
      },
      { status: 500 }
    );
  }
}
