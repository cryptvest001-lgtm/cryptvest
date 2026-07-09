"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

/* ─── types ──────────────────────────────────────────────────────── */
type MarketingPlan = {
  name: string;
  term: string;
  dailyRate: string;
  assets: string;
  access: string;
  exit: string;
  featured: boolean;
};

/* ─── data ───────────────────────────────────────────────────────── */
const HERO_STATS = [
  { label: "Assets Supported", value: 2, prefix: "", suffix: "", decimals: 0 },
  { label: "Daily Accrual", value: 24, prefix: "", suffix: "h", decimals: 0 },
  { label: "Stake Options", value: 3, prefix: "", suffix: "", decimals: 0 },
  { label: "KYC Protected", value: 100, prefix: "", suffix: "%", decimals: 0 },
];

const FEATURES = [
  { icon: "📈", title: "Daily Yield", desc: "Put idle BTC or USDT balances to work with earnings calculated every day." },
  { icon: "⚡", title: "Fast Deposits", desc: "Generate deposit addresses, submit claims, and track confirmations from one wallet view." },
  { icon: "⏰", title: "Flexible Terms", desc: "Choose short, balanced, or higher-yield locked plans based on your own timeline." },
  { icon: "🏆", title: "Admin-Reviewed Payouts", desc: "Withdrawal requests move through a clear review and payment workflow." },
  { icon: "🎯", title: "KYC-Gated Staking", desc: "Staking and withdrawal access are reserved for verified accounts." },
  { icon: "📰", title: "Activity Ledger", desc: "Deposits, stakes, earnings, and withdrawals are visible in your account history." },
];

const PARTNERS = ["BYBIT", "BINANCE", "COINBASE", "KRAKEN", "OKX", "BITGET"];

const PLANS: MarketingPlan[] = [
  { name: "Flexible Starter", term: "Open term", dailyRate: "0.350%", assets: "BTC + USDT", access: "Unstake anytime", exit: "No lock period", featured: false },
  { name: "Growth Lock", term: "30 days", dailyRate: "0.650%", assets: "BTC + USDT", access: "Daily accrual", exit: "3% early exit penalty", featured: true },
  { name: "Premium Lock", term: "90 days", dailyRate: "0.950%", assets: "BTC + USDT", access: "Higher daily rate", exit: "5% early exit penalty", featured: false },
];

const STEPS = [
  { n:"01", title:"Verify Account", desc:"Create your account, confirm your email, and complete KYC to unlock staking and withdrawals." },
  { n:"02", title:"Fund Wallet", desc:"Deposit BTC or USDT and track credited balances from your dashboard." },
  { n:"03", title:"Start Staking", desc:"Pick an active plan, stake your balance, and follow daily earnings in your activity ledger." },
];

/* ─── particles ──────────────────────────────────────────────────── */
const PARTICLES = Array.from({length:30}, (_,i) => ({
  id: i,
  left:  `${Math.random()*100}%`,
  size:  `${2 + Math.random()*3}px`,
  dur:   `${10 + Math.random()*10}s`,
  delay: `${Math.random()*15}s`,
  color: i%3===0 ? "#00f0ff" : i%3===1 ? "#a855f7" : "#22c55e",
}));

/* ─── animation variants ─────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity:0, y:40 },
  show:   { opacity:1, y:0, transition:{ duration:0.8, ease:"easeOut" as const } },
};
const stagger = { show: { transition: { staggerChildren: 0.12 } } };

/* ─── animated counter ───────────────────────────────────────────── */
function Counter({ value, prefix, suffix, decimals }: { value:number; prefix:string; suffix:string; decimals:number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const dur = 2200;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(parseFloat((ease * value).toFixed(decimals)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value, decimals]);
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{display.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  );
}

/* ─── scroll-reveal wrapper ──────────────────────────────────────── */
function Reveal({ children, delay=0 }: { children:React.ReactNode; delay?:number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:true, margin:"-80px" });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView?"show":"hidden"}
      variants={{ hidden:{opacity:0,y:40}, show:{opacity:1,y:0,transition:{duration:0.8,ease:"easeOut" as const,delay}} }}>
      {children}
    </motion.div>
  );
}

