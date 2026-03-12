import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import { ChevronDown, X, ArrowRight } from 'lucide-react';
import Lenis from 'lenis';
import { HQMap } from './components/HQMap';
import { HorizontalShowcase } from './components/HorizontalShowcase';
import kelloggLogo from './assets/kellogg-logo.svg';

const JOBS = [
  {
    title: "高级机器人工程师",
    dept: "机械系统",
    location: "加州 帕洛阿尔托",
    reqs: ["5年以上运动学与控制经验", "精通 C++/Python", "具备六轴机械臂开发经验"]
  },
  {
    title: "半导体架构师",
    dept: "核心计算",
    location: "德州 奥斯汀",
    reqs: ["先进制程设计 (3nm/2nm)", "精通系统级封装 (SiP)", "具备流片经验"]
  },
  {
    title: "工业设计师",
    dept: "产品设计",
    location: "德国 慕尼黑",
    reqs: ["高端硬件设计作品集", "A面曲面建模能力", "材料科学相关知识"]
  },
  {
    title: "供应链总监",
    dept: "运营管理",
    location: "中国 深圳",
    reqs: ["全球电子制造服务管理", "中英双语流利", "10年以上电子行业经验"]
  },
  {
    title: "钟表专家",
    dept: "精密腕表",
    location: "瑞士 日内瓦",
    reqs: ["制表大师认证", "微机械工程", "陀飞轮组装经验"]
  },
  {
    title: "边缘AI研究员",
    dept: "软件工程",
    location: "远程办公",
    reqs: ["机器学习博士学位", "边缘计算优化", "神经网络量化"]
  }
];

const Logo = ({ className = "", isLight = false }: { className?: string, isLight?: boolean }) => (
  <img
    src={kelloggLogo}
    alt="Kellogg Precision"
    className={`h-8 md:h-10 w-auto object-contain ${isLight ? 'brightness-0 invert' : ''} ${className}`}
    loading="eager"
    decoding="async"
  />
);

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'button' || target.tagName.toLowerCase() === 'a' || target.closest('button') || target.closest('a')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-4 h-4 rounded-full bg-white mix-blend-difference pointer-events-none z-[9999] flex items-center justify-center"
      animate={{
        x: mousePosition.x - 8,
        y: mousePosition.y - 8,
        scale: isHovering ? 3 : 1,
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.5 }}
    />
  );
};

