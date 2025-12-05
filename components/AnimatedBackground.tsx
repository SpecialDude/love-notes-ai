
import React, { useEffect, useRef } from 'react';
import { ThemeType } from '../types';

interface Props {
  theme: ThemeType;
}

const AnimatedBackground: React.FC<Props> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let w = 0, h = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      life: number;
      maxLife: number;
      type: number;

      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.life = 0;
        this.maxLife = Math.random() * 300 + 100;
        this.alpha = 0;
        this.type = Math.random();

        // Default Defaults
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 3 + 1;

        this.initThemePhysics();
      }

      initThemePhysics() {
        switch (theme) {
            case ThemeType.VELVET:
                this.size = Math.random() * 6 + 2;
                this.vy = -Math.random() * 0.5 - 0.1; // Float up
                this.vx = Math.sin(Math.random() * Math.PI * 2) * 0.3;
                break;
            case ThemeType.OCEAN:
            case ThemeType.FROST:
                this.size = Math.random() * 8 + 2; 
                this.vy = -Math.random() * 1 - 0.2; 
                this.vx = (Math.random() - 0.5) * 0.2;
                break;
            case ThemeType.MIDNIGHT:
                this.size = Math.random() * 2;
                this.vx = (Math.random() - 0.5) * 0.05; // Almost static
                this.vy = (Math.random() - 0.5) * 0.05;
                break;
            case ThemeType.VINTAGE:
            case ThemeType.GINGERBREAD:
                this.size = Math.random() * 2 + 1; // Dust / Warm sparkles
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                break;
            case ThemeType.SUNSET:
                this.size = Math.random() * 15 + 10; // Bokeh
                this.vy = -Math.random() * 0.3;
                this.vx = (Math.random() - 0.5) * 0.2;
                break;
            case ThemeType.NOIR:
                this.size = Math.random() * 100 + 50; // Big geo shapes
                this.vx = 0;
                this.vy = Math.random() * 0.1;
                break;
            case ThemeType.EARTH:
            case ThemeType.HOLLY:
                 this.size = Math.random() * 4 + 1;
                 this.vy = Math.random() * 0.5 + 0.1; // Falling leaves / berries
                 this.vx = Math.sin(Math.random() * 10) * 0.5;
                 break;
            case ThemeType.WINTER:
                 this.size = Math.random() * 3 + 1;
                 this.vy = Math.random() * 1 + 0.5; // Snow falling down
                 this.vx = Math.sin(Math.random() * Math.PI) * 0.5; // Slight drift
                 this.y = Math.random() * -h; // Start above
                 break;
            default: // PASTEL
                this.size = Math.random() * 5 + 5;
                this.vy = Math.random() * 0.5 + 0.2; // Falling confetti
                this.vx = (Math.random() - 0.5) * 2;
                break;
        }
      }

      update() {
        this.life++;
        this.x += this.vx;
        this.y += this.vy;

        // Theme specific movement updates
        if (theme === ThemeType.VELVET || theme === ThemeType.EARTH || theme === ThemeType.WINTER || theme === ThemeType.HOLLY) {
            this.x += Math.sin(this.life * 0.02) * 0.2;
        }

        // Fade logic
        if (this.life < 50) this.alpha = this.life / 50;
        else if (this.life > this.maxLife - 50) this.alpha = (this.maxLife - this.life) / 50;
        else this.alpha = 1;

        // Reset
        if (this.life >= this.maxLife || this.y < -50 || this.y > h + 50) {
          this.life = 0;
          this.x = Math.random() * w;
          this.y = (this.vy < 0) ? h + 20 : -20; 
          
          if (theme === ThemeType.MIDNIGHT) this.y = Math.random() * h;
          if (theme === ThemeType.WINTER) this.y = -10; // Always restart snow at top

          this.initThemePhysics();
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.globalAlpha = this.alpha * 0.5; // Slightly lower opacity for global mix
        ctx.beginPath();

        if (theme === ThemeType.VELVET) {
            const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            g.addColorStop(0, 'rgba(255, 50, 50, 0.4)');
            g.addColorStop(1, 'rgba(255, 0, 0, 0)');
            ctx.fillStyle = g;
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } 
        else if (theme === ThemeType.OCEAN) {
            ctx.strokeStyle = 'rgba(200, 240, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.stroke();
        }
        else if (theme === ThemeType.MIDNIGHT) {
            ctx.fillStyle = '#ffffff';
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            if (Math.random() > 0.995) { // Twinkle
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'white';
                ctx.fillRect(this.x - 2, this.y, 4, 1);
                ctx.fillRect(this.x, this.y - 2, 1, 4);
                ctx.shadowBlur = 0;
            }
        }
        else if (theme === ThemeType.VINTAGE) {
            ctx.fillStyle = '#8c6b4a';
            ctx.rect(this.x, this.y, this.size, this.size);
            ctx.fill();
        }
        else if (theme === ThemeType.GINGERBREAD) {
            ctx.fillStyle = Math.random() > 0.5 ? '#fbbf24' : '#92400e'; // Gold or Brown
            ctx.rect(this.x, this.y, this.size, this.size);
            ctx.fill();
        }
        else if (theme === ThemeType.FROST) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#06b6d4'; // Cyan glow
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        else if (theme === ThemeType.SUNSET) {
            const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            g.addColorStop(0, 'rgba(255, 200, 100, 0.3)');
            g.addColorStop(1, 'rgba(255, 100, 50, 0)');
            ctx.fillStyle = g;
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        else if (theme === ThemeType.NOIR) {
            ctx.fillStyle = 'rgba(0,0,0,0.05)';
            ctx.rect(this.x, this.y, this.size, this.size);
            ctx.fill();
        }
        else if (theme === ThemeType.WINTER) {
            // Snow
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = 4;
            ctx.shadowColor = 'white';
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        else if (theme === ThemeType.HOLLY) {
            // Red and Green Berries
            ctx.fillStyle = this.type > 0.5 ? '#dc2626' : '#166534';
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        else {
            // Default particles (Pastel)
            ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 80%)`;
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
      }
    }

    const init = () => {
        particles = [];
        const count = window.innerWidth < 768 ? 40 : 80;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    };
    init();

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.update();
        p.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

export default AnimatedBackground;
