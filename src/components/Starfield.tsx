import React, { useEffect, useRef } from 'react';

interface Star {
  x: number; // base design X
  y: number; // base design Y
  baseSize: number;
  baseOpacity: number;
  color: string;
  twinkleSpeed: number;
  phase: number;
  offsetX: number;
  offsetY: number;
  depth: number; // determines reaction to mouse (0.2 for background, 1.0 for foreground)
  isBright?: boolean; // whether to draw a subtle 4-point halo glow
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  thickness: number;
  maxOpacity: number;
  opacity: number;
  life: number; // 0 to 1
  decay: number;
}

interface Nebula {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  radius: number;
  color: string;
  angle: number;
  pulseSpeed: number;
}

interface CometParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  decay: number;
}

interface Comet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxOpacity: number;
  opacity: number;
  colorHead: string;      // Bright core
  colorGlow1: string;     // Vibrant pink/magenta
  colorGlow2: string;     // Faint violet/purple ambient
  angle: number;          // Trajectory angle in radians
  speed: number;          // Constant speed magnitude
  curveSpeed: number;     // Shift in angle per frame for the celestial arc
  particles: CometParticle[];
}

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const stars: Star[] = [];
    const shootingStars: ShootingStar[] = [];
    const comets: Comet[] = [];
    
    // Initialize Nebulae for ambient space color
    const nebulae: Nebula[] = [
      {
        x: width * 0.25,
        y: height * 0.3,
        targetX: width * 0.25,
        targetY: height * 0.3,
        radius: Math.min(width, height) * 0.5,
        color: 'rgba(74, 30, 140, 0.06)', // Soft purple
        angle: Math.random() * Math.PI * 2,
        pulseSpeed: 0.0002,
      },
      {
        x: width * 0.75,
        y: height * 0.7,
        targetX: width * 0.75,
        targetY: height * 0.7,
        radius: Math.min(width, height) * 0.6,
        color: 'rgba(15, 60, 110, 0.06)', // Deep indigo
        angle: Math.random() * Math.PI * 2,
        pulseSpeed: 0.0001,
      },
      {
        x: width * 0.5,
        y: height * 0.5,
        targetX: width * 0.5,
        targetY: height * 0.5,
        radius: Math.min(width, height) * 0.4,
        color: 'rgba(120, 24, 74, 0.04)', // Cosmic nebula red/pink
        angle: Math.random() * Math.PI * 2,
        pulseSpeed: 0.0003,
      }
    ];

    // Mouse coordinates (initialized outside viewport to avoid initial repulsion)
    let mouseX = -1000;
    let mouseY = -1000;
    let repelRadius = 140;

    // Helper to generate star fields based on layout density
    const spawnStars = (count: number) => {
      const starColors = [
        'rgba(255, 255, 255, ',
        'rgba(224, 242, 254, ', // faint blue
        'rgba(254, 244, 199, ', // faint yellow/white
        'rgba(255, 228, 230, ', // warm white
      ];

      for (let i = 0; i < count; i++) {
        const depth = Math.random(); // 0 to 1
        const sizeRand = Math.random();
        
        let baseSize = 0.4 + sizeRand * 1.3;
        let isBright = false;
        
        // Elite/Foreground bright stars get 4-point glow
        if (depth > 0.85 && sizeRand > 0.8) {
          baseSize = 1.8 + Math.random() * 0.8;
          isBright = true;
        }

        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          baseSize,
          baseOpacity: 0.25 + depth * 0.65,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          twinkleSpeed: 0.005 + Math.random() * 0.025,
          phase: Math.random() * Math.PI * 2,
          offsetX: 0,
          offsetY: 0,
          depth: 0.1 + depth * 0.9, // larger depth means reacts more to the mouse
          isBright,
        });
      }
    };

    spawnStars(280);

    let animationFrameId: number;

    const draw = () => {
      // Clear/Paint deep space background
      ctx.fillStyle = '#08080a';
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Nebulae
      nebulae.forEach(n => {
        n.angle += n.pulseSpeed;
        // Subtle orbiting float
        const currentRadius = n.radius * (1 + 0.08 * Math.sin(n.angle));
        const driftX = n.x + Math.sin(n.angle) * 30;
        const driftY = n.y + Math.cos(n.angle) * 20;

        const grad = ctx.createRadialGradient(driftX, driftY, 0, driftX, driftY, currentRadius);
        grad.addColorStop(0, n.color);
        grad.addColorStop(0.5, n.color.replace(/[\d.]+\)$/, '0.02)'));
        grad.addColorStop(1, 'rgba(8, 8, 10, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(driftX, driftY, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Stars rendering with Twinkling & Mouse Repel interaction
      stars.forEach(star => {
        star.phase += star.twinkleSpeed;
        const opacityOsc = Math.sin(star.phase);
        
        // Compute twinkling factor
        const currentOpacity = Math.max(0.15, Math.min(1.0, star.baseOpacity * (0.65 + 0.35 * opacityOsc)));

        // Mouse repulsion physics
        let targetOffsetX = 0;
        let targetOffsetY = 0;

        if (mouseX >= 0 && mouseY >= 0) {
          const dx = star.x - mouseX;
          const dy = star.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < repelRadius) {
            // Stronger push when closer, scaled by the star depth layer
            const force = (repelRadius - dist) / repelRadius;
            const pushFactor = force * 45 * star.depth;
            const angle = Math.atan2(dy, dx);
            targetOffsetX = Math.cos(angle) * pushFactor;
            targetOffsetY = Math.sin(angle) * pushFactor;
          }
        }

        // Smooth physics spring interpolations back to original positions
        star.offsetX += (targetOffsetX - star.offsetX) * 0.06;
        star.offsetY += (targetOffsetY - star.offsetY) * 0.06;

        const drawX = star.x + star.offsetX;
        const drawY = star.y + star.offsetY;

        // Clip viewport boundaries gracefully (wrap around or clamp)
        let finalX = drawX;
        let finalY = drawY;
        if (finalX < 0) finalX += width;
        else if (finalX > width) finalX -= width;
        if (finalY < 0) finalY += height;
        else if (finalY > height) finalY -= height;

        // Draw Flare/Glow for Foreground bright stars
        if (star.isBright) {
          ctx.beginPath();
          const glowSize = star.baseSize * 4;
          const glowGrad = ctx.createRadialGradient(finalX, finalY, 0, finalX, finalY, glowSize);
          glowGrad.addColorStop(0, star.color + (currentOpacity * 0.45) + ')');
          glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = glowGrad;
          ctx.arc(finalX, finalY, glowSize, 0, Math.PI * 2);
          ctx.fill();

          // Elegant, thin 4-point cross hairs spikes to look like high-quality stars
          ctx.beginPath();
          ctx.strokeStyle = star.color + (currentOpacity * 0.3) + ')';
          ctx.lineWidth = 0.5;
          ctx.moveTo(finalX - glowSize, finalY);
          ctx.lineTo(finalX + glowSize, finalY);
          ctx.moveTo(finalX, finalY - glowSize);
          ctx.lineTo(finalX, finalY + glowSize);
          ctx.stroke();
        }

        // Draw the core star body
        ctx.beginPath();
        ctx.fillStyle = star.color + currentOpacity + ')';
        ctx.arc(finalX, finalY, star.baseSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Occasionally trigger Shooting Star random spawns
      if (Math.random() < 0.0065 && shootingStars.length < 3) {
        // Star speed across sky
        const angle = -Math.PI / 4 + (Math.random() * 0.2 - 0.1); // Around -45 degrees (pointing down-left)
        const speed = 10 + Math.random() * 12;
        
        shootingStars.push({
          x: Math.random() * (width * 0.95),
          y: Math.random() * (height * 0.45) - 20,
          vx: Math.cos(angle) * speed,
          vy: -Math.sin(angle) * speed,
          length: 50 + Math.random() * 90,
          thickness: 1.0 + Math.random() * 1.5,
          maxOpacity: 0.35 + Math.random() * 0.45,
          opacity: 1,
          life: 1.0,
          decay: 0.018 + Math.random() * 0.015,
        });
      }

      // Update & Draw active shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life -= ss.decay;
        
        if (ss.life <= 0) {
          shootingStars.splice(i, 1);
          continue;
        }

        const opacity = ss.maxOpacity * ss.life;
        const tailX = ss.x - ss.vx * (ss.length / 50);
        const tailY = ss.y - ss.vy * (ss.length / 50);

        // Render linear trailing streak
        const streakGrad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
        streakGrad.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
        streakGrad.addColorStop(0.3, `rgba(219, 234, 254, ${opacity * 0.75})`); // slight blue tint
        streakGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = streakGrad;
        ctx.lineWidth = ss.thickness;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }

      // 4. Occasionally trigger Slow Cosmic Pink Comet random spawns (similar to observed from Earth)
      if (Math.random() < 0.002 && comets.length < 2) {
        const size = 2.5 + Math.random() * 2.2; // nucleus size
        // Start angle strictly around 0.72 * PI to 0.78 * PI (which guarantees moving down-left from top-right)
        const angle = 0.75 * Math.PI + (Math.random() * 0.06 - 0.03);
        const speed = 0.22 + Math.random() * 0.18; // Very slow and majestic movement
        const curveSpeed = 0; // Keep it on a straight majestic path (never curving up)

        const spawnOnTop = Math.random() < 0.6;
        const x = spawnOnTop 
          ? Math.random() * (width * 0.45) + (width * 0.5) 
          : width + 60;
        const y = spawnOnTop
          ? -60
          : Math.random() * (height * 0.4);

        comets.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size,
          maxOpacity: 0.55 + Math.random() * 0.3, // Soft and delicate opacity maxima
          opacity: 0, // Fade in
          colorHead: 'rgba(255, 248, 252, 1)',
          colorGlow1: 'rgba(244, 180, 210, 0.45)', // Soft pastel pink blossom glow
          colorGlow2: 'rgba(192, 132, 252, 0.14)', // Ambient lavender air glow
          angle,
          speed,
          curveSpeed,
          particles: []
        });
      }

      // Update and Draw active slow comets
      for (let i = comets.length - 1; i >= 0; i--) {
        const c = comets[i];
        
        // Celestial curving mechanics
        c.angle += c.curveSpeed;
        c.vx = Math.cos(c.angle) * c.speed;
        c.vy = Math.sin(c.angle) * c.speed;

        c.x += c.vx;
        c.y += c.vy;

        // Elegant fade in / fade out (fade out near the screen edges)
        const isNearExit = c.x < width * 0.15 || c.y > height * 0.82;
        if (isNearExit) {
          c.opacity -= 0.003;
        } else if (c.opacity < c.maxOpacity) {
          c.opacity += 0.005;
        }

        // Remove if off screen or completely faded out
        if (c.x < -185 || c.y > height + 185 || c.opacity <= 0) {
          comets.splice(i, 1);
          continue;
        }

        const opacity = Math.max(0, c.opacity);

        const travelLen = Math.sqrt(c.vx * c.vx + c.vy * c.vy);
        const ux = c.vx / (travelLen || 1);
        const uy = c.vy / (travelLen || 1);

        // Spawn trailing pink dust particles at a low frequent rate
        if (Math.random() < 0.28) {
          c.particles.push({
            x: c.x - ux * c.size,
            y: c.y - uy * c.size,
            vx: -ux * (0.04 + Math.random() * 0.12) + (Math.random() * 0.1 - 0.05),
            vy: -uy * (0.04 + Math.random() * 0.12) + (Math.random() * 0.1 - 0.05),
            size: 0.4 + Math.random() * 1.1,
            alpha: 0.45 + Math.random() * 0.35,
            life: 1.0,
            decay: 0.006 + Math.random() * 0.008
          });
        }

        // Draw and update dust particles (drawn behind the head)
        for (let j = c.particles.length - 1; j >= 0; j--) {
          const p = c.particles[j];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= p.decay;

          if (p.life <= 0) {
            c.particles.splice(j, 1);
            continue;
          }

          const pAlpha = p.alpha * p.life * opacity;
          ctx.beginPath();
          ctx.fillStyle = `rgba(249, 168, 212, ${pAlpha * 0.7})`; // Soft, pale pink dust
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Beautiful layered comet main trails trailing along the tangent
        const tailLength = 110 + c.size * 20;
        const tailX = c.x - ux * tailLength;
        const tailY = c.y - uy * tailLength;

        // 1. Core soft white-to-pink gradient tail
        const innerTailGrad = ctx.createLinearGradient(c.x, c.y, tailX, tailY);
        innerTailGrad.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.95})`);
        innerTailGrad.addColorStop(0.15, `rgba(244, 201, 222, ${opacity * 0.65})`); // Pastel pale rose
        innerTailGrad.addColorStop(0.55, `rgba(244, 143, 177, ${opacity * 0.18})`); // Delicate pink
        innerTailGrad.addColorStop(1, 'rgba(192, 132, 252, 0)');

        ctx.strokeStyle = innerTailGrad;
        ctx.lineWidth = c.size * 0.65;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.quadraticCurveTo(
          c.x - ux * (tailLength * 0.35) + (Math.random() * 0.6 - 0.3),
          c.y - uy * (tailLength * 0.35) + (Math.random() * 0.6 - 0.3),
          tailX,
          tailY
        );
        ctx.stroke();

        // 2. Wide ambient faint pink gas tail wing
        const outerTailGrad = ctx.createLinearGradient(c.x, c.y, tailX, tailY);
        outerTailGrad.addColorStop(0, `rgba(244, 180, 210, ${opacity * 0.14})`);
        outerTailGrad.addColorStop(0.4, `rgba(192, 132, 252, ${opacity * 0.06})`);
        outerTailGrad.addColorStop(1, 'rgba(8, 8, 10, 0)');

        ctx.strokeStyle = outerTailGrad;
        ctx.lineWidth = c.size * 2.3;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // 3. Radial comet head glow
        const headGlowRad = c.size * 5.5;
        const headGlow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, headGlowRad);
        headGlow.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.95})`);
        headGlow.addColorStop(0.25, c.colorGlow1.replace(/[\d.]+\)$/, `${opacity * 0.72})`));
        headGlow.addColorStop(0.7, c.colorGlow2.replace(/[\d.]+\)$/, `${opacity * 0.22})`));
        headGlow.addColorStop(1, 'rgba(8, 8, 10, 0)');

        ctx.beginPath();
        ctx.fillStyle = headGlow;
        ctx.arc(c.x, c.y, headGlowRad, 0, Math.PI * 2);
        ctx.fill();

        // 4. Compact central bright nucleus
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.9})`;
        ctx.arc(c.x, c.y, c.size * 0.32, 0, Math.PI * 2);
        ctx.fill();

        // 5. Delicate horizontal atmospheric glare line
        const flareLength = c.size * 18;
        const flareGrad = ctx.createLinearGradient(c.x - flareLength, c.y, c.x + flareLength, c.y);
        flareGrad.addColorStop(0, 'rgba(236, 72, 153, 0)');
        flareGrad.addColorStop(0.4, `rgba(244, 180, 210, ${opacity * 0.15})`);
        flareGrad.addColorStop(0.5, `rgba(255, 255, 255, ${opacity * 0.65})`);
        flareGrad.addColorStop(0.6, `rgba(244, 180, 210, ${opacity * 0.15})`);
        flareGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');

        ctx.strokeStyle = flareGrad;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(c.x - flareLength, c.y);
        ctx.lineTo(c.x + flareLength, c.y);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      // Update nebulae targets for scale changes
      nebulae[0].radius = Math.min(width, height) * 0.5;
      nebulae[1].radius = Math.min(width, height) * 0.6;
      nebulae[2].radius = Math.min(width, height) * 0.4;
      nebulae[0].x = width * 0.25; nebulae[0].y = height * 0.3;
      nebulae[1].x = width * 0.75; nebulae[1].y = height * 0.7;
      nebulae[2].x = width * 0.5; nebulae[2].y = height * 0.5;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: '#08080a' }}
    />
  );
}
