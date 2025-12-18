import React, { useState, useEffect, useMemo } from 'https://esm.sh/react@18.2.0';
import ReactDOM from 'https://esm.sh/react-dom@18.2.0/client';
import { LineChart, BarChart2, Wallet, ArrowRightLeft, LayoutDashboard, ArrowUpRight, ArrowDownRight, TrendingUp, Activity, PieChart, Menu, X, Bitcoin, Zap, Box, Layers } from 'https://esm.sh/lucide-react';

// --- Design Tokens & Constants ---
const COLORS = {
  bg: '#D6C9A9',      // Beige
  text: '#10285A',    // Deep Blue
  green: '#108A95',   // Teal/Green
  red: '#D65E2C',     // Orange/Red
  gold: '#D8A871',    // Gold/Tan
  white: '#FDFBF7',   // Off-white for cards
};

// Fake Crypto Data Generator
const COINS = [
  { id: 'PXL', name: 'PixelCoin', price: 420.69, change: 5.4, vol: '2.1M', icon: Box },
  { id: 'BIT', name: '8-Bit Cash', price: 12.40, change: -2.1, vol: '890K', icon: Layers },
  { id: 'CRT', name: 'Cathode', price: 0.85, change: 12.8, vol: '5.4M', icon: Zap },
  { id: 'ARC', name: 'ArcadeBlock', price: 105.20, change: -0.5, vol: '1.2M', icon: Activity },
  { id: 'NES', name: 'Cartridge', price: 3.50, change: 1.2, vol: '300K', icon:  Bitcoin}, // Generic icon fallback
];

// --- Shared UI Components ---

const HardShadowCard = ({ children, className = "", noPadding = false }) => (
  <div 
    className={`relative bg-[#FDFBF7] border-2 border-[#10285A] rounded-2xl shadow-[6px_6px_0px_#10285A] transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_#10285A] ${className}`}
  >
    <div className={noPadding ? "" : "p-6"}>
      {children}
    </div>
  </div>
);

