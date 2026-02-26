"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import type { UniverseData, Star } from "@/lib/types";
import StarTooltip from "./StarTooltip";

interface UniverseCanvasProps {
  data: UniverseData;
  blurred?: boolean;
}

export default function UniverseCanvas({
  data,
  blurred = false,
}: UniverseCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    star: Star;
    x: number;
    y: number;
  } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 1000 });

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width } = entry.contentRect;
        const size = Math.min(width, window.innerHeight * 0.8);
        setDimensions({ width: size, height: size });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleStarHover = useCallback(
    (star: Star | null, event?: MouseEvent) => {
      if (!star || !event) {
        setTooltip(null);
        return;
      }
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      setTooltip({
        star,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    },
    []
  );

  // D3 rendering
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const scaleX = width / 1000;
    const scaleY = height / 1000;

    // Background stars
    const bgStars = Array.from({ length: 200 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.2,
      delay: Math.random() * 5,
    }));

    svg
      .selectAll(".bg-star")
      .data(bgStars)
      .enter()
      .append("circle")
      .attr("class", "bg-star")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", (d) => d.r)
      .attr("fill", "#ffffff")
      .attr("opacity", 0.3)
      .each(function (d) {
        const el = d3.select(this);
        (function twinkle() {
          el.transition()
            .duration(2000 + Math.random() * 3000)
            .delay(d.delay * 1000)
            .attr("opacity", 0.1 + Math.random() * 0.6)
            .transition()
            .duration(2000 + Math.random() * 3000)
            .attr("opacity", 0.1 + Math.random() * 0.3)
            .on("end", twinkle);
        })();
      });

    // Cluster backgrounds
    const clusterGroup = svg.append("g").attr("class", "clusters");
    for (const cluster of data.clusters) {
      const gradient = svg
        .append("defs")
        .append("radialGradient")
        .attr("id", `cluster-${cluster.name}`)
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%");
      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", cluster.color)
        .attr("stop-opacity", 0.08);
      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", cluster.color)
        .attr("stop-opacity", 0);

      clusterGroup
        .append("circle")
        .attr("cx", cluster.centerX * scaleX)
        .attr("cy", cluster.centerY * scaleY)
        .attr("r", cluster.radius * scaleX)
        .attr("fill", `url(#cluster-${cluster.name})`);

      // Category label
      clusterGroup
        .append("text")
        .attr("x", cluster.centerX * scaleX)
        .attr("y", (cluster.centerY + cluster.radius + 16) * scaleY)
        .attr("text-anchor", "middle")
        .attr("fill", cluster.color)
        .attr("font-size", `${11 * scaleX}px`)
        .attr("opacity", 0.6)
        .text(cluster.name);
    }

    // Connection lines
    const starMap = new Map(data.stars.map((s) => [s.id, s]));
    const lineGroup = svg.append("g").attr("class", "connections");

    for (const conn of data.connections) {
      const source = starMap.get(conn.source);
      const target = starMap.get(conn.target);
      if (!source || !target) continue;

      lineGroup
        .append("line")
        .attr("x1", source.x * scaleX)
        .attr("y1", source.y * scaleY)
        .attr("x2", target.x * scaleX)
        .attr("y2", target.y * scaleY)
        .attr("stroke", source.color)
        .attr("stroke-opacity", conn.strength * 0.15)
        .attr("stroke-width", 0.5);
    }

    // Stars (posts)
    const starGroup = svg.append("g").attr("class", "stars");
    for (const star of data.stars) {
      // Glow
      starGroup
        .append("circle")
        .attr("cx", star.x * scaleX)
        .attr("cy", star.y * scaleY)
        .attr("r", (star.size + 4) * scaleX)
        .attr("fill", star.color)
        .attr("opacity", 0.15)
        .attr("filter", "blur(3px)");

      // Main star
      starGroup
        .append("circle")
        .attr("cx", star.x * scaleX)
        .attr("cy", star.y * scaleY)
        .attr("r", star.size * scaleX)
        .attr("fill", star.color)
        .attr("opacity", 0.9)
        .attr("cursor", "pointer")
        .on("mouseenter", function (event: MouseEvent) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", (star.size + 3) * scaleX)
            .attr("opacity", 1);
          handleStarHover(star, event);
        })
        .on("mousemove", function (event: MouseEvent) {
          handleStarHover(star, event);
        })
        .on("mouseleave", function () {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", star.size * scaleX)
            .attr("opacity", 0.9);
          handleStarHover(null);
        })
        .on("click", () => {
          if (star.url && star.url !== "#") {
            window.open(star.url, "_blank");
          }
        });
    }
  }, [data, dimensions, handleStarHover]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className={`mx-auto block rounded-2xl bg-[#0a0a1a] ${blurred ? "blur-sm" : ""}`}
        style={{
          background:
            "radial-gradient(ellipse at center, #12122a 0%, #0a0a1a 70%)",
        }}
      />
      {tooltip && !blurred && (
        <StarTooltip star={tooltip.star} x={tooltip.x} y={tooltip.y} />
      )}
    </div>
  );
}
