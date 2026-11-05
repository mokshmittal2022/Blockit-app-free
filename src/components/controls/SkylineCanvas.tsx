import React, { useEffect, useRef } from 'react';

interface Props {
  streakDays: number;
  isAtRisk?: boolean;
}

export const SkylineCanvas: React.FC<Props> = ({ streakDays, isAtRisk = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    // Grid configuration
    const cols = 9;
    const rows = 14;
    const gap = 4;
    const paddingX = 16;
    const paddingBottom = 24;

    const blockW = (width - paddingX * 2 - (cols - 1) * gap) / cols;
    const blockH = (height - 80 - paddingBottom - (rows - 1) * gap) / rows;

    // Ground platform line
    ctx.strokeStyle = isAtRisk ? 'rgba(229, 88, 79, 0.4)' : 'rgba(100, 116, 139, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(paddingX - 4, height - paddingBottom + 10);
    ctx.lineTo(width - paddingX + 4, height - paddingBottom + 10);
    ctx.stroke();

    const maxDisplayDays = cols * rows;
    const displayDays = Math.min(streakDays, maxDisplayDays);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Bottom-up indexing
        const blockIndex = (rows - 1 - r) * cols + c;
        const x = paddingX + c * (blockW + gap);
        const y = height - paddingBottom - (r + 1) * (blockH + gap);

        const isFilled = blockIndex < displayDays;
        const isCurrentFloor = blockIndex === displayDays - 1;

        if (isFilled) {
          if (isAtRisk) {
            ctx.fillStyle = '#E5584F';
          } else if (isCurrentFloor) {
            ctx.fillStyle = '#1FB5A8'; // Top active floor is teal
          } else {
            // Gradient warmth across floors
            ctx.fillStyle = '#F2B84B';
          }

          // Draw rounded rectangle floor
          drawRoundRect(ctx, x, y, blockW, blockH, 3);
          ctx.fill();

          // Subtle window light
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.fillRect(x + blockW * 0.25, y + blockH * 0.25, blockW * 0.2, blockH * 0.5);
          ctx.fillRect(x + blockW * 0.55, y + blockH * 0.25, blockW * 0.2, blockH * 0.5);
        } else {
          // Blueprint blueprint ghost slot
          ctx.fillStyle = 'rgba(148, 163, 184, 0.12)';
          drawRoundRect(ctx, x, y, blockW, blockH, 3);
          ctx.fill();
        }
      }
    }
  }, [streakDays, isAtRisk]);

  return (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
