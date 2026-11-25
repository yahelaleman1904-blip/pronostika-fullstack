import { useEffect, useRef } from 'react';

export default function GoalAnimationCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = 0;
    let height = 0;

    // Geometría de primer plano de la escuadra
    let postX = 0;
    let barY = 0;
    let postR = 16;

    // Malla con ecuación de onda 2D estable
    const COLS = 22;
    const ROWS = 18;
    let nodes = [];

    const initScene = () => {
      postX = width * 0.78;
      barY = height * 0.16;
      postR = Math.max(13, Math.min(width * 0.022, 17));

      const netLeft = -30;
      const netRight = postX - postR + 2;
      const netTop = barY + postR - 2;
      const netBottom = height + 30;

      nodes = [];
      for (let r = 0; r <= ROWS; r++) {
        const row = [];
        for (let c = 0; c <= COLS; c++) {
          const u = c / COLS;
          const v = r / ROWS;
          const ox = netLeft + u * (netRight - netLeft);
          const oy = netTop + v * (netBottom - netTop);
          const pinned = r === 0 || c === COLS;
          row.push({
            ox,
            oy,
            dx: 0,
            dy: 0,
            vx: 0,
            vy: 0,
            pinned,
          });
        }
        nodes.push(row);
      }
    };

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initScene();
    };

    resize();
    window.addEventListener('resize', resize);

    const updateNetPhysics = (now) => {
      const waveSpeed = 0.14;
      const tension = 0.018;
      const damping = 0.95;

      const ax = Array.from({ length: ROWS + 1 }, () => new Float32Array(COLS + 1));
      const ay = Array.from({ length: ROWS + 1 }, () => new Float32Array(COLS + 1));

      for (let r = 1; r < ROWS; r++) {
        for (let c = 1; c < COLS; c++) {
          const n = nodes[r][c];
          const avgDx =
            (nodes[r - 1][c].dx +
              nodes[r + 1][c].dx +
              nodes[r][c - 1].dx +
              nodes[r][c + 1].dx) *
            0.25;
          const avgDy =
            (nodes[r - 1][c].dy +
              nodes[r + 1][c].dy +
              nodes[r][c - 1].dy +
              nodes[r][c + 1].dy) *
            0.25;

          ax[r][c] = (avgDx - n.dx) * waveSpeed - n.dx * tension;
          ay[r][c] = (avgDy - n.dy) * waveSpeed - n.dy * tension;
        }
      }

      // Brisa orgánica de estadio (dos frecuencias suaves combinadas)
      const t = now * 0.0018;
      for (let r = 1; r < ROWS; r++) {
        for (let c = 1; c < COLS; c++) {
          const n = nodes[r][c];
          const gust = 0.65 + 0.35 * Math.sin(t * 0.45);
          const windX =
            (Math.sin(t + r * 0.26 + c * 0.16) * 0.13 +
              Math.sin(t * 1.7 + r * 0.14) * 0.05) *
            gust;
          const windY =
            (Math.cos(t * 0.9 + c * 0.22) * 0.08 +
              Math.cos(t * 1.4 + r * 0.18) * 0.04) *
            gust;

          n.vx = (n.vx + ax[r][c] + windX) * damping;
          n.vy = (n.vy + ay[r][c] + windY) * damping;

          n.dx = Math.max(-28, Math.min(28, n.dx + n.vx));
          n.dy = Math.max(-22, Math.min(22, n.dy + n.vy));
        }
      }
    };

    const drawNet = () => {
      const getPos = (r, c) => ({
        x: nodes[r][c].ox + nodes[r][c].dx,
        y: nodes[r][c].oy + nodes[r][c].dy,
      });

      const strokeMesh = (strokeStyle, lineWidth, offsetX, offsetY) => {
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();

        for (let r = 0; r <= ROWS; r++) {
          for (let c = 0; c <= COLS; c++) {
            const p = getPos(r, c);
            if (c === 0) ctx.moveTo(p.x + offsetX, p.y + offsetY);
            else ctx.lineTo(p.x + offsetX, p.y + offsetY);
          }
        }
        for (let c = 0; c <= COLS; c++) {
          for (let r = 0; r <= ROWS; r++) {
            const p = getPos(r, c);
            if (r === 0) ctx.moveTo(p.x + offsetX, p.y + offsetY);
            else ctx.lineTo(p.x + offsetX, p.y + offsetY);
          }
        }
        ctx.stroke();
      };

      // Sombra proyectada de la malla
      strokeMesh('rgba(2, 6, 23, 0.5)', 2.2, 2, 3);

      // Malla principal con degradado de iluminación desde la escuadra
      const meshGrad = ctx.createRadialGradient(
        postX - 30,
        barY + 30,
        20,
        postX - 180,
        barY + 220,
        Math.max(width * 0.85, 480)
      );
      meshGrad.addColorStop(0, 'rgba(248, 250, 252, 0.55)');
      meshGrad.addColorStop(0.5, 'rgba(203, 213, 225, 0.28)');
      meshGrad.addColorStop(1, 'rgba(148, 163, 184, 0.05)');

      strokeMesh(meshGrad, 1.4, 0, 0);

      // Ganchos de sujeción en travesaño y poste
      ctx.fillStyle = 'rgba(148, 163, 184, 0.55)';
      for (let c = 1; c < COLS; c++) {
        const p = getPos(0, c);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let r = 1; r < ROWS; r++) {
        const p = getPos(r, COLS);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawGoalpostCorner = () => {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 28;
      ctx.shadowOffsetX = -6;
      ctx.shadowOffsetY = 10;

      // Travesaño horizontal
      const barGrad = ctx.createLinearGradient(0, barY - postR, 0, barY + postR);
      barGrad.addColorStop(0, '#cbd5e1');
      barGrad.addColorStop(0.22, '#ffffff');
      barGrad.addColorStop(0.55, '#e2e8f0');
      barGrad.addColorStop(0.85, '#64748b');
      barGrad.addColorStop(1, '#334155');

      ctx.fillStyle = barGrad;
      ctx.beginPath();
      ctx.moveTo(-20, barY - postR);
      ctx.lineTo(postX + postR, barY - postR);
      ctx.lineTo(postX - postR, barY + postR);
      ctx.lineTo(-20, barY + postR);
      ctx.closePath();
      ctx.fill();

      // Poste vertical
      const postGrad = ctx.createLinearGradient(postX - postR, 0, postX + postR, 0);
      postGrad.addColorStop(0, '#475569');
      postGrad.addColorStop(0.25, '#f8fafc');
      postGrad.addColorStop(0.5, '#ffffff');
      postGrad.addColorStop(0.82, '#94a3b8');
      postGrad.addColorStop(1, '#334155');

      ctx.fillStyle = postGrad;
      ctx.beginPath();
      ctx.moveTo(postX + postR, barY - postR);
      ctx.lineTo(postX + postR, height + 20);
      ctx.lineTo(postX - postR, height + 20);
      ctx.lineTo(postX - postR, barY + postR);
      ctx.closePath();
      ctx.fill();

      // Reflejo en la unión 45°
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(postX - postR, barY + postR);
      ctx.lineTo(postX + postR, barY - postR);
      ctx.stroke();

      ctx.restore();
    };

    const render = (now) => {
      ctx.clearRect(0, 0, width, height);
      updateNetPhysics(now);
      drawNet();
      drawGoalpostCorner();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}