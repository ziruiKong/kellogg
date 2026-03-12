import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const showcaseItems = [
  {
    title: '电子制造服务',
    subtitle: '智能终端与边缘计算',
    bgImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop',
    buttons: [
      { text: '探索', primary: true },
      { text: '联系', primary: false }
    ]
  },
  {
    title: '半导体工程',
    subtitle: '核心计算与系统级封装',
    bgImage: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=2070&auto=format&fit=crop',
    buttons: [
      { text: '架构', primary: true },
      { text: '订购', primary: false }
    ]
  },
  {
    title: '机械系统',
    subtitle: '航天级公差与自动化',
    bgImage: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?q=80&w=2070&auto=format&fit=crop',
    buttons: [{ text: '系统', primary: true }]
  },
  {
    title: '威龙精密腕表',
    subtitle: '工业钟表学的极致哲学',
    bgImage: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2080&auto=format&fit=crop',
    buttons: [
      { text: '系列', primary: true },
      { text: '门店', primary: false }
    ]
  }
];

export const HorizontalShowcase = ({ index, setActiveSection }: { index: number, setActiveSection: (i: number) => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const yBg = useTransform(smoothProgress, [0, 1], ['-20%', '20%']);
  const opacityContent = useTransform(smoothProgress, [0.2, 0.5, 0.8], [0, 1, 0]);
  const yContent = useTransform(smoothProgress, [0, 1], ['20%', '-20%']);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % showcaseItems.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + showcaseItems.length) % showcaseItems.length);

  return (
    <motion.section
      ref={ref}
      onViewportEnter={() => setActiveSection(index)}
      viewport={{ amount: 0.5 }}
      className="h-screen w-full relative flex items-center justify-center overflow-hidden bg-[#02050b]"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          <div className="absolute inset-0 z-0 overflow-hidden">
            <motion.img
              style={{ y: yBg, scale: 1.2 }}
              src={showcaseItems[currentIndex].bgImage}
              alt={showcaseItems[currentIndex].title}
              className="w-full h-full object-cover opacity-70 origin-center"
            />
            <div className="absolute inset-0 bg-[#02050b]/55" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#01030a]/90 via-[#06162e]/35 to-[#01030a]/95" />
            <div className="absolute inset-0 app-grid" />
          </div>

          <motion.div
            style={{ opacity: opacityContent, y: yContent }}
            className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.9 }}
              className="px-6 py-2 rounded-full border border-slate-200/20 bg-slate-200/5 text-slate-200/80 text-xs tracking-[0.22em] uppercase mb-7"
            >
              Capability 能力
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.8 }}
              className="text-5xl md:text-[64px] font-serif font-light tracking-tight text-slate-100 mb-4 drop-shadow-lg"
            >
              {showcaseItems[currentIndex].title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.8 }}
              className="text-lg md:text-xl font-light tracking-wide text-slate-200/85 mb-10 drop-shadow-md"
            >
              {showcaseItems[currentIndex].subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.8 }}
              className="flex flex-col md:flex-row gap-4 md:gap-6 w-full max-w-md md:max-w-2xl justify-center"
            >
              {showcaseItems[currentIndex].buttons.map((btn: any, i: number) => (
                <button
                  key={i}
                  className={`relative overflow-hidden group w-full md:w-64 py-2.5 px-4 rounded-full text-[14px] font-medium tracking-[0.1em] uppercase backdrop-blur-md transition-all duration-300 ${
                    btn.primary
                      ? 'bg-slate-200 text-[#071c3c] border border-slate-100/80 hover:bg-white'
                      : 'bg-slate-200/10 text-slate-100 border border-slate-200/30 hover:border-slate-100/70 hover:bg-slate-200/20'
                  }`}
                >
                  <span className="relative z-10">{btn.text}</span>
                  {btn.primary && (
                    <motion.div
                      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent z-0"
                      animate={{ translateX: ['-100%', '200%'] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', repeatDelay: 1.2 }}
                    />
                  )}
                </button>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-slate-200/10 hover:bg-slate-200/20 text-slate-100 backdrop-blur-md border border-slate-200/30 transition-all"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-slate-200/10 hover:bg-slate-200/20 text-slate-100 backdrop-blur-md border border-slate-200/30 transition-all"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {showcaseItems.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentIndex ? 'bg-slate-100 w-8' : 'bg-slate-200/35 hover:bg-slate-200/65 w-4'
            }`}
          />
        ))}
      </div>
    </motion.section>
  );
};
