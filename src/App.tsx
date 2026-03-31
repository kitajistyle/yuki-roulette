/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { Plus, Trash2, RotateCw, Trophy, X, Sparkles } from 'lucide-react';

interface RouletteItem {
  id: string;
  text: string;
  color: string;
  weight: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', 
  '#F7DC6F', '#BB8FCE', '#82E0AA', '#F1948A', '#85C1E9'
];

export default function App() {
  const [items, setItems] = useState<RouletteItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<RouletteItem | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const wheelRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // Particle system logic
  const totalWeight = useMemo(() => items.reduce((sum, item) => sum + item.weight, 0), [items]);

  const itemAngles = useMemo(() => {
    if (totalWeight === 0) return [];
    let cumulativeWeight = 0;
    return items.map(item => {
      const startWeight = cumulativeWeight;
      const endWeight = cumulativeWeight + item.weight;
      cumulativeWeight = endWeight;
      return {
        ...item,
        startAngle: (startWeight / totalWeight) * 360,
        endAngle: (endWeight / totalWeight) * 360,
        sliceAngle: (item.weight / totalWeight) * 360
      };
    });
  }, [items, totalWeight]);

  useEffect(() => {
    if (isSpinning || winner) {
      const interval = setInterval(() => {
        setParticles(prev => {
          const newParticle: Particle = {
            id: Date.now() + Math.random(),
            x: 50,
            y: 50,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            size: Math.random() * 8 + 4,
            velocity: {
              x: (Math.random() - 0.5) * 10,
              y: (Math.random() - 0.5) * 10
            }
          };
          return [...prev.slice(-30), newParticle];
        });
      }, 100);
      return () => clearInterval(interval);
    } else {
      setParticles([]);
    }
  }, [isSpinning, winner]);

  const addItem = () => {
    const trimmedText = newItemText.trim();
    if (!trimmedText) return;
    setItems(prev => [...prev, {
      id: Math.random().toString(36).substring(2, 11),
      text: trimmedText,
      color: COLORS[prev.length % COLORS.length],
      weight: 1,
    }]);
    setNewItemText('');
  };

  const updateWeight = (id: string, weight: number) => {
    setItems(items.map(item => item.id === id ? { ...item, weight: Math.max(0.1, weight) } : item));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const startEdit = (item: RouletteItem) => {
    setEditingId(item.id);
    setEditingText(item.text);
  };

  const commitEdit = (id: string) => {
    if (editingText.trim()) {
      setItems(items.map(item => item.id === id ? { ...item, text: editingText.trim() } : item));
    }
    setEditingId(null);
  };

  const [rangeMin, setRangeMin] = useState('1');
  const [rangeMax, setRangeMax] = useState('10');

  const addRange = () => {
    const min = parseInt(rangeMin);
    const max = parseInt(rangeMax);
    if (isNaN(min) || isNaN(max) || min > max || max - min >= 100) return;
    const newItems: RouletteItem[] = Array.from({ length: max - min + 1 }, (_, i) => ({
      id: Math.random().toString(36).substring(2, 11),
      text: String(min + i),
      color: COLORS[(items.length + i) % COLORS.length],
      weight: 1,
    }));
    setItems(prev => [...prev, ...newItems]);
  };

  const spin = async () => {
    if (isSpinning || items.length < 2) return;

    setIsSpinning(true);
    setWinner(null);

    const extraSpins = 8 + Math.random() * 5; 
    const newRotation = rotation + extraSpins * 360 + Math.random() * 360;
    
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const normalizedRotation = (360 - (newRotation % 360)) % 360;
      const winningItem = itemAngles.find(item => 
        normalizedRotation >= item.startAngle && normalizedRotation < item.endAngle
      ) || items[0];
      setWinner(winningItem);
    }, 4000);
  };

  return (
    <div className="min-h-screen text-white font-sans p-4 md:p-8 overflow-hidden relative"
      style={{
        backgroundImage: 'url(/images/tiktok-couple.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Side: Wheel (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-12">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center space-y-2"
          >
            <h1 className="text-3xl md:text-7xl lg:text-9xl font-serif italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
              ユーキ　ルーレット
            </h1>
          </motion.div>
          
          <div className="relative w-80 h-80 md:w-[550px] md:h-[550px] perspective-[1500px]">
            {/* Particles */}
            <div className="absolute inset-0 pointer-events-none z-40">
              {particles.map(p => (
                <motion.div
                  key={p.id}
                  initial={{ x: "50%", y: "50%", scale: 1, opacity: 1 }}
                  animate={{ 
                    x: `${50 + p.velocity.x * 20}%`, 
                    y: `${50 + p.velocity.y * 20}%`,
                    scale: 0,
                    opacity: 0
                  }}
                  className="absolute w-2 h-2 rounded-full blur-[1px]"
                  style={{ backgroundColor: p.color }}
                />
              ))}
            </div>

            {/* Pointer with Vibration */}
            <motion.div 
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-10 z-50 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
              animate={{}}
              transition={{ repeat: Infinity, duration: 0.1 }}
            >
              <div className="w-12 h-20 bg-white shadow-2xl" 
                   style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }} />
            </motion.div>

            {/* 3D Wheel Structure */}
            <motion.div 
              animate={controls}
              className="w-full h-full relative preserve-3d"
              style={{ transform: 'rotateX(25deg)' }}
            >
              <motion.div
                className="w-full h-full relative preserve-3d"
                animate={{}}
                transition={{ duration: 4, ease: "easeInOut" }}
              >
                {/* Outer Glow Ring */}
                <motion.div 
                  animate={isSpinning ? { opacity: [0.3, 0.8, 0.3], scale: [1, 1.05, 1] } : { opacity: 0.2 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="absolute inset-[-20px] rounded-full bg-white/10 blur-2xl" 
                />

                {/* Wheel Depth */}
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute inset-0 rounded-full border-[12px] border-white/5"
                    style={{ transform: `translateZ(${-10 * (i + 1)}px)` }}
                  />
                ))}

                {/* Main Wheel Face */}
                <motion.div
                  ref={wheelRef}
                  className="w-full h-full rounded-full border-[12px] border-[#1A1A1A] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden bg-[#111] preserve-3d"
                  animate={{ rotate: rotation }}
                  transition={{ duration: 4, ease: [0.1, 0, 0.1, 1] }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <defs>
                      {items.map((item) => (
                        <radialGradient key={`grad-${item.id}`} id={`grad-${item.id}`} cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor={item.color} stopOpacity="0.8" />
                          <stop offset="100%" stopColor={item.color} stopOpacity="1" />
                        </radialGradient>
                      ))}
                    </defs>
                    {itemAngles.map((item, index) => {
                      const { startAngle, endAngle, sliceAngle } = item;
                      
                      const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                      const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                      const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                      const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
                      
                      const largeArcFlag = sliceAngle > 180 ? 1 : 0;
                      const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                      return (
                        <g key={item.id} className="transition-opacity duration-300">
                          <path 
                            d={pathData} 
                            fill={`url(#grad-${item.id})`} 
                            stroke="rgba(255,255,255,0.1)" 
                            strokeWidth="0.2" 
                          />
                          <text
                            x="78"
                            y="50"
                            fill="white"
                            fontSize="3.5"
                            fontWeight="800"
                            className="pointer-events-none drop-shadow-md"
                            transform={`rotate(${startAngle + sliceAngle / 2}, 50, 50)`}
                            style={{ textAnchor: 'middle', dominantBaseline: 'middle', letterSpacing: '0.05em' }}
                          >
                            {item.text.toUpperCase()}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                  
                  {/* Center Cap */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#1A1A1A] rounded-full border-4 border-white/20 z-10 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center translate-z-[20px]">
                    <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_15px_white]" />
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255,255,255,0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={spin}
            disabled={isSpinning || items.length < 2}
            className={`
              relative px-16 py-6 rounded-2xl text-2xl font-black uppercase tracking-[0.4em] transition-all duration-500
              ${(isSpinning || items.length < 2)
                ? 'bg-white/10 text-white/30 cursor-not-allowed' 
                : 'bg-white text-black hover:bg-gray-100'}
            `}
          >
            {isSpinning ? '回転中...' : items.length < 2 ? '項目を追加' : '回す'}
            {!isSpinning && (
              <motion.div 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 rounded-2xl border-2 border-white/50" 
              />
            )}
          </motion.button>
        </div>

        {/* Right Side: Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">

          {/* Section 1: テキスト追加 */}
          <div className="backdrop-blur-xl rounded-3xl border-2 border-blue-400/30 shadow-xl overflow-hidden">
            <div className="bg-blue-500/20 px-5 py-3 flex items-center gap-3 border-b border-blue-400/20">
              <h2 className="font-bold text-blue-200 text-sm tracking-wide">項目を追加</h2>
            </div>
            <div className="px-5 py-4 bg-blue-500/5">
              <div className="relative">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem()}
                  placeholder="項目を入力..."
                  className="w-full bg-white/5 border border-blue-400/20 px-6 py-5 rounded-2xl text-white text-xl placeholder:text-white/20 focus:bg-white/10 focus:border-blue-400/50 outline-none transition-all"
                />
                <button
                  onClick={addItem}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blue-500 hover:bg-blue-400 text-white rounded-xl transition-colors"
                >
                  <Plus size={22} />
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: 数字の範囲 */}
          <div className="backdrop-blur-xl rounded-3xl border-2 border-purple-400/30 shadow-xl overflow-hidden">
            <div className="bg-purple-500/20 px-5 py-3 flex items-center gap-3 border-b border-purple-400/20">
              <h2 className="font-bold text-purple-200 text-sm tracking-wide">数字の範囲で一括追加</h2>
            </div>
            <div className="px-5 py-4 bg-purple-500/5">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={rangeMin}
                  onChange={(e) => setRangeMin(e.target.value)}
                  className="w-20 bg-white/5 border border-purple-400/20 px-3 py-2 rounded-xl text-white text-center outline-none focus:bg-white/10 focus:border-purple-400/50 transition-all"
                />
                <span className="text-white/40 font-bold">〜</span>
                <input
                  type="number"
                  value={rangeMax}
                  onChange={(e) => setRangeMax(e.target.value)}
                  className="w-20 bg-white/5 border border-purple-400/20 px-3 py-2 rounded-xl text-white text-center outline-none focus:bg-white/10 focus:border-purple-400/50 transition-all"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={addRange}
                  disabled={isNaN(parseInt(rangeMin)) || isNaN(parseInt(rangeMax)) || parseInt(rangeMin) > parseInt(rangeMax) || parseInt(rangeMax) - parseInt(rangeMin) >= 100}
                  className="flex-1 py-2 bg-purple-500/30 hover:bg-purple-500/50 border border-purple-400/30 rounded-xl text-sm font-bold text-purple-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  追加
                </motion.button>
              </div>
              {!isNaN(parseInt(rangeMin)) && !isNaN(parseInt(rangeMax)) && parseInt(rangeMax) - parseInt(rangeMin) >= 100 && (
                <p className="text-red-400/70 text-xs mt-2">範囲は100以内にしてください</p>
              )}
            </div>
          </div>

          {/* Section 3: 項目一覧 */}
          <div className="backdrop-blur-xl rounded-3xl border-2 border-emerald-400/30 shadow-xl overflow-hidden">
            <div className="bg-emerald-500/20 px-5 py-3 flex items-center justify-between border-b border-emerald-400/20">
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-emerald-200 text-sm tracking-wide">項目一覧</h2>
                <span className="bg-emerald-500/30 text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full">{items.length}件</span>
              </div>
              {items.length > 0 && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setItems([])}
                  className="py-1 px-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-xs text-red-400 transition-all font-bold"
                >
                  全削除
                </motion.button>
              )}
            </div>
            <div className="px-5 py-4 bg-emerald-500/5">
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {items.length === 0 && (
                    <p className="text-white/20 text-sm text-center py-6">項目がありません</p>
                  )}
                  {items.map((item) => (
                    <motion.div
                      layout
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 20, opacity: 0 }}
                      key={item.id}
                      className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }}
                        />
                        {editingId === item.id ? (
                          <input
                            autoFocus
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onBlur={() => commitEdit(item.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitEdit(item.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            className="flex-1 bg-white/10 border border-white/30 rounded-lg px-2 py-1 text-sm text-white outline-none min-w-0"
                          />
                        ) : (
                          <span
                            className="font-bold text-white/90 truncate flex-1 cursor-pointer active:text-white"
                            onClick={() => startEdit(item)}
                          >
                            {item.text}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-white/30">割合</span>
                          <input
                            type="number"
                            value={item.weight}
                            onChange={(e) => updateWeight(item.id, parseFloat(e.target.value) || 0)}
                            step="0.1"
                            min="0.1"
                            className="w-14 bg-white/5 border border-white/10 rounded-lg py-2 px-2 text-xs text-center outline-none focus:bg-white/10 focus:border-white/30"
                          />
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-white/30 hover:text-red-500 active:text-red-500 transition-colors p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Winner Modal - Deluxe Version */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
          >
            {/* Background Image Particles for Winner */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(16)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: (window.innerWidth / 16) * i + Math.random() * 80,
                    y: window.innerHeight + 100,
                    rotate: Math.random() * 360,
                    scale: 0.4 + Math.random() * 0.5,
                    opacity: 0.8,
                  }}
                  animate={{
                    y: -150,
                    rotate: i % 2 === 0 ? 360 : -360,
                    x: (window.innerWidth / 16) * i + (Math.random() - 0.5) * 150,
                  }}
                  transition={{
                    duration: 2 + Math.random() * 3,
                    repeat: Infinity,
                    ease: "linear",
                    delay: Math.random() * 2,
                  }}
                  className="absolute w-32 h-32 rounded-2xl overflow-hidden shadow-lg"
                >
                  <img
                    src={i % 3 === 0 ? "/images/nice-ku copy.jpg" : "/images/nice-ku.jpg"}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.5, y: 100, rotateX: 45 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.5, y: 100, opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-[60px] p-16 max-w-2xl w-full relative shadow-[0_0_100px_rgba(255,255,255,0.1)] text-center overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
              
              <button 
                onClick={() => setWinner(null)}
                className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
              >
                <X size={32} />
              </button>

              <motion.div 
                animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mb-8 inline-flex rounded-full overflow-hidden border-4 border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
              >
                <img src="/images/IMG_2954 2.jpg" alt="" className="w-48 h-48 object-cover" />
              </motion.div>

              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-7xl md:text-9xl font-black mb-12 break-words text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600"
                style={{ textShadow: `0 0 40px ${winner.color}44` }}
              >
                {winner.text.toUpperCase()}
              </motion.div>

              <button
                onClick={() => setWinner(null)}
                className="w-full py-6 bg-white text-black rounded-3xl font-black text-xl hover:bg-gray-200 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95"
              >
                続ける
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}
