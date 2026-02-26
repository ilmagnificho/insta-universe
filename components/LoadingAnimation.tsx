"use client";

import { useEffect, useRef } from "react";

interface LoadingAnimationProps {
  message?: string;
}

export default function LoadingAnimation({
  message = "우주 생성 중...",
}: LoadingAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 300;
    const height = 300;
    canvas.width = width;
    canvas.height = height;

    const particles: {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      size: number;
      color: string;
      speed: number;
      angle: number;
    }[] = [];

    const colors = [
      "#4fc3f7",
      "#ff8a65",
      "#aed581",
      "#f48fb1",
      "#ffb74d",
      "#ce93d8",
      "#4dd0e1",
      "#81c784",
    ];

    // Create particles scattered around the canvas
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 100 + Math.random() * 50;
      particles.push({
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist,
        targetX: width / 2 + (Math.random() - 0.5) * 60,
        targetY: height / 2 + (Math.random() - 0.5) * 60,
        size: 1 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 0.005 + Math.random() * 0.01,
        angle: Math.random() * Math.PI * 2,
      });
    }

    let frame = 0;
    let animationId: number;

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      frame++;

      // Background glow
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        150
      );
      gradient.addColorStop(0, "rgba(124, 91, 245, 0.1)");
      gradient.addColorStop(1, "rgba(10, 10, 26, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      for (const p of particles) {
        // Slowly spiral toward center
        const progress = Math.min(1, frame * p.speed);
        p.x = p.x + (p.targetX - p.x) * 0.01;
        p.y = p.y + (p.targetY - p.y) * 0.01;

        // Add slight orbit
        p.angle += 0.02;
        const orbitX = Math.cos(p.angle) * 2;
        const orbitY = Math.sin(p.angle) * 2;

        ctx.beginPath();
        ctx.arc(p.x + orbitX, p.y + orbitY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.5 + Math.sin(frame * 0.05 + p.angle) * 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animationId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <canvas
        ref={canvasRef}
        className="h-[300px] w-[300px]"
        style={{ imageRendering: "auto" }}
      />
      <div className="flex flex-col items-center gap-2">
        <p className="text-lg font-medium text-white/90">{message}</p>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block h-2 w-2 rounded-full bg-[#7c5bf5]"
              style={{
                animation: `pulse-glow 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
