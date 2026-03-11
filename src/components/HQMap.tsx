import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { animate, motion } from 'framer-motion';
import { MapPin, RotateCcw } from 'lucide-react';

const HQ_COORDS = [114.0579, 22.5431]; // Shenzhen

export const HQMap = ({ setActiveSection, index }: { setActiveSection: (i: number) => void, index: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [worldData, setWorldData] = useState<any>(null);
  const rotationRef = useRef<[number, number, number]>([0, 0, 0]);
  const scaleRef = useRef(350);
  const isZoomedRef = useRef(false);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(r => r.json())
      .then(data => {
        const countries = topojson.feature(data, data.objects.countries);
        setWorldData(countries);
      });
  }, []);

  useEffect(() => {
    if (!worldData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrameId: number;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      context.scale(dpr, dpr);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      context.clearRect(0, 0, width, height);

      const projection = d3.geoOrthographic()
        .translate([width / 2, height / 2])
        .scale(scaleRef.current)
        .rotate(rotationRef.current)
        .clipAngle(90);

      const path = d3.geoPath(projection, context);
      const graticule = d3.geoGraticule()();

      // Draw Ocean/Globe Background
      context.beginPath();
      context.arc(width / 2, height / 2, scaleRef.current, 0, 2 * Math.PI);
      context.fillStyle = 'rgba(5, 10, 20, 0.6)';
      context.fill();
      context.strokeStyle = 'rgba(0, 255, 255, 0.2)';
      context.lineWidth = 1;
      context.stroke();

      // Draw Graticule
      context.beginPath();
      path(graticule);
      context.strokeStyle = 'rgba(0, 255, 255, 0.05)';
      context.lineWidth = 0.5;
      context.stroke();

      // Draw Countries
      context.beginPath();
      path(worldData);
      context.fillStyle = 'rgba(10, 25, 40, 0.8)';
      context.fill();
      context.strokeStyle = 'rgba(0, 255, 255, 0.3)';
      context.lineWidth = 1;
      context.stroke();

      // Draw HQ Marker
      const hqPos = projection(HQ_COORDS as [number, number]);
      if (hqPos) {
        const center = projection.invert?.([width/2, height/2]);
        if (center) {
          const dist = d3.geoDistance(center, HQ_COORDS as [number, number]);
          if (dist < Math.PI / 2) {
            const pulse = Math.sin(Date.now() / 150) * 4 + 12;
            
            context.beginPath();
            context.arc(hqPos[0], hqPos[1], pulse, 0, 2 * Math.PI);
            context.fillStyle = 'rgba(230, 57, 70, 0.4)';
            context.fill();

            context.beginPath();
            context.arc(hqPos[0], hqPos[1], 4, 0, 2 * Math.PI);
            context.fillStyle = '#e63946';
            context.fill();
            
            // Draw Label if zoomed
            if (isZoomedRef.current && scaleRef.current > 600) {
              context.fillStyle = '#fff';
              context.font = '14px Inter';
              context.fillText('KELLOGG PRECISION HQ', hqPos[0] + 20, hqPos[1] + 4);
              context.fillStyle = 'rgba(255,255,255,0.6)';
              context.font = '12px Inter';
              context.fillText('Shenzhen, China', hqPos[0] + 20, hqPos[1] + 22);
            }
          }
        }
      }

      if (!isZoomedRef.current) {
        rotationRef.current[0] += 0.15;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [worldData]);

  const handleZoom = () => {
    isZoomedRef.current = true;
    setIsZoomed(true);
    
    let currentLon = rotationRef.current[0] % 360;
    if (currentLon < 0) currentLon += 360;
    
    const targetLon = -HQ_COORDS[0];
    const targetLat = -HQ_COORDS[1];

    let lonDiff = targetLon - currentLon;
    if (lonDiff > 180) lonDiff -= 360;
    if (lonDiff < -180) lonDiff += 360;

    animate(currentLon, currentLon + lonDiff, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => rotationRef.current[0] = v
    });

    animate(rotationRef.current[1], targetLat, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => rotationRef.current[1] = v
    });

    animate(scaleRef.current, 1200, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => scaleRef.current = v
    });
  };

  const handleReset = () => {
    isZoomedRef.current = false;
    setIsZoomed(false);
    
    animate(rotationRef.current[1], 0, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => rotationRef.current[1] = v
    });

    animate(scaleRef.current, 350, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => scaleRef.current = v
    });
  };

  return (
    <motion.section 
      onViewportEnter={() => setActiveSection(index)}
      viewport={{ amount: 0.5 }}
      className="h-screen w-full snap-start snap-always relative flex items-center justify-center overflow-hidden bg-[#02050a]"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" />
      
      <div className="absolute inset-0 bg-gradient-to-t from-[#02050a] via-transparent to-[#02050a] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#02050a]/80 via-transparent to-transparent pointer-events-none" />
      
      <div className="absolute top-1/3 left-10 md:left-24 z-10 pointer-events-none">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4 drop-shadow-lg"
        >
          全球布局
        </motion.h2>
        <motion.div 
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-16 h-1 bg-[#e63946] mb-6 origin-left" 
        />
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-white/70 max-w-md text-sm md:text-base leading-relaxed mb-8"
        >
          我们的精密制造网络遍布全球，以深圳总部为核心，辐射北美、欧洲及亚太地区，为您提供无缝衔接的工程支持与供应链保障。
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="pointer-events-auto flex gap-4"
        >
          {!isZoomed ? (
            <button 
              onClick={handleZoom}
              className="flex items-center gap-2 px-6 py-3 bg-[#e63946] hover:bg-[#d62828] text-white text-sm font-medium rounded-sm transition-all shadow-[0_0_20px_rgba(230,57,70,0.3)]"
            >
              <MapPin className="w-4 h-4" />
              定位总部
            </button>
          ) : (
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-sm backdrop-blur-md transition-all border border-white/10"
            >
              <RotateCcw className="w-4 h-4" />
              恢复全局视角
            </button>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
};
