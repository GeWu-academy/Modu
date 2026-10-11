import React, { useEffect, useState } from "react";

interface TactileBurstProps {
  active: boolean;
  onComplete?: () => void;
  x?: number;
  y?: number;
}

interface BurstDot {
  id: number;
  dx: number;
  dy: number;
}

export function TactileBurst({ active, onComplete, x, y }: TactileBurstProps) {
  const [dots, setDots] = useState<BurstDot[]>([]);

  useEffect(() => {
    if (!active) {
      setDots([]);
      return;
    }

    // 14 颗精工冷杉晨露微粒 (色值 #147A66, 半径 36px, 600ms)
    const newDots: BurstDot[] = [];
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const radius = 24 + Math.random() * 20;
      newDots.push({
        id: i,
        dx: Math.cos(angle) * radius,
        dy: Math.sin(angle) * radius,
      });
    }
    setDots(newDots);

    const timer = setTimeout(() => {
      setDots([]);
      onComplete?.();
    }, 600);

    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (dots.length === 0) return null;

  return (
    <div
      style={{
        position: x !== undefined && y !== undefined ? "fixed" : "absolute",
        top: y ?? "50%",
        left: x ?? "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      {dots.map((dot) => (
        <span
          key={dot.id}
          className="burst-particle"
          style={
            {
              "--dx": `${dot.dx}px`,
              "--dy": `${dot.dy}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
