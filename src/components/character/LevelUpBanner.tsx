import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown } from 'lucide-react';

interface LevelUpBannerProps {
  show: boolean;
  newLevel: number;
  onDismiss: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  angle: number;
  speed: number;
  opacity: number;
  hue: number;
}

export function LevelUpBanner({ show, newLevel, onDismiss }: LevelUpBannerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const [displayLevel, setDisplayLevel] = useState(newLevel - 1);

  // Particle burst animation
  const spawnParticles = useCallback(() => {
    const particles: Particle[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        id: i,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        size: Math.random() * 4 + 1,
        angle: (Math.PI * 2 * i) / 80 + (Math.random() - 0.5) * 0.5,
        speed: Math.random() * 6 + 2,
        opacity: 1,
        hue: 40 + Math.random() * 20, // Gold range
      });
    }
    particlesRef.current = particles;
  }, []);

  const animateParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current
        .map(p => ({
          ...p,
          x: p.x + Math.cos(p.angle) * p.speed,
          y: p.y + Math.sin(p.angle) * p.speed + 0.5, // gravity
          speed: p.speed * 0.97,
          opacity: p.opacity * 0.97,
        }))
        .filter(p => p.opacity > 0.02);

      particlesRef.current.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.opacity})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.opacity * 0.2})`;
        ctx.fill();
      });

      if (particlesRef.current.length > 0) {
        animFrameRef.current = requestAnimationFrame(draw);
      }
    };

    draw();
  }, []);

  useEffect(() => {
    if (show) {
      spawnParticles();
      animateParticles();

      // Level number count-up
      setDisplayLevel(newLevel - 1);
      const timer = setTimeout(() => setDisplayLevel(newLevel), 600);

      // Auto-dismiss after 3.5s
      const dismissTimer = setTimeout(onDismiss, 3500);

      return () => {
        clearTimeout(timer);
        clearTimeout(dismissTimer);
        cancelAnimationFrame(animFrameRef.current);
      };
    }
  }, [show, newLevel, onDismiss, spawnParticles, animateParticles]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9995] flex items-center justify-center cursor-pointer"
          onClick={onDismiss}
          role="alertdialog"
          aria-label={`Ascension! You have reached level ${newLevel}`}
        >
          {/* Golden flash */}
          <motion.div
            className="absolute inset-0"
            initial={{ background: 'rgba(212,175,55,0.4)' }}
            animate={{ background: 'rgba(22,15,35,0.85)' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Particle canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
          />

          {/* Content */}
          <motion.div
            className="relative text-center z-10"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          >
            {/* Crown icon */}
            <motion.div
              initial={{ y: -30, opacity: 0, rotate: -10 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 250, damping: 15, delay: 0.3 }}
              className="flex justify-center mb-4"
            >
              <div className="relative">
                <Crown className="h-16 w-16 text-gold drop-shadow-lg" strokeWidth={1.2} />
                {/* Glow behind crown */}
                <div
                  className="absolute inset-0 blur-xl opacity-50"
                  style={{ background: 'radial-gradient(circle, #d4af37 0%, transparent 70%)' }}
                  aria-hidden="true"
                />
              </div>
            </motion.div>

            {/* ASCENSION text */}
            <motion.h2
              className="font-display text-sm tracking-[0.4em] text-gold/70 uppercase mb-2"
              initial={{ opacity: 0, letterSpacing: '0.8em' }}
              animate={{ opacity: 1, letterSpacing: '0.4em' }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Ascension
            </motion.h2>

            {/* Level number */}
            <motion.div
              className="font-display text-8xl text-gold text-shadow-gold leading-none"
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 }}
            >
              {displayLevel}
            </motion.div>

            {/* Subtitle */}
            <motion.p
              className="font-body text-sm text-bone/50 mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              Your power grows. The realm takes notice.
            </motion.p>

            {/* Dismiss hint */}
            <motion.p
              className="font-body text-xs text-bone/25 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.4 }}
            >
              Click anywhere to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
