import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { animate, motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { MapPin, RotateCcw, ChevronDown, Crosshair, ChevronLeft, ChevronRight } from 'lucide-react';

const HQ = { id: 'hq', coords: [-82.9988, 39.9612], en: 'Columbus', zh: '哥伦布', type: 'HQ' };

const BRANCHES = [
  // 5 Top-tier cities
  { id: 'b1', coords: [-0.1276, 51.5072], en: 'London', zh: '伦敦', type: 'Branch' },
  { id: 'b2', coords: [139.6917, 35.6895], en: 'Tokyo', zh: '东京', type: 'Branch' },
  { id: 'b3', coords: [121.4737, 31.2304], en: 'Shanghai', zh: '上海', type: 'Branch' },
  { id: 'b4', coords: [55.2708, 25.2048], en: 'Dubai', zh: '迪拜', type: 'Branch' },
  { id: 'b5', coords: [103.8198, 1.3521], en: 'Singapore', zh: '新加坡', type: 'Branch' },
  // 10 Important regional hubs
  { id: 'b6', coords: [-114.0719, 51.0447], en: 'Calgary', zh: '卡尔加里', type: 'Branch' },
  { id: 'b7', coords: [-100.3161, 25.6866], en: 'Monterrey', zh: '蒙特雷', type: 'Branch' },
  { id: 'b8', coords: [-49.2731, -25.4284], en: 'Curitiba', zh: '库里蒂巴', type: 'Branch' },
  { id: 'b9', coords: [-64.1810, -31.4201], en: 'Córdoba', zh: '科尔多瓦', type: 'Branch' },
  { id: 'b10', coords: [16.6068, 49.1951], en: 'Brno', zh: '布尔诺', type: 'Branch' },
  { id: 'b11', coords: [11.9746, 57.7089], en: 'Gothenburg', zh: '哥德堡', type: 'Branch' },
  { id: 'b12', coords: [30.0619, -1.9441], en: 'Kigali', zh: '基加利', type: 'Branch' },
  { id: 'b13', coords: [73.8567, 18.5204], en: 'Pune', zh: '浦那', type: 'Branch' },
  { id: 'b14', coords: [138.6007, -34.9285], en: 'Adelaide', zh: '阿德莱德', type: 'Branch' },
  { id: 'b15', coords: [172.6362, -43.5320], en: 'Christchurch', zh: '克赖斯特彻奇', type: 'Branch' }
];

export const HQMap = ({ setActiveSection, index }: { setActiveSection: (i: number) => void, index: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const opacityContent = useTransform(smoothProgress, [0.2, 0.5, 0.8], [0, 1, 0]);
  const yContent = useTransform(smoothProgress, [0, 1], ["20%", "-20%"]);
  const [worldData, setWorldData] = useState<any>(null);
  const rotationRef = useRef<[number, number, number]>([0, 0, 0]);
  const scaleRef = useRef(350);
  const isZoomedRef = useRef(false);
  const activeLocRef = useRef<any>(null);
  
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeLocState, setActiveLocState] = useState<any>(null);

  const handleNext = () => {
    const ALL_LOCATIONS = [HQ, ...BRANCHES];
    if (!activeLocState) {
      handleZoomTo(ALL_LOCATIONS[0]);
    } else {
      const currentIndex = ALL_LOCATIONS.findIndex(loc => loc.id === activeLocState.id);
      const nextIndex = (currentIndex + 1) % ALL_LOCATIONS.length;
      handleZoomTo(ALL_LOCATIONS[nextIndex]);
    }
  };

  const handlePrev = () => {
    const ALL_LOCATIONS = [HQ, ...BRANCHES];
    if (!activeLocState) {
      handleZoomTo(ALL_LOCATIONS[ALL_LOCATIONS.length - 1]);
    } else {
      const currentIndex = ALL_LOCATIONS.findIndex(loc => loc.id === activeLocState.id);
      const prevIndex = (currentIndex - 1 + ALL_LOCATIONS.length) % ALL_LOCATIONS.length;
      handleZoomTo(ALL_LOCATIONS[prevIndex]);
    }
  };

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

      // Helper to check if a point is visible on the globe
      const isVisible = (coords: number[]) => {
        const center = projection.invert?.([width/2, height/2]);
        if (!center) return false;
        return d3.geoDistance(center as [number, number], coords as [number, number]) < Math.PI / 2;
      };

      // Draw Branches
      BRANCHES.forEach(branch => {
        const pos = projection(branch.coords as [number, number]);
        if (pos && isVisible(branch.coords)) {
          const isActive = activeLocRef.current?.id === branch.id;

          if (isActive) {
            const pulse = Math.sin(Date.now() / 150) * 4 + 10;
            context.beginPath();
            context.arc(pos[0], pos[1], pulse, 0, 2 * Math.PI);
            context.fillStyle = 'rgba(255, 255, 255, 0.2)';
            context.fill();
          }

          context.beginPath();
          context.arc(pos[0], pos[1], isActive ? 4 : 2.5, 0, 2 * Math.PI);
          context.fillStyle = isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.5)';
          context.fill();

          // Draw labels for branches
          context.shadowColor = 'rgba(0,0,0,0.8)';
          context.shadowBlur = 4;
          
          if (isActive && isZoomedRef.current && scaleRef.current > 600) {
            context.fillStyle = '#fff';
            context.font = 'bold 14px Inter';
            context.fillText('BRANCH OFFICE', pos[0] + 20, pos[1] - 4);
            context.fillStyle = 'rgba(255,255,255,0.9)';
            context.font = '12px Inter';
            context.fillText(`${branch.zh} / ${branch.en}`, pos[0] + 20, pos[1] + 14);
          } else {
            context.fillStyle = 'rgba(255,255,255,0.75)';
            context.font = '10px Inter';
            context.fillText(`${branch.zh} ${branch.en}`, pos[0] + 6, pos[1] + 3);
          }
          context.shadowBlur = 0; // reset
        }
      });

      // Draw HQ Marker
      const hqPos = projection(HQ.coords as [number, number]);
      if (hqPos && isVisible(HQ.coords)) {
        const isActive = activeLocRef.current?.id === HQ.id || (!activeLocRef.current && !isZoomedRef.current);
        const pulse = Math.sin(Date.now() / 150) * 4 + (isActive ? 12 : 8);
        
        context.beginPath();
        context.arc(hqPos[0], hqPos[1], pulse, 0, 2 * Math.PI);
        context.fillStyle = 'rgba(255, 255, 255, 0.3)';
        context.fill();

        context.beginPath();
        context.arc(hqPos[0], hqPos[1], 4, 0, 2 * Math.PI);
        context.fillStyle = '#ffffff';
        context.fill();
        
        context.shadowColor = 'rgba(0,0,0,0.8)';
        context.shadowBlur = 4;
        
        if (isActive && isZoomedRef.current && scaleRef.current > 600) {
          context.fillStyle = '#fff';
          context.font = 'bold 14px Inter';
          context.fillText('GLOBAL HQ', hqPos[0] + 20, hqPos[1] - 4);
          context.fillStyle = 'rgba(255,255,255,0.9)';
          context.font = '12px Inter';
          context.fillText(`${HQ.zh} / ${HQ.en}, USA`, hqPos[0] + 20, hqPos[1] + 14);
        } else {
          context.fillStyle = '#fff';
          context.font = 'bold 12px Inter';
          context.fillText(`HQ: ${HQ.zh} ${HQ.en}`, hqPos[0] + 12, hqPos[1] + 4);
        }
        context.shadowBlur = 0; // reset
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

  const handleZoomTo = (loc: any) => {
    activeLocRef.current = loc;
    setActiveLocState(loc);
    isZoomedRef.current = true;
    setIsZoomed(true);
    
    let currentLon = rotationRef.current[0] % 360;
    if (currentLon < 0) currentLon += 360;
    
    const targetLon = -loc.coords[0];
    const targetLat = -loc.coords[1];

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
    activeLocRef.current = null;
    setActiveLocState(null);
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
      ref={sectionRef}
      onViewportEnter={() => setActiveSection(index)}
      viewport={{ amount: 0.5 }}
      className="h-screen w-full relative flex items-center justify-center overflow-hidden bg-black"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent pointer-events-none" />
      
      <motion.div 
        style={{ opacity: opacityContent, y: yContent }}
        className="absolute top-1/3 left-10 md:left-24 z-10 pointer-events-none"
      >
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-serif font-light tracking-tight text-white mb-4 drop-shadow-lg"
        >
          全球布局
        </motion.h2>
        <motion.div 
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-12 h-[1px] bg-white/50 mb-8 origin-left" 
        />
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-white/70 max-w-md text-base md:text-lg font-light tracking-wide leading-relaxed mb-10"
        >
          我们的精密制造网络遍布全球，以美国哥伦布（Columbus）总部为核心，并在伦敦、东京、上海等七大洲15个重要枢纽城市设立地区分部，为您提供无缝衔接的工程支持与供应链保障。
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="pointer-events-auto relative mt-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-transparent border border-white/30 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md overflow-hidden">
              <button 
                onClick={handlePrev}
                className="p-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors border-r border-white/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center justify-center w-48 px-4 py-3 text-white text-[14px] font-medium tracking-wide">
                <span className="flex items-center gap-2 truncate">
                  <Crosshair className={`w-4 h-4 flex-shrink-0 ${activeLocState?.id === 'hq' ? 'text-white' : 'text-white/70'}`} />
                  <span className="truncate">
                    {activeLocState ? `${activeLocState.zh} ${activeLocState.en}` : '选择定位城市...'}
                  </span>
                </span>
              </div>

              <button 
                onClick={handleNext}
                className="p-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors border-l border-white/10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <AnimatePresence>
              {isZoomed && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleReset}
                  className="flex items-center justify-center px-4 py-3 bg-transparent hover:bg-white/10 text-white text-sm font-medium rounded-full backdrop-blur-md transition-all border border-white/30 h-full"
                  title="恢复全局视角"
                >
                  <RotateCcw className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};
