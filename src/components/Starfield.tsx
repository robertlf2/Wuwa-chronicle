import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
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

    const numStars = 800;
    const stars: Star[] = [];
    let mouseX = width / 2;
    let mouseY = height / 2;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width * 2 - width,
        y: Math.random() * height * 2 - height,
        z: Math.random() * 2000,
        size: Math.random() * 1.5 + 0.1
      });
    }

    let animationFrameId: number;

    const draw = () => {
      ctx.fillStyle = '#08080a'; // match background
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Calculate shift from mouse position (parallax)
      const shiftX = (mouseX - centerX) * 0.005;
      const shiftY = (mouseY - centerY) * 0.005;

      ctx.fillStyle = '#ffffff';

      stars.forEach(star => {
        // Move stars forward
        star.z -= 0.15;

        if (star.z <= 0) {
          star.x = Math.random() * width * 2 - width;
          star.y = Math.random() * height * 2 - height;
          star.z = 2000;
        }

        // Apply perspective projection and parallax
        const k = 1200 / star.z;
        const px = star.x * k + centerX - (shiftX * k);
        const py = star.y * k + centerY - (shiftY * k);

        // Alpha based on depth
        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const size = Math.max(0.1, star.size * k);
          const opacity = Math.min(1, 1 - star.z / 2000);
          
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
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