/* ─── main component ─────────────────────────────────────────────── */
export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{backgroundColor:"#0a0a0f", color:"#e2e8f0"}}>

      {/* ── NAVBAR ── */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/[0.06] shadow-lg shadow-black/40"
          : "border-b border-transparent"
      }`}
        style={{
          backgroundColor: scrolled ? "rgba(10,10,15,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(24px)" : "none",
        }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="CryptVest" width={200} height={58} className="h-14 w-auto brightness-0 invert" priority />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm" style={{color:"rgba(226,232,240,0.7)"}}>
            {[["#features","Features"],["#pricing","Pricing"],["#how","How It Works"],["#partners","Partners"]].map(([href,label])=>(
              <a key={href} href={href} className="transition-colors hover:text-white">{label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="btn-outline px-3 sm:px-5 py-2 text-sm whitespace-nowrap">Sign In</Link>
            <Link href="/register" className="btn-primary px-3 sm:px-5 py-2 text-sm whitespace-nowrap">Get Started</Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="bg-radial-pulse relative flex min-h-screen flex-col items-center justify-center px-6 pt-20 pb-16 text-center overflow-hidden">
        {/* Particles */}
        {PARTICLES.map(p => (
          <div key={p.id} className="particle pointer-events-none"
            style={{
              left: p.left, bottom: 0,
              width: p.size, height: p.size,
              backgroundColor: p.color,
              ["--dur" as string]: p.dur,
              ["--delay" as string]: p.delay,
            }} />
        ))}
        {/* Vignette */}
        <div className="pointer-events-none absolute inset-0"
          style={{background:"radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, #0a0a0f 100%)"}} />

        <motion.div className="relative z-10 flex flex-col items-center gap-7 max-w-4xl"
          initial="hidden" animate="show" variants={stagger}>

          <motion.div variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
            style={{border:"1px solid rgba(0,240,255,0.35)", color:"#00f0ff", background:"rgba(0,240,255,0.05)"}}>
            🚀 Smart Crypto Staking for BTC and USDT
          </motion.div>

          <motion.h1 variants={fadeUp}
            className="font-extrabold leading-[1.08] tracking-tight"
            style={{fontSize:"clamp(40px,7vw,72px)"}}>
            Stake Crypto.{" "}
            <span className="grad-text">Earn Daily</span>{" "}
            Yield.
          </motion.h1>

          <motion.p variants={fadeUp} className="max-w-xl text-lg leading-relaxed" style={{color:"rgba(226,232,240,0.65)"}}>
            Put your BTC and USDT balances to work with flexible and locked staking plans.
            Track deposits, daily earnings, and withdrawals from one clean dashboard.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/register" className="btn-primary px-8 py-3.5 text-sm">
              Start Staking
            </Link>
            <a href="#pricing" className="btn-outline px-8 py-3.5 text-sm">View Plans</a>
          </motion.div>

          {/* Stats bar */}
          <motion.div variants={fadeUp}
            className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-px w-full max-w-2xl rounded-2xl overflow-hidden"
            style={{background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)"}}>
            {HERO_STATS.map(s => (
              <div key={s.label} className="px-6 py-5 text-center" style={{background:"rgba(10,10,15,0.6)"}}>
                <p className="text-2xl font-extrabold grad-text tabular-nums">
                  <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} />
                </p>
                <p className="mt-1 text-xs" style={{color:"rgba(226,232,240,0.5)"}}>{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1" style={{color:"rgba(226,232,240,0.3)"}}>
          <div className="h-10 w-px" style={{background:"linear-gradient(to bottom, transparent, rgba(0,240,255,0.4))"}} />
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        </div>
      </section>

      {/* ── PARTNERS ── */}
      <section id="partners" className="py-14" style={{borderTop:"1px solid rgba(255,255,255,0.05)", borderBottom:"1px solid rgba(255,255,255,0.05)", background:"rgba(255,255,255,0.015)"}}>
        <Reveal>
          <div className="mx-auto max-w-5xl px-6 space-y-6">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em]" style={{color:"rgba(226,232,240,0.35)"}}>
              Trusted by Industry Leaders
            </p>
            <div className="flex flex-wrap items-center justify-center gap-10">
              {PARTNERS.map(p => (
                <span key={p} className="text-lg font-extrabold tracking-widest" style={{color:"rgba(226,232,240,0.3)", opacity:0.5}}>{p}</span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-28 px-6">
        <div className="mx-auto max-w-6xl space-y-16">
          <Reveal>
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-extrabold md:text-5xl">
                Why Members Choose{" "}
                <span className="grad-text">CryptVest</span>
              </h2>
              <p style={{color:"rgba(226,232,240,0.55)"}}>Simple staking tools with transparent account controls</p>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.07}>
                <motion.div
                  className="group glass p-6 relative overflow-hidden cursor-default"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* top gradient border on hover */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                    style={{background:"linear-gradient(90deg,#00f0ff,#a855f7)"}} />
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                    style={{background:"rgba(0,240,255,0.08)", border:"1px solid rgba(0,240,255,0.15)"}}>
                    {f.icon}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{color:"rgba(226,232,240,0.55)"}}>{f.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-28 px-6" style={{borderTop:"1px solid rgba(255,255,255,0.05)"}}>
        <div className="mx-auto max-w-6xl space-y-12">
          <Reveal>
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-extrabold md:text-5xl">Available Staking Plans</h2>
              <p style={{color:"rgba(226,232,240,0.55)"}}>Pick a flexible plan or lock funds for a higher daily rate.</p>
            </div>
          </Reveal>

            <motion.div
              className="grid gap-5 sm:grid-cols-3"
              initial={{opacity:0, y:20}} animate={{opacity:1,y:0}}
              transition={{duration:0.3}}>
              {PLANS.map(plan => (
                <div key={plan.name} className={`relative p-7 ${plan.featured ? "glass-featured" : "glass"}`}>
                  {plan.featured && (
                    <span className="absolute -top-3 right-5 rounded-full px-3 py-0.5 text-xs font-bold"
                      style={{background:"linear-gradient(135deg,#00f0ff,#a855f7)", color:"#000"}}>
                      POPULAR
                    </span>
                  )}
                  <p className="text-sm font-semibold mb-1" style={{color:"rgba(226,232,240,0.5)"}}>{plan.name}</p>
                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-5xl font-extrabold text-white">{plan.dailyRate}</span>
                    <span className="pb-2 text-xs font-semibold uppercase tracking-widest" style={{color:"rgba(226,232,240,0.4)"}}>/ day</span>
                  </div>
                  <p className="text-xs mb-6" style={{color:"rgba(226,232,240,0.4)"}}>{plan.term}</p>
                  <div className="space-y-2.5 mb-7">
                    {[
                      ["Assets", plan.assets],
                      ["Accrual", plan.access],
                      ["Term", plan.term],
                      ["Exit", plan.exit],
                    ].map(([k,v])=>(
                      <div key={k} className="flex items-center gap-2 text-sm">
                        <span style={{color:"#22c55e"}} className="text-base">✓</span>
                        <span style={{color:"rgba(226,232,240,0.55)"}}>{k}:</span>
                        <span className="font-semibold text-white">{v}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/register"
                    className={`block w-full py-3 text-sm font-bold text-center rounded-xl transition-all ${
                      plan.featured
                        ? "btn-primary"
                        : "btn-outline"
                    }`}>
                    Start Staking
                  </Link>
                </div>
              ))}
            </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-28 px-6" style={{borderTop:"1px solid rgba(255,255,255,0.05)"}}>
        <div className="mx-auto max-w-5xl space-y-16">
          <Reveal>
            <h2 className="text-4xl font-extrabold text-center md:text-5xl">How It Works</h2>
          </Reveal>
          <div className="relative grid gap-8 md:grid-cols-3">
            {/* connector line */}
            <div className="hidden md:block absolute top-8 left-[calc(16.5%)] right-[calc(16.5%)] h-px"
              style={{background:"linear-gradient(90deg,transparent,rgba(0,240,255,0.2),rgba(168,85,247,0.2),transparent)"}} />
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i*0.15}>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full text-xl font-extrabold text-black"
                    style={{background:"linear-gradient(135deg,#00f0ff,#a855f7)"}}>
                    {s.n}
                  </div>
                  <h3 className="text-lg font-bold text-white">{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{color:"rgba(226,232,240,0.55)"}}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-6" style={{borderTop:"1px solid rgba(255,255,255,0.05)"}}>
        <Reveal>
          <div className="mx-auto max-w-3xl glass-featured p-12 text-center space-y-6 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0" style={{background:"linear-gradient(135deg,rgba(0,240,255,0.04),rgba(168,85,247,0.04))"}} />
            <div className="relative">
              <h2 className="text-3xl font-extrabold md:text-5xl text-white">
                Ready to Put Your Crypto to Work?
              </h2>
              <p className="mt-3 text-base" style={{color:"rgba(226,232,240,0.6)"}}>
                Create an account, complete verification, and choose an active staking plan from your dashboard.
              </p>
              <Link href="/register" className="btn-primary inline-block mt-7 px-10 py-4 text-base">
                Start Staking Now
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{borderTop:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.01)"}}>

        {/* Main grid */}
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr_1fr]">

            {/* Brand column */}
            <div className="space-y-5">
              <div>
                <Image src="/logo.png" alt="CryptVest" width={220} height={64} className="h-16 w-auto brightness-0 invert" />
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest" style={{color:"rgba(0,240,255,0.5)"}}>
                  Crypto Staking Platform
                </p>
              </div>
              <p className="text-sm leading-relaxed max-w-xs" style={{color:"rgba(226,232,240,0.45)"}}>
                A crypto staking platform for BTC and USDT deposits, daily accrual, KYC-gated staking, and reviewed withdrawals.
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-3">
                {[
                  { label:"X", href:"#", path:"M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.623zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
                  { label:"Discord", href:"#", path:"M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.052a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" },
                  { label:"Telegram", href:"#", path:"M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" },
                ].map(s => (
                  <a key={s.label} href={s.href}
                    className="flex h-9 w-9 items-center justify-center rounded-xl transition-all"
                    style={{background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)"}}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(0,240,255,0.08)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,240,255,0.25)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                    }}
                    aria-label={s.label}>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" style={{color:"rgba(226,232,240,0.5)"}}>
                      <path d={s.path}/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{color:"rgba(226,232,240,0.35)"}}>Platform</p>
              <ul className="space-y-3">
                {[
                  ["Get Started","/register"],
                  ["Sign In","/login"],
                  ["Dashboard","/dashboard"],
                  ["Deposit","/deposit"],
                  ["Stake","/stake"],
                  ["Withdraw","/withdraw"],
                ].map(([label,href])=>(
                  <li key={label}>
                    <Link href={href} className="text-sm transition-colors"
                      style={{color:"rgba(226,232,240,0.5)"}}
                      onMouseEnter={e=>(e.currentTarget.style.color="#00f0ff")}
                      onMouseLeave={e=>(e.currentTarget.style.color="rgba(226,232,240,0.5)")}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Products */}
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{color:"rgba(226,232,240,0.35)"}}>Staking</p>
              <ul className="space-y-3">
                {[
                  ["Flexible Staking","#pricing"],
                  ["Locked Staking","#pricing"],
                  ["Daily Accrual","#pricing"],
                  ["View All Plans","#pricing"],
                  ["How It Works","#how"],
                  ["Features","#features"],
                ].map(([label,href])=>(
                  <li key={label}>
                    <a href={href} className="text-sm transition-colors"
                      style={{color:"rgba(226,232,240,0.5)"}}
                      onMouseEnter={e=>(e.currentTarget.style.color="#00f0ff")}
                      onMouseLeave={e=>(e.currentTarget.style.color="rgba(226,232,240,0.5)")}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{color:"rgba(226,232,240,0.35)"}}>Company</p>
              <ul className="space-y-3">
                {[
                  ["About Us","#"],
                  ["Blog","#"],
                  ["Careers","#"],
                  ["Affiliate Program","#"],
                  ["Leaderboard","#"],
                  ["Contact","#"],
                ].map(([label,href])=>(
                  <li key={label}>
                    <a href={href} className="text-sm transition-colors"
                      style={{color:"rgba(226,232,240,0.5)"}}
                      onMouseEnter={e=>(e.currentTarget.style.color="#00f0ff")}
                      onMouseLeave={e=>(e.currentTarget.style.color="rgba(226,232,240,0.5)")}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{color:"rgba(226,232,240,0.35)"}}>Legal</p>
              <ul className="space-y-3">
                {[
                  ["Terms of Service","#"],
                  ["Privacy Policy","#"],
                  ["Risk Disclosure","#"],
                  ["Refund Policy","#"],
                  ["Cookie Policy","#"],
                  ["AML Policy","#"],
                ].map(([label,href])=>(
                  <li key={label}>
                    <a href={href} className="text-sm transition-colors"
                      style={{color:"rgba(226,232,240,0.5)"}}
                      onMouseEnter={e=>(e.currentTarget.style.color="#00f0ff")}
                      onMouseLeave={e=>(e.currentTarget.style.color="rgba(226,232,240,0.5)")}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-14 flex flex-wrap gap-3">
            {[
              "✓  BTC + USDT Support",
              "✓  Reviewed Withdrawals",
              "✓  KYC-Gated Staking",
              "✓  Flexible and Locked Terms",
              "✓  Daily Staking Accrual",
            ].map(t => (
              <span key={t} className="rounded-full px-4 py-1.5 text-xs font-medium"
                style={{
                  background:"rgba(0,240,255,0.04)",
                  border:"1px solid rgba(0,240,255,0.12)",
                  color:"rgba(226,232,240,0.5)",
                }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{borderTop:"1px solid rgba(255,255,255,0.05)"}}>
          <div className="mx-auto max-w-6xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs" style={{color:"rgba(226,232,240,0.3)"}}>
              © {new Date().getFullYear()} CryptVest. All rights reserved. CryptVest is a crypto staking platform.
            </p>
            <div className="flex items-center gap-5">
              {["Terms","Privacy","Cookies"].map(l => (
                <a key={l} href="#" className="text-xs transition-colors"
                  style={{color:"rgba(226,232,240,0.3)"}}
                  onMouseEnter={e=>(e.currentTarget.style.color="#00f0ff")}
                  onMouseLeave={e=>(e.currentTarget.style.color="rgba(226,232,240,0.3)")}>
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>

      </footer>

    </div>
  );
}