const Navbar = ({ onAction, activeSection }: { onAction: (action: string) => void, activeSection: number }) => {
  const navLinks = ['Expertise', 'Technology', 'Financing', 'Team', 'News'];
  const isScrolled = activeSection > 0;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 w-full z-50 px-4 md:px-6 py-4 transition-all duration-700 ${
        isScrolled ? 'bg-transparent' : 'bg-transparent'
      }`}
    >
      <div className="w-full flex items-center gap-2 md:gap-3">
        <button
          onClick={() => onAction('menu')}
          className="h-11 px-3 rounded-xl bg-[#f3ef2a] text-[#0b1220] hover:bg-[#fff45a] transition-colors shadow-[0_8px_24px_rgba(243,239,42,0.25)] flex items-center"
          title="菜单"
        >
          <Logo className="h-6 md:h-7 w-auto" />
        </button>

        <div className="hidden lg:grid grid-cols-5 gap-2 flex-1">
          {navLinks.map((link, i) => (
            <button
              key={i}
              className="h-11 px-4 rounded-xl text-left text-sm text-slate-100/90 bg-white/12 hover:bg-white/18 border border-white/10 backdrop-blur-xl transition-colors"
            >
              {link}
            </button>
          ))}
        </div>

        <button
          onClick={() => onAction('careers')}
          className="h-11 px-5 md:px-7 rounded-xl bg-[#f3ef2a] text-[#0b1220] text-sm font-medium tracking-wide hover:bg-[#fff45a] transition-colors shadow-[0_8px_24px_rgba(243,239,42,0.25)] whitespace-nowrap"
        >
          Get in touch
        </button>
      </div>
    </motion.nav>
  );
};

const SideIndicator = ({ total, current }: { total: number, current: number }) => (
  <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-3">
    {Array.from({ length: total }).map((_, i) => (
      <motion.div 
        key={i}
        initial={false}
        animate={{ 
          height: current === i ? 28 : 8,
          backgroundColor: current === i ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.25)'
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-1.5 rounded-full"
      />
    ))}
  </div>
);

const Section = ({ title, subtitle, bgImage, buttons, isFirst, index, setActiveSection }: any) => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const yBg = useTransform(smoothProgress, [0, 1], ["-20%", "20%"]);
  const opacityContent = useTransform(smoothProgress, [0.2, 0.5, 0.8], [0, 1, 0]);
  const yContent = useTransform(smoothProgress, [0, 1], ["20%", "-20%"]);

  const opacityFirst = useTransform(smoothProgress, [0.5, 0.8], [1, 0]);
  const yFirst = useTransform(smoothProgress, [0.5, 1], ["0%", "-30%"]);

  const contentOpacity = isFirst ? opacityFirst : opacityContent;
  const contentY = isFirst ? yFirst : yContent;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: isFirst ? 0.3 : 0.15, delayChildren: isFirst ? 0.3 : 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: isFirst ? 40 : 30, filter: isFirst ? 'blur(12px)' : 'blur(8px)', scale: isFirst ? 0.95 : 1 },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)', 
      scale: 1,
      transition: { duration: isFirst ? 1.2 : 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <motion.section 
      ref={ref}
      onViewportEnter={() => setActiveSection(index)}
      viewport={{ amount: 0.5 }}
      className={`h-screen w-full relative flex flex-col ${isFirst ? 'items-start justify-center px-10 md:px-24' : 'items-center justify-between pt-[18vh] pb-12'} overflow-hidden`}
    >
      {/* Background with Cinematic Scale */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#02050b]">
        <motion.img 
          style={{ y: yBg, scale: 1.2 }}
          initial={isFirst ? { scale: 1.2, opacity: 0.4 } : false}
          animate={isFirst ? { scale: 1.2, opacity: 1 } : false}
          transition={{ duration: 2.5, ease: "easeOut" }}
          src={bgImage} 
          alt={title} 
          className="w-full h-full object-cover origin-center" 
        />
        <div className="absolute inset-0 bg-[#021126]/35" />
        <div className={`absolute inset-0 ${isFirst ? 'bg-gradient-to-r from-[#02050b]/90 via-[#071a33]/55 to-transparent' : 'bg-gradient-to-b from-[#02050b]/80 via-[#0a1a34]/20 to-[#02050b]/80'}`} />
      </div>

      {/* Text Content */}
      <motion.div 
        style={{ opacity: contentOpacity, y: contentY }}
        className={`relative z-10 w-full flex flex-col h-full ${isFirst ? "justify-end pb-20 md:pb-24" : "justify-center"}`}
      >
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.5, once: isFirst }}
          className={`relative z-10 text-slate-100 ${isFirst ? 'text-left max-w-5xl' : 'text-center px-4 mx-auto'}`}
        >
          <motion.h1 variants={itemVariants} className={`${isFirst ? 'text-6xl md:text-8xl lg:text-[102px] font-sans font-light tracking-tight leading-[0.98]' : 'text-5xl md:text-[56px] font-serif font-light tracking-tight'} mb-4 drop-shadow-lg`}>
            {title}
          </motion.h1>
          
          {isFirst && (
            <motion.div variants={itemVariants} className="w-12 h-[1px] bg-slate-300/70 mb-8 mt-6" />
          )}

          {subtitle && (
            <motion.p variants={itemVariants} className={`${isFirst ? 'text-lg md:text-[34px] font-light tracking-tight text-slate-200/90 max-w-2xl leading-[1.25]' : 'text-[15px] md:text-[17px] font-light tracking-wide text-slate-300/85'} drop-shadow-md`}>
              {subtitle}
            </motion.p>
          )}
        </motion.div>

        {/* Buttons & Footer */}
        <div className={`relative z-10 w-full flex flex-col ${isFirst ? 'items-start mt-8' : 'items-center px-6 mt-10'}`}>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.5, once: isFirst }}
            className={`flex flex-col md:flex-row gap-4 md:gap-6 w-full ${isFirst ? 'max-w-md' : 'max-w-md md:max-w-2xl justify-center'}`}
          >
            {buttons.map((btn: any, i: number) => (
              <motion.button 
                key={i}
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`relative overflow-hidden group flex items-center justify-center gap-2 ${isFirst ? 'w-auto py-3 px-8' : 'w-full md:w-64 py-2.5 px-4'} rounded-full text-[14px] font-medium tracking-[0.1em] uppercase backdrop-blur-sm transition-all duration-300 ${
                  btn.variant === 'accent'
                    ? 'bg-[#f3ef2a] text-[#0b1220] hover:bg-[#fff45a]'
                    : btn.variant === 'red'
                      ? 'bg-slate-200 text-[#0a1730] hover:bg-white'
                    : btn.primary 
                      ? 'bg-transparent text-slate-100 border border-slate-200/40 hover:bg-slate-200 hover:text-[#0a1730]' 
                      : 'bg-transparent text-slate-200 border border-slate-200/20 hover:border-slate-200/45 hover:bg-slate-200/10'
                }`}
              >
                <span className="relative z-10">{btn.text}</span>
                {btn.icon === 'arrow-right' && <ArrowRight className="w-4 h-4 relative z-10" />}
                {/* Shimmer effect for primary button */}
                {btn.primary && (
                  <motion.div 
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-slate-200/70 to-transparent z-0"
                    animate={{ translateX: ['-100%', '200%'] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 1.5 }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>

          {isFirst && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, 8, 0] }}
              transition={{ opacity: { delay: 2, duration: 1 }, y: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 text-slate-300/85"
            >
              <ChevronDown className="w-10 h-10" strokeWidth={1} />
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.section>
  );
};

const NewsSection = ({ index, setActiveSection }: { index: number, setActiveSection: (i: number) => void }) => {
  const [selectedNews, setSelectedNews] = useState<number | null>(null);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const opacityContent = useTransform(smoothProgress, [0.2, 0.5, 0.8], [0, 1, 0]);
  const yContent = useTransform(smoothProgress, [0, 1], ["20%", "-20%"]);

  const news = [
    {
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
      title: "凯洛格启动2026全球校园招聘 暑期实习生招募同步开跑",
      date: "2026/03/11",
      content: "凯洛格精密今日宣布，正式启动2026届全球校园招聘计划。本次招聘涵盖工程、研发、供应链、设计等多个核心领域，旨在吸纳全球顶尖高校的优秀毕业生。同时，备受瞩目的暑期实习生项目也同步开启申请通道。实习生将有机会深度参与核心项目，由资深导师一对一指导，体验凯洛格独特的工程师文化与创新氛围。我们期待充满激情与创造力的年轻力量加入，共同重塑精密制造的未来。"
    },
    {
      image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2000&auto=format&fit=crop",
      title: "2026凯洛格科技奖3/16开跑：首设应用组、最高奖金25万",
      date: "2026/03/11",
      content: "为鼓励前沿科技创新与应用落地，2026年度凯洛格科技奖将于3月16日正式启动项目征集。本届科技奖在原有基础研究组之外，首次增设“创新应用组”，重点关注人工智能、先进材料、精密控制等技术在实际工业场景中的转化成果。单项最高奖金提升至25万元人民币，并提供凯洛格全球研发中心的孵化资源支持。评审委员会由多位业界泰斗及凯洛格首席科学家组成，确保评选的专业性与权威性。"
    },
    {
      image: "https://images.unsplash.com/photo-1587280501635-6cb103d5928f?q=80&w=2070&auto=format&fit=crop",
      title: "JLPGA唯一海外正巡赛 2026台湾凯洛格女子高尔夫公开赛3/12-3/15登场",
      date: "2026/03/09",
      content: "体育界年度盛事——2026台湾凯洛格女子高尔夫公开赛，将于3月12日至15日在顶级高尔夫俱乐部隆重举行。作为日本女子职业高尔夫球巡回赛（JLPGA）本赛季唯一的一场海外正巡赛，本次赛事吸引了来自全球的百余位顶尖女子高尔夫选手同台竞技。凯洛格精密作为冠名赞助商，不仅为赛事提供全面支持，更将精密制造的追求完美、突破极限的理念与高尔夫运动精神深度融合，为全球观众呈现一场精彩绝伦的体育盛宴。"
    }
  ];

  return (
    <motion.section
      ref={ref}
      onViewportEnter={() => setActiveSection(index)}
      viewport={{ amount: 0.5 }}
      className="min-h-screen w-full relative flex flex-col items-center justify-center pt-[10vh] pb-12 overflow-hidden bg-[#02050b]"
    >
      <motion.div 
        style={{ opacity: opacityContent, y: yContent }}
        className="w-full max-w-7xl px-8 z-10 flex-1 flex flex-col justify-center"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-300/20 pb-3 mb-8 gap-4">
          <div className="flex items-end gap-8">
            <h2 className="text-4xl md:text-5xl font-serif font-light text-slate-100 tracking-tight">最新消息</h2>
            <div className="flex gap-2 text-sm font-medium mb-1">
              <button className="bg-slate-200/20 text-slate-100 px-6 py-1.5 rounded-full hover:bg-slate-300/30 transition-colors">新闻</button>
              <button className="text-slate-300 hover:text-slate-100 px-6 py-1.5 transition-colors">活动</button>
            </div>
          </div>
          <a href="#" className="text-slate-300 hover:text-slate-100 text-sm flex items-center gap-1 transition-colors mb-2">
            更多新闻 <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {news.map((item, i) => (
            <motion.div
              key={i}
              onClick={() => setSelectedNews(i)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              viewport={{ amount: 0.5 }}
              className="group cursor-pointer flex flex-col"
            >
              <div className="overflow-hidden relative aspect-[16/9] mb-4 bg-slate-200/10">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
              <h3 className="text-slate-100 font-medium text-lg leading-snug group-hover:text-slate-200/90 transition-colors line-clamp-2 mb-3">
                {item.title}
              </h3>
              <p className="text-slate-300/70 text-sm mt-auto">
                {item.date}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="absolute bottom-8 w-full flex flex-wrap justify-center gap-4 md:gap-8 text-[12px] text-gray-400 font-medium tracking-wide z-10"
      >
        <a href="#" className="hover:text-slate-200 transition-colors">凯洛格精密 © 2026</a>
        <a href="#" className="hover:text-slate-200 transition-colors">隐私与法律</a>
        <a href="#" className="hover:text-slate-200 transition-colors">联系我们</a>
        <a href="#" className="hover:text-slate-200 transition-colors">新闻资讯</a>
        <a href="#" className="hover:text-slate-200 transition-colors">获取更新</a>
        <a href="#" className="hover:text-slate-200 transition-colors">办公地点</a>
      </motion.div>

      <AnimatePresence>
        {selectedNews !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNews(null)}
              className="absolute inset-0 bg-[#02050b]/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-[#040c1a] border border-slate-300/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <button onClick={() => setSelectedNews(null)} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[#02050b]/65 backdrop-blur-sm border border-slate-300/20 flex items-center justify-center text-slate-300/85 hover:text-slate-100 hover:bg-[#02050b]/90 transition-all">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <div className="w-full h-64 md:h-80 relative flex-shrink-0">
                <img src={news[selectedNews].image} alt={news[selectedNews].title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040c1a] via-[#040c1a]/60 to-transparent" />
              </div>
              <div className="p-8 md:p-10 overflow-y-auto no-scrollbar -mt-32 relative z-10">
                <span className="text-slate-300/85 text-sm font-medium mb-3 block">{news[selectedNews].date}</span>
                <h2 className="text-3xl md:text-4xl font-serif font-light text-slate-100 leading-snug mb-6">{news[selectedNews].title}</h2>
                <div className="text-slate-200/90 leading-relaxed space-y-4 text-base md:text-lg font-light">
                  <p>{news[selectedNews].content}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default function App() {
  const [activeSection, setActiveSection] = useState(0);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    let rafId = 0;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const sections = [
    {
      title: "Technology",
      subtitle: "Kellogg Precision integrates advanced power electronics, intelligent control systems, and manufacturing software into one resilient technology stack.",
      bgImage: "https://images.unsplash.com/photo-1562408590-e32931084e23?q=80&w=2070&auto=format&fit=crop",
      buttons: [
        { text: "Explore Technology", variant: "accent", icon: "arrow-right" },
        { text: "Get in Touch", primary: true }
      ]
    }
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#02050b] font-sans selection:bg-slate-200 selection:text-[#0a1730] cursor-none overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-36 -left-24 w-[34rem] h-[34rem] rounded-full bg-[#0b2a56]/35 blur-[130px] app-orb" />
        <div className="absolute top-[28%] -right-36 w-[36rem] h-[36rem] rounded-full bg-slate-200/10 blur-[140px] app-orb app-orb--slow" />
        <div className="absolute inset-0 app-grid" />
        <div className="absolute inset-0 app-noise" />
      </div>
      <CustomCursor />
      <Navbar onAction={setActiveModal} activeSection={activeSection} />
      <SideIndicator total={4} current={activeSection} />
      {sections.map((section, index) => (
        <Section 
          key={index}
          index={index}
          setActiveSection={setActiveSection}
          {...section}
          isFirst={index === 0}
        />
      ))}
      <HorizontalShowcase index={1} setActiveSection={setActiveSection} />
      <HQMap index={2} setActiveSection={setActiveSection} />
      <NewsSection index={3} setActiveSection={setActiveSection} />

      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-[#02050b]/70 backdrop-blur-sm"
            />
            
            {activeModal === 'menu' && (
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute right-0 top-0 bottom-0 w-full md:w-[400px] bg-[#040c1a] border-l border-slate-300/20 p-8 flex flex-col"
              >
                <div className="flex justify-end">
                  <button onClick={() => setActiveModal(null)} className="text-slate-300/85 hover:text-slate-200 transition-colors">
                    <X className="w-6 h-6" strokeWidth={1.5} />
                  </button>
                </div>
                <div className="mt-12 flex flex-col gap-6 text-slate-100">
                  <h2 className="text-3xl font-serif font-light tracking-tight mb-4">导航</h2>
                  {['电子制造', '半导体', '机械系统', '精密腕表', '投资者关系', '新闻资讯', '招贤纳士'].map(item => (
                    <a key={item} href="#" className="text-xl font-light hover:text-slate-300/85 transition-colors">{item}</a>
                  ))}
                </div>
              </motion.div>
            )}

            {activeModal === 'careers' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 40 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full max-w-6xl h-[85vh] bg-[#040c1a]/90 backdrop-blur-2xl border border-slate-300/20 rounded-3xl shadow-2xl text-slate-100 mx-4 flex flex-col overflow-hidden"
              >
                <div className="flex-none p-8 md:px-12 md:py-10 border-b border-slate-300/20 flex justify-between items-center bg-slate-200/[0.04]">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-serif font-light tracking-tight mb-2">加入凯洛格精密</h2>
                    <p className="text-slate-300 text-base md:text-lg font-light tracking-wide">与我们共同塑造制造与工程的未来。</p>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="w-10 h-10 rounded-full bg-slate-200/10 border border-slate-300/20 flex items-center justify-center text-slate-300/85 hover:text-slate-100 hover:bg-slate-200/20 transition-all">
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar">
                  <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {JOBS.map((job, idx) => (
                      <motion.div
                        key={idx}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 25 } },
                          hover: { y: -5, scale: 1.02, transition: { type: "spring", damping: 20 } }
                        }}
                        whileHover="hover"
                        className="group relative p-8 rounded-2xl border border-slate-300/20 bg-slate-200/[0.05] hover:bg-slate-200/[0.12] transition-colors duration-300 overflow-hidden flex flex-col cursor-pointer"
                      >
                        <motion.div 
                          variants={{
                            hidden: { x: '-100%' },
                            visible: { x: '-100%' },
                            hover: { x: '200%', transition: { repeat: Infinity, duration: 1.5, ease: "linear" } }
                          }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/20 to-transparent z-0 pointer-events-none"
                        />
                        
                        <div className="relative z-10 mb-6">
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[11px] uppercase tracking-widest text-slate-300/70 font-medium px-2 py-1 rounded border border-slate-300/20 bg-slate-200/10">{job.dept}</span>
                            <span className="text-[12px] text-slate-300/60">{job.location}</span>
                          </div>
                          <h3 className="text-xl font-medium tracking-wide mb-2 group-hover:text-slate-200 transition-colors">{job.title}</h3>
                        </div>
                        
                        <div className="relative z-10 flex-1 mb-8">
                          <ul className="space-y-2">
                            {job.reqs.map((req, rIdx) => (
                              <li key={rIdx} className="text-[13px] text-slate-300/85 flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-slate-300/45 mt-1.5 flex-shrink-0" />
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="relative z-10 mt-auto pt-4 border-t border-slate-300/20 flex items-center justify-between">
                          <span className="text-[13px] font-medium tracking-wide text-slate-300/60 group-hover:text-slate-200 transition-colors">全职</span>
                          <span className="text-[13px] font-medium tracking-wide text-slate-100 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            立即申请 <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {(activeModal === 'support' || activeModal === 'language') && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-[#040c1a]/90 backdrop-blur-xl border border-slate-300/20 p-8 rounded-2xl shadow-2xl text-slate-100 mx-4"
              >
                <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-slate-300/85 hover:text-slate-200 transition-colors">
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <h2 className="text-2xl font-medium tracking-wider mb-2 capitalize">
                  {activeModal === 'support' ? '技术支持' : '语言选择'}
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed mb-8">
                  {activeModal === 'support' && "我们的精密工程支持团队全天候为您提供技术咨询与协助。"}
                  {activeModal === 'language' && "选择您偏好的地区和语言，定制您的专属体验。"}
                </p>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="w-full py-3 bg-slate-200 text-[#0a1730] font-medium rounded text-sm hover:bg-white transition-colors"
                >
                  {activeModal === 'language' ? '确认' : '探索'}
                </button>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