const RetroButton = ({ children, onClick, variant = 'primary', className = "", active = false }) => {
  const bg = variant === 'primary' ? 'bg-[#10285A] text-white' : 
             variant === 'accent' ? 'bg-[#108A95] text-white' :
             variant === 'danger' ? 'bg-[#D65E2C] text-white' :
             'bg-[#FDFBF7] text-[#10285A]';
  
  const shadowColor = variant === 'primary' ? '#108A95' : '#10285A';
  
  return (
    <button 
      onClick={onClick}
      className={`
        relative px-6 py-3 font-bold rounded-xl border-2 border-[#10285A]
        shadow-[4px_4px_0px_${shadowColor}] 
        active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_${shadowColor}]
        transition-all uppercase tracking-wide text-sm flex items-center justify-center gap-2
        ${bg} ${active ? 'translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0px_#10285A] bg-[#D8A871] text-[#10285A]' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

const Badge = ({ isUp, value }) => (
  <span className={`
    inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border-2 border-[#10285A]
    ${isUp ? 'bg-[#108A95] text-white' : 'bg-[#D65E2C] text-white'}
  `}>
    {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
    {Math.abs(value)}%
  </span>
);

// --- Visualization Components (Custom SVG) ---

const Sparkline = ({ data, color, width = 120, height = 40 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline 
        points={points} 
        fill="none" 
        stroke={color} 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <circle cx={(data.length - 1) * (width / (data.length - 1))} cy={height - ((data[data.length-1] - min) / range) * height} r="4" fill={color} stroke="#10285A" strokeWidth="2" />
    </svg>
  );
};

const RetroBarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.val));
  
  return (
    <div className="w-full h-64 flex items-end justify-between gap-2 p-4 border-2 border-[#10285A] bg-[#FDFBF7] rounded-xl shadow-[4px_4px_0px_#D6C9A9]">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center w-full group">
          <div 
            className="w-full bg-[#108A95] border-2 border-[#10285A] rounded-t-md relative transition-all group-hover:bg-[#D8A871]"
            style={{ height: `${(d.val / max) * 100}%` }}
          >
             <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-[#10285A] text-white text-xs p-1 rounded whitespace-nowrap z-10">
               Vol: {d.val}M
             </div>
          </div>
          <span className="text-xs font-bold mt-2 text-[#10285A]">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const DonutChart = () => {
  // Simple CSS conic gradient for a retro pie chart feel
  return (
    <div className="relative w-64 h-64 rounded-full border-4 border-[#10285A] shadow-[8px_8px_0px_#D8A871]"
      style={{
        background: `conic-gradient(
          #108A95 0% 40%, 
          #D65E2C 40% 65%, 
          #D8A871 65% 90%, 
          #FDFBF7 90% 100%
        )`
      }}
    >
      <div className="absolute inset-0 m-auto w-32 h-32 bg-[#D6C9A9] rounded-full border-4 border-[#10285A] flex items-center justify-center flex-col">
        <span className="text-xs font-bold text-[#10285A] uppercase">Total</span>
        <span className="text-xl font-black text-[#10285A]">$12,450</span>
      </div>
    </div>
  );
};

// --- New Component: Intro Video Overlay ---
const IntroOverlay = ({ onComplete }) => {
  const [isFading, setIsFading] = useState(false);

  const handleVideoEnd = () => {
    setIsFading(true);
    setTimeout(() => {
      onComplete();
    }, 1000); 
  };

  return (
    <div className={`video-overlay ${isFading ? 'fading' : ''}`}>
      <video 
        autoPlay 
        muted 
        playsInline 
        onEnded={handleVideoEnd}
      >
        <source src="FINAL.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      <button 
        onClick={handleVideoEnd}
        className="absolute bottom-8 right-8 text-white/50 hover:text-white text-sm font-mono uppercase tracking-widest border border-white/20 px-4 py-2 rounded hover:bg-white/10 transition-all"
      >
        Skip Intro
      </button>
    </div>
  );
};

// --- Pages ---

const Dashboard = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
    {/* Hero Section */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <HardShadowCard className="h-full flex flex-col justify-between bg-[#10285A] text-[#FDFBF7] border-[#FDFBF7]">
          <div>
            <h2 className="text-3xl font-black mb-2 uppercase tracking-widest">Market Overview</h2>
            <p className="text-[#D8A871] font-mono mb-6">Global Crypto Cap: $2.4 Trillion</p>
            <div className="flex gap-4">
              <Badge isUp={true} value={4.5} />
              <span className="font-mono text-sm opacity-80">Since yesterday</span>
            </div>
          </div>
          <div className="mt-8 h-32 w-full">
            <Sparkline 
              data={[40, 45, 42, 50, 48, 55, 60, 58, 65, 70, 68, 75]} 
              color="#D8A871" 
              width={600} 
              height={100} 
            />
          </div>
        </HardShadowCard>
      </div>

      <div className="space-y-6">
        <HardShadowCard>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold opacity-60 uppercase">Top Gainer</p>
              <h3 className="text-2xl font-black text-[#10285A]">Cathode</h3>
            </div>
            <div className="p-2 bg-[#108A95] rounded-lg border-2 border-[#10285A] text-white">
              <Zap size={24} />
            </div>
          </div>
          <div className="flex justify-between items-end">
             <span className="text-3xl font-mono">$0.85</span>
             <Badge isUp={true} value={12.8} />
          </div>
        </HardShadowCard>

        <HardShadowCard>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold opacity-60 uppercase">Top Loser</p>
              <h3 className="text-2xl font-black text-[#10285A]">8-Bit Cash</h3>
            </div>
            <div className="p-2 bg-[#D65E2C] rounded-lg border-2 border-[#10285A] text-white">
              <Layers size={24} />
            </div>
          </div>
          <div className="flex justify-between items-end">
             <span className="text-3xl font-mono">$12.40</span>
             <Badge isUp={false} value={2.1} />
          </div>
        </HardShadowCard>
      </div>
    </div>

    {/* Featured Assets */}
    <h3 className="text-xl font-black uppercase tracking-wider text-[#10285A] mt-8 flex items-center gap-2">
      <TrendingUp /> Trending Assets
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {COINS.slice(0, 4).map((coin) => (
        <HardShadowCard key={coin.id} className="hover:scale-105 transition-transform">
          <div className="flex items-center gap-3 mb-4">
            <coin.icon className="text-[#10285A]" />
            <span className="font-bold">{coin.name}</span>
          </div>
          <div className="mb-4">
             <div className="text-2xl font-mono font-bold">${coin.price.toFixed(2)}</div>
             <div className={`text-sm font-bold ${coin.change > 0 ? 'text-[#108A95]' : 'text-[#D65E2C]'}`}>
               {coin.change > 0 ? '+' : ''}{coin.change}%
             </div>
          </div>
          <Sparkline 
            data={[
              coin.price * 0.9, 
              coin.price * 0.95, 
              coin.price * (coin.change > 0 ? 0.92 : 1.05), 
              coin.price
            ]} 
            color={coin.change > 0 ? '#108A95' : '#D65E2C'} 
            width={200} 
            height={40} 
          />
        </HardShadowCard>
      ))}
    </div>
  </div>
);

const Market = () => (
  <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-black uppercase text-[#10285A]">Live Market</h2>
      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="Search Coin..." 
          className="bg-[#FDFBF7] border-2 border-[#10285A] rounded-lg px-4 py-2 font-mono outline-none shadow-[4px_4px_0px_#D8A871] focus:shadow-[2px_2px_0px_#D8A871] focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
        />
        <RetroButton variant="secondary">Filter</RetroButton>
      </div>
    </div>

    <div className="bg-[#FDFBF7] border-2 border-[#10285A] rounded-2xl overflow-hidden shadow-[6px_6px_0px_#10285A]">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#10285A] text-[#FDFBF7]">
          <tr>
            <th className="p-4 font-bold uppercase tracking-wider">Asset</th>
            <th className="p-4 font-bold uppercase tracking-wider text-right">Price</th>
            <th className="p-4 font-bold uppercase tracking-wider text-right">24h Change</th>
            <th className="p-4 font-bold uppercase tracking-wider text-right hidden md:table-cell">Volume</th>
            <th className="p-4 font-bold uppercase tracking-wider hidden lg:table-cell">Trend</th>
            <th className="p-4 font-bold uppercase tracking-wider text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-[#10285A]">
          {COINS.map((coin) => (
            <tr key={coin.id} className="hover:bg-[#D6C9A9]/20 font-mono">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#D8A871] rounded border-2 border-[#10285A]">
                    <coin.icon size={16} color="#10285A" />
                  </div>
                  <div>
                    <div className="font-bold text-[#10285A]">{coin.name}</div>
                    <div className="text-xs opacity-60">{coin.id}</div>
                  </div>
                </div>
              </td>
              <td className="p-4 text-right font-bold">${coin.price.toFixed(2)}</td>
              <td className="p-4 text-right">
                <Badge isUp={coin.change > 0} value={coin.change} />
              </td>
              <td className="p-4 text-right hidden md:table-cell">{coin.vol}</td>
              <td className="p-4 hidden lg:table-cell">
                <div className="w-32">
                  <Sparkline 
                    data={[10, 20, 15, 25, 22, 30]} 
                    color={coin.change > 0 ? '#108A95' : '#D65E2C'} 
                    width={100} 
                    height={30} 
                  />
                </div>
              </td>
              <td className="p-4 text-center">
                <button className="px-4 py-1 bg-[#10285A] text-white text-xs font-bold rounded border-2 border-transparent hover:bg-transparent hover:text-[#10285A] hover:border-[#10285A] transition-colors">
                  TRADE
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const Exchange = () => {
  const [fromAmt, setFromAmt] = useState(1);
  const toAmt = (fromAmt * 420.69).toFixed(2);

  return (
    <div className="max-w-2xl mx-auto pt-8 animate-in zoom-in-95 duration-500">
      <HardShadowCard className="bg-[#10285A] text-white">
        <h2 className="text-2xl font-black uppercase text-center mb-8 tracking-widest text-[#D8A871]">Atomic Swap</h2>
        
        <div className="bg-[#FDFBF7] p-6 rounded-xl border-2 border-[#D8A871] text-[#10285A] mb-4 relative">
          <label className="text-xs font-bold uppercase opacity-60 block mb-2">You Pay</label>
          <div className="flex justify-between items-center">
            <input 
              type="number" 
              value={fromAmt}
              onChange={(e) => setFromAmt(e.target.value)}
              className="text-4xl font-mono font-bold bg-transparent outline-none w-1/2"
            />
            <div className="flex items-center gap-2 bg-[#D6C9A9] px-3 py-1 rounded-lg border-2 border-[#10285A]">
              <Box size={20} />
              <span className="font-bold">PXL</span>
            </div>
          </div>
          <p className="text-xs mt-2 opacity-60">Balance: 42.00 PXL</p>
        </div>

        <div className="flex justify-center -my-8 relative z-10">
          <button className="bg-[#D65E2C] p-3 rounded-full border-4 border-[#10285A] text-white shadow-[0px_4px_0px_#10285A] hover:scale-110 transition-transform">
            <ArrowRightLeft size={24} />
          </button>
        </div>

        <div className="bg-[#FDFBF7] p-6 rounded-xl border-2 border-[#D8A871] text-[#10285A] mt-4">
          <label className="text-xs font-bold uppercase opacity-60 block mb-2">You Receive</label>
          <div className="flex justify-between items-center">
            <span className="text-4xl font-mono font-bold">{toAmt}</span>
            <div className="flex items-center gap-2 bg-[#D6C9A9] px-3 py-1 rounded-lg border-2 border-[#10285A]">
              <span className="font-bold">USD</span>
            </div>
          </div>
          <p className="text-xs mt-2 opacity-60">1 PXL = $420.69</p>
        </div>

        <RetroButton variant="accent" className="w-full mt-8 py-4 text-lg bg-[#D8A871] text-[#10285A] border-[#FDFBF7]">
          CONFIRM SWAP
        </RetroButton>
      </HardShadowCard>
    </div>
  );
}

const Analytics = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
     <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-2/3">
          <HardShadowCard>
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black uppercase text-[#10285A]">Volume Analysis (7D)</h3>
                <div className="flex gap-2">
                   {['1D', '1W', '1M'].map(t => (
                     <button key={t} className={`text-xs font-bold px-2 py-1 border-2 border-[#10285A] rounded ${t === '1W' ? 'bg-[#10285A] text-white' : 'bg-transparent'}`}>{t}</button>
                   ))}
                </div>
             </div>
             <RetroBarChart data={[
               { label: 'Mon', val: 12 },
               { label: 'Tue', val: 19 },
               { label: 'Wed', val: 8 },
               { label: 'Thu', val: 24 },
               { label: 'Fri', val: 15 },
               { label: 'Sat', val: 5 },
               { label: 'Sun', val: 10 },
             ]} />
          </HardShadowCard>
        </div>

        <div className="w-full md:w-1/3">
           <HardShadowCard className="flex flex-col items-center">
              <h3 className="text-xl font-black uppercase text-[#10285A] mb-6">Sentiment</h3>
              <div className="relative mb-4">
                 <div className="w-40 h-40 rounded-full border-[12px] border-[#D6C9A9] flex items-center justify-center">
                    <span className="text-3xl font-black text-[#10285A]">84%</span>
                 </div>
                 <div className="absolute top-0 left-0 w-40 h-40 rounded-full border-[12px] border-[#108A95] border-l-transparent border-b-transparent rotate-45"></div>
              </div>
              <p className="text-center font-bold text-[#108A95]">EXTREME GREED</p>
              <p className="text-center text-xs mt-2 opacity-60 max-w-[200px]">The market is currently showing signs of high buying pressure.</p>
           </HardShadowCard>
        </div>
     </div>

     <HardShadowCard>
        <h3 className="text-xl font-black uppercase text-[#10285A] mb-4">Network Activity</h3>
        <div className="h-48 w-full flex items-end gap-1">
           {Array.from({length: 40}).map((_, i) => {
             const h = Math.random() * 80 + 20;
             return (
               <div 
                  key={i} 
                  className="flex-1 bg-[#10285A] hover:bg-[#D65E2C] transition-colors rounded-t-sm" 
                  style={{ height: `${h}%` }}
               ></div>
             )
           })}
        </div>
     </HardShadowCard>
  </div>
);

const WalletPage = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
    <HardShadowCard className="flex flex-col items-center justify-center bg-[#FDFBF7]">
       <h3 className="text-xl font-black uppercase text-[#10285A] mb-8">Asset Allocation</h3>
       <DonutChart />
       <div className="mt-8 grid grid-cols-2 gap-4 w-full">
          <div className="flex items-center gap-2">
             <div className="w-4 h-4 bg-[#108A95] border-2 border-[#10285A]"></div>
             <span className="font-bold text-sm">PixelCoin (40%)</span>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-4 h-4 bg-[#D65E2C] border-2 border-[#10285A]"></div>
             <span className="font-bold text-sm">Cathode (25%)</span>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-4 h-4 bg-[#D8A871] border-2 border-[#10285A]"></div>
             <span className="font-bold text-sm">Arcade (25%)</span>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-4 h-4 bg-[#FDFBF7] border-2 border-[#10285A]"></div>
             <span className="font-bold text-sm">USD (10%)</span>
          </div>
       </div>
    </HardShadowCard>

    <div className="space-y-6">
      <HardShadowCard className="bg-[#10285A] text-white">
         <div className="flex justify-between items-center mb-4 opacity-80">
            <span className="uppercase tracking-widest text-sm">Total Balance</span>
            <Wallet size={20} />
         </div>
         <div className="text-4xl font-mono font-bold mb-4">$12,450.00</div>
         <div className="flex gap-4">
            <button className="flex-1 py-2 bg-[#108A95] border-2 border-white text-white font-bold rounded-lg hover:bg-[#D8A871] hover:text-[#10285A] transition-colors">DEPOSIT</button>
            <button className="flex-1 py-2 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-[#D65E2C] transition-colors">WITHDRAW</button>
         </div>
      </HardShadowCard>

      <h3 className="text-xl font-black uppercase text-[#10285A]">Recent Transactions</h3>
      <div className="space-y-3">
         {[1,2,3].map((i) => (
           <div key={i} className="flex justify-between items-center p-4 bg-[#FDFBF7] border-2 border-[#10285A] rounded-xl shadow-[4px_4px_0px_#D6C9A9]">
              <div className="flex items-center gap-3">
                 <div className={`p-2 rounded border-2 border-[#10285A] ${i === 2 ? 'bg-[#D65E2C] text-white' : 'bg-[#108A95] text-white'}`}>
                    {i === 2 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                 </div>
                 <div>
                    <div className="font-bold text-[#10285A]">{i === 2 ? 'Sent PXL' : 'Received BIT'}</div>
                    <div className="text-xs opacity-60">Today, 10:23 AM</div>
                 </div>
              </div>
              <div className="font-mono font-bold">
                 {i === 2 ? '-' : '+'}${i * 40}.00
              </div>
           </div>
         ))}
      </div>
    </div>
  </div>
);

// --- Main App Component ---

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'market': return <Market />;
      case 'exchange': return <Exchange />;
      case 'analytics': return <Analytics />;
      case 'wallet': return <WalletPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#D6C9A9] font-sans selection:bg-[#D65E2C] selection:text-white pb-20">
      
      {showIntro && <IntroOverlay onComplete={() => setShowIntro(false)} />}

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#FDFBF7] border-b-4 border-[#10285A] px-4 py-4 mb-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#D65E2C] border-2 border-[#10285A] flex items-center justify-center shadow-[4px_4px_0px_#10285A]">
                <Box className="text-white" />
             </div>
             <h1 className="text-2xl font-black tracking-tighter text-[#10285A]">
               BIT<span className="text-[#D65E2C]">PIXEL</span>
             </h1>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-4">
             {['dashboard', 'market', 'exchange', 'analytics', 'wallet'].map((tab) => (
               <RetroButton 
                 key={tab} 
                 variant={activeTab === tab ? 'primary' : 'ghost'}
                 active={activeTab === tab}
                 onClick={() => setActiveTab(tab)}
               >
                 {tab === 'dashboard' && <LayoutDashboard size={18} />}
                 {tab === 'market' && <TrendingUp size={18} />}
                 {tab === 'exchange' && <ArrowRightLeft size={18} />}
                 {tab === 'analytics' && <PieChart size={18} />}
                 {tab === 'wallet' && <Wallet size={18} />}
                 {tab}
               </RetroButton>
             ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 border-2 border-[#10285A] rounded bg-[#D8A871] shadow-[4px_4px_0px_#10285A]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#FDFBF7] border-b-4 border-[#10285A] p-4 flex flex-col gap-4 shadow-xl">
             {['dashboard', 'market', 'exchange', 'analytics', 'wallet'].map((tab) => (
               <RetroButton 
                 key={tab} 
                 variant={activeTab === tab ? 'primary' : 'ghost'}
                 className="w-full"
                 onClick={() => {
                   setActiveTab(tab);
                   setIsMenuOpen(false);
                 }}
               >
                 {tab}
               </RetroButton>
             ))}
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t-2 border-[#10285A] py-8 text-center opacity-60">
        <p className="font-mono text-[#10285A] text-sm">© 2025 BITPIXEL LTD. NO FINANCIAL ADVICE.</p>
        <div className="flex justify-center gap-4 mt-4">
           <div className="w-2 h-2 bg-[#D65E2C] rounded-full"></div>
           <div className="w-2 h-2 bg-[#108A95] rounded-full"></div>
           <div className="w-2 h-2 bg-[#D8A871] rounded-full"></div>
        </div>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
