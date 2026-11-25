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

    // Configuración de la malla de la red (física de resortes)
    const COLS = 22;
    const ROWS = 10;
    let nodes = [];
    let goal = { x: 0, y: 0, w: 0, h: 0, depthX: 0, depthY: 0 };

    const initNet = () => {
      goal.w = Math.min(width * 0.72, 420);
      goal.h = goal.w * 0.44;
      goal.x = (width - goal.w) / 2;
      goal.y = height * 0.24;
      goal.depthX = goal.w * 0.08;
      goal.depthY = goal.h * 0.14;

      nodes = [];
      for (let r = 0; r <= ROWS; r++) {
        const row = [];
        for (let c = 0; c <= COLS; c++) {
          const u = c / COLS;
          const v = r / ROWS;
          // Perspectiva sutil hacia el fondo de la portería
          const backX = goal.x + goal.depthX + u * (goal.w - goal.depthX * 2);
          const backY = goal.y + goal.depthY + v * (goal.h - goal.depthY);
          const pinned = r === 0 || c === 0 || c === COLS;
          row.push({
            ox: backX,
            oy: backY,
            x: backX,
            y: backY,
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
      initNet();
    };

    resize();
    window.addEventListener('resize', resize);

    // Estado del disparo y loop
    let startTime = performance.now();
    let hasImpacted = false;
    let impactTime = 0;
    let trail = [];
    let sparks = [];

    const SHOT_DURATION = 1150; // ms que tarda el tiro en llegar a la escuadra
    const LOOP_DURATION = 5800; // ms antes de repetir el disparo (la red sigue moviéndose)

    const triggerNetImpact = (impactX, impactY) => {
      for (let r = 0; r <= ROWS; r++) {
        for (let c = 0; c <= COLS; c++) {
          const n = nodes[r][c];
          if (n.pinned) continue;
          const dx = n.x - impactX;
          const dy = n.y - impactY;
          const dist = Math.hypot(dx, dy);
          if (dist < 140) {
            const force = (1 - dist / 140) * 18;
            n.vx += (dx / (dist + 1)) * force + 6;
            n.vy += (dy / (dist + 1)) * force - 3;
          }
        }
      }

      // Chispas sutiles en la escuadra
      sparks = Array.from({ length: 16 }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4;
        return {
          x: impactX,
          y: impactY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
        };
      });
    };

    const drawBall = (x, y, radius, spin) => {
      ctx.save();
      ctx.translate(x, y);

      // Sombra / brillo esmeralda sutil
      ctx.shadowColor = 'rgba(16, 185, 129, 0.55)';
      ctx.shadowBlur = 16;

      // Esfera base con gradiente 3D
      const grad = ctx.createRadialGradient(
        -radius * 0.3,
        -radius * 0.3,
        radius * 0.1,
        0,
        0,
        radius
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.7, '#e2e8f0');
      grad.addColorStop(1, '#64748b');

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Paneles pentagonales girando
      ctx.shadowBlur = 0;
      ctx.rotate(spin);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5;
        const px = Math.cos(a) * radius * 0.42;
        const py = Math.sin(a) * radius * 0.42;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    const render = (now) => {
      const elapsed = (now - startTime) % LOOP_DURATION;
      if (elapsed < 100 && hasImpacted) {
        hasImpacted = false;
        trail = [];
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Actualizar física de la red (resortes + brisa continua en loop)
      const breezeTime = now * 0.0028;
      for (let r = 0; r <= ROWS; r++) {
        for (let c = 0; c <= COLS; c++) {
          const n = nodes[r][c];
          if (n.pinned) continue;

          // Brisa constante para que la red SIEMPRE se mueva en loop
          const waveX = Math.sin(breezeTime + r * 0.45 + c * 0.25) * 0.18;
          const waveY = Math.cos(breezeTime * 1.15 + c * 0.35) * 0.14;

          // Fuerza de retorno hacia la posición original (resorte)
          const fx = (n.ox - n.x) * 0.065 + waveX;
          const fy = (n.oy - n.y) * 0.065 + waveY;

          n.vx = (n.vx + fx) * 0.91;
          n.vy = (n.vy + fy) * 0.91;
          n.x += n.vx;
          n.y += n.vy;
        }
      }

      // 2. Dibujar fondo de la portería y red
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.22)';
      ctx.lineWidth = 1;

      // Líneas horizontales de la red
      for (let r = 0; r <= ROWS; r++) {
        ctx.beginPath();
        for (let c = 0; c <= COLS; c++) {
          const n = nodes[r][c];
          if (c === 0) ctx.moveTo(n.x, n.y);
          else ctx.lineTo(n.x, n.y);
        }
        ctx.stroke();
      }

      // Líneas verticales de la red
      for (let c = 0; c <= COLS; c++) {
        ctx.beginPath();
        for (let r = 0; r <= ROWS; r++) {
          const n = nodes[r][c];
          if (r === 0) ctx.moveTo(n.x, n.y);
          else ctx.lineTo(n.x, n.y);
        }
        ctx.stroke();
      }

      // 3. Dibujar trayectoria y balón
      const startX = width * 0.26;
      const startY = height * 0.86;
      const targetX = goal.x + goal.w - goal.depthX - 24; // Escuadra superior derecha
      const targetY = goal.y + goal.depthY + 24;
      const ctrlX = width * 0.82; // Comba hacia afuera que se cierra en la escuadra
      const ctrlY = height * 0.44;

      if (elapsed <= SHOT_DURATION) {
        const t = elapsed / SHOT_DURATION;
        // Ease-out ligero para simular velocidad de disparo
        const ease = 1 - Math.pow(1 - t, 2.2);
        const inv = 1 - ease;

        const bx = inv * inv * startX + 2 * inv * ease * ctrlX + ease * ease * targetX;
        const by = inv * inv * startY + 2 * inv * ease * ctrlY + ease * ease * targetY;
        const radius = 17 - ease * 8.5;

        trail.push({ x: bx, y: by, r: radius });
        if (trail.length > 22) trail.shift();

        // Estela luminosa del disparo
        for (let i = 1; i < trail.length; i++) {
          const alpha = (i / trail.length) * 0.45;
          ctx.beginPath();
          ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
          ctx.lineTo(trail[i].x, trail[i].y);
          ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
          ctx.lineWidth = trail[i].r * 0.85;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        drawBall(bx, by, radius, ease * 18);
      } else {
        if (!hasImpacted) {
          hasImpacted = true;
          impactTime = now;
          triggerNetImpact(targetX, targetY);
        }

        // Balón cayendo y rodando dentro de la portería tras el gol
        const afterSec = (now - impactTime) / 1000;
        const dropY = Math.min(
          targetY + afterSec * afterSec * 190,
          goal.y + goal.h - 10
        );
        const rollX = targetX - Math.min(afterSec * 18, 36);
        const fade = Math.max(0, 1 - Math.max(0, afterSec - 3.2));

        if (fade > 0) {
          ctx.save();
          ctx.globalAlpha = fade;
          drawBall(rollX, dropY, 8.5, afterSec * 6);
          ctx.restore();
        }
      }

      // 4. Chispas del impacto en la escuadra
      sparks.forEach((s) => {
        if (s.life <= 0) return;
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.08;
        s.life -= 0.03;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${Math.max(0, s.life)})`;
        ctx.fill();
      });

      // 5. Postes y travesaño (encima de la red para profundidad realista)
      ctx.save();
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.35)';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.moveTo(goal.x, goal.y + goal.h);
      ctx.lineTo(goal.x, goal.y);
      ctx.lineTo(goal.x + goal.w, goal.y);
      ctx.lineTo(goal.x + goal.w, goal.y + goal.h);
      ctx.stroke();
      ctx.restore();

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