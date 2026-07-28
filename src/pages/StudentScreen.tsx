import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, useDraggable, useDroppable, DragEndEvent, useSensors, useSensor, TouchSensor, MouseSensor } from '@dnd-kit/core';
import { Howl } from 'howler';
import { useGameStore } from '../store/gameStore';
import { initMultiplayerListener, joinRoom, sendScoreUpdate } from '../services/multiplayer';
import { TRASH_BINS, getRandomTrash } from '../utils/gameData';
import type { TrashItemData } from '../utils/gameData';

const soundBloop = new Howl({ src: ['https://actions.google.com/sounds/v1/water/air_release_underwater.ogg'] });
const soundTada = new Howl({ src: ['https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg'] });
const soundWrong = new Howl({ src: ['https://actions.google.com/sounds/v1/cartoon/slip_and_slide.ogg'] });

export default function StudentScreen() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { status, studentId, studentName, studentTeam, score, setScore, setRoomId, resetGame, roomSettings } = useGameStore();
  
  const [currentTrash, setCurrentTrash] = useState<TrashItemData | null>(null);
  const [combo, setCombo] = useState(0);
  const [vibrateMode, setVibrateMode] = useState<'none' | 'success' | 'error'>('none');

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    if (!studentId || !studentName || !studentTeam) {
      navigate('/');
      return;
    }

    if (roomId) {
      setRoomId(roomId);
      initMultiplayerListener();
      joinRoom(roomId, { id: studentId, name: studentName, team: studentTeam, score: 0, combo: 0, mistakes: 0 });
    }
  }, [roomId, studentId, studentName, studentTeam, navigate, setRoomId]);

  useEffect(() => {
    if (status === 'playing' && !currentTrash) {
      setCurrentTrash(getRandomTrash(roomSettings.difficulty));
      soundBloop.play();
    }
  }, [status, currentTrash, roomSettings.difficulty]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;
    if (!over || !currentTrash || !studentId || status !== 'playing' || !roomId) return;

    const binCategory = over.id;
    let scoreDelta = 0;
    let newCombo = combo;

    if (binCategory === currentTrash.category) {
      newCombo += 1;
      const multiplier = newCombo >= 3 ? (newCombo >= 6 ? 3 : 2) : 1;
      const basePoints = currentTrash.isGolden ? 50 : 10;
      scoreDelta = basePoints * multiplier;
      soundTada.play();
      
      setVibrateMode('success');
      setTimeout(() => setVibrateMode('none'), 500);
      if (newCombo >= 3 && navigator.vibrate) navigator.vibrate(200);
    } else {
      scoreDelta = -5;
      newCombo = 0;
      soundWrong.play();
      
      setVibrateMode('error');
      setTimeout(() => setVibrateMode('none'), 500);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }

    const newScore = Math.max(0, score + scoreDelta);
    setScore(newScore);
    setCombo(newCombo);
    
    sendScoreUpdate(roomId, studentId, scoreDelta, newCombo);

    setCurrentTrash(null);
    setTimeout(() => {
      setCurrentTrash(getRandomTrash(roomSettings.difficulty));
      soundBloop.play();
    }, 200);
  };

  if (!studentId) return null;

  let skyGradient = '';
  if (vibrateMode === 'success') {
     skyGradient = 'from-emerald-200 to-emerald-400';
  } else if (vibrateMode === 'error') {
     skyGradient = 'from-rose-200 to-rose-400';
  } else {
     skyGradient = 'from-sky-200 to-blue-300';
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-300 relative overflow-hidden z-0 bg-gradient-to-b ${skyGradient}`}>
      {/* Cartoon Nature Background */}
      
      {/* Sun / Moon based on team */}
      <div className={`absolute top-10 right-10 w-24 h-24 rounded-full mix-blend-overlay opacity-80 blur-[2px] animate-[pulse_4s_infinite] ${studentTeam === 'merah' ? 'bg-rose-300' : 'bg-white'}`}></div>

      {/* Floating Clouds */}
      <div className="absolute top-20 left-10 w-32 h-10 bg-white/60 rounded-full blur-[1px] animate-[pan_15s_linear_infinite] pointer-events-none before:content-[''] before:absolute before:-top-6 before:left-4 before:w-16 before:h-16 before:bg-white/60 before:rounded-full after:content-[''] after:absolute after:-top-4 after:right-4 after:w-12 after:h-12 after:bg-white/60 after:rounded-full"></div>
      
      <div className="absolute top-40 right-20 w-40 h-12 bg-white/50 rounded-full blur-[1px] animate-[pan_25s_linear_infinite_reverse] pointer-events-none before:content-[''] before:absolute before:-top-8 before:left-6 before:w-20 before:h-20 before:bg-white/50 before:rounded-full after:content-[''] after:absolute after:-top-5 after:right-6 after:w-14 after:h-14 after:bg-white/50 after:rounded-full"></div>

      {/* Rolling Hills (Grass) */}
      <div className="absolute -bottom-20 -left-[20%] w-[150%] h-[40vh] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-[100%] shadow-[inset_0_20px_20px_rgba(255,255,255,0.2)] z-[-1]"></div>
      <div className="absolute -bottom-32 -right-[10%] w-[120%] h-[45vh] bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-[100%] shadow-[inset_0_20px_20px_rgba(255,255,255,0.2)] z-[-1] opacity-90"></div>

      <AnimatePresence mode="wait">
        {status === 'lobby' && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-center bg-white p-10 rounded-[3rem] border-8 shadow-[0_15px_0_0_rgba(0,0,0,0.05)] ${studentTeam === 'merah' ? 'border-rose-200' : 'border-blue-200'}`}
          >
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="text-7xl mb-8 inline-block filter drop-shadow-[0_0_15px_rgba(255,255,255,1)] text-slate-300"
            >
              <i className="ph-duotone ph-hourglass-high text-emerald-400"></i>
            </motion.div>
            <h2 className={`text-5xl font-black mb-2 ${studentTeam === 'merah' ? 'text-rose-500' : 'text-blue-500'}`}>Tim {studentTeam === 'merah' ? 'Merah' : 'Biru'} Bersiap!</h2>
            <p className="text-2xl font-bold text-slate-400">Tunggu Panitia HIMATI memulai permainan.</p>
          </motion.div>
        )}

        {status === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 w-full flex flex-col relative z-10 max-w-lg mx-auto"
          >
            {/* Top Bar: Score & Combo */}
            <div className="flex justify-between items-center bg-white p-5 rounded-[2rem] shadow-[0_8px_0_0_rgba(0,0,0,0.05)] border-4 border-slate-100 mb-8 mt-2">
              <div className="flex flex-col items-start px-4">
                 <span className="text-slate-400 text-sm font-black uppercase tracking-widest mb-1">Poin</span>
                 <span className="text-emerald-500 text-4xl font-black">{score}</span>
              </div>
              <AnimatePresence>
                {combo >= 2 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    className="bg-yellow-400 text-white font-black px-6 py-3 rounded-2xl text-xl shadow-[0_6px_0_0_#ca8a04] border-4 border-yellow-200"
                  >
                    {combo}x COMBO!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Game Area */}
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <div className="flex-1 flex flex-col justify-center items-center relative h-64">
                <AnimatePresence>
                  {currentTrash && (
                    <DraggableTrash key={currentTrash.id} trash={currentTrash} onTrashClick={(clicksLeft) => setCurrentTrash({ ...currentTrash, clicksNeeded: clicksLeft })} />
                  )}
                </AnimatePresence>
              </div>

              {/* Bins Area */}
              <div className={`grid ${roomSettings.difficulty === 'mudah' ? 'grid-cols-2' : roomSettings.difficulty === 'normal' ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'} gap-2 sm:gap-5 mt-auto mb-4 w-full place-items-center`}>
                {TRASH_BINS.filter(bin => {
                  if (bin.id === 'organik' || bin.id === 'anorganik') return true;
                  if (bin.id === 'kertas' && (roomSettings.difficulty === 'normal' || roomSettings.difficulty === 'sulit')) return true;
                  if (bin.id === 'b3' && roomSettings.difficulty === 'sulit') return true;
                  return false;
                }).map((bin) => (
                  <DroppableBin key={bin.id} id={bin.id} label={bin.label} color={bin.color} emoji={bin.emoji} />
                ))}
              </div>
            </DndContext>
          </motion.div>
        )}

        {status === 'podium' && (
          <motion.div
            key="podium"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center bg-white p-10 rounded-[3rem] border-8 border-slate-100 shadow-[0_15px_0_0_rgba(0,0,0,0.05)] w-full max-w-sm flex flex-col items-center"
          >
            <h2 className="text-4xl font-black text-amber-500 mb-8 uppercase tracking-widest">WAKTU HABIS!</h2>
            <div className="text-8xl mb-8 filter drop-shadow-[0_10px_0_rgba(0,0,0,0.1)]">🏁</div>
            <p className="text-2xl text-slate-400 mb-2 uppercase tracking-widest font-black">Total Skormu</p>
            <p className="text-8xl font-black text-emerald-500 mb-10">{score}</p>
            
            <button
               onClick={() => { resetGame(); navigate('/'); }}
               className="w-full bg-blue-400 text-white font-black py-5 rounded-3xl border-4 border-blue-500 shadow-[0_8px_0_0_#2563eb] hover:brightness-110 active:shadow-none active:translate-y-[8px] transition-all text-xl"
            >
               Main Lagi
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DraggableTrash({ trash, onTrashClick }: { trash: TrashItemData, onTrashClick: (clicksLeft: number) => void }) {
  const isLocked = trash.isGolden && (trash.clicksNeeded || 0) > 0;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: trash.id,
    disabled: isLocked, // Disable drag if locked
  });
  
  // Apply dnd-kit transform to a wrapper div so it doesn't conflict with framer-motion's animate
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const handleClick = () => {
     if (isLocked) {
        soundBloop.play();
        if (navigator.vibrate) navigator.vibrate(50);
        onTrashClick((trash.clicksNeeded || 1) - 1);
     }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...(isLocked ? {} : listeners)} 
      {...(isLocked ? {} : attributes)} 
      onPointerDown={(e) => {
         if (isLocked) {
            e.stopPropagation();
            handleClick();
         } else if (listeners?.onPointerDown) {
            listeners.onPointerDown(e as unknown as React.PointerEvent<Element>);
         }
      }}
      className={`absolute z-50 touch-none ${isLocked ? 'cursor-pointer' : isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      <motion.div
        initial={{ scale: 0, y: -50 }}
        animate={isLocked ? { scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] } : { scale: 1, y: 0 }}
        exit={{ scale: 0, y: 50, opacity: 0, transition: { duration: 0.2 } }}
        className={`bg-white text-9xl p-8 rounded-full shadow-[0_15px_0_0_rgba(0,0,0,0.1)] border-8 ${trash.isGolden ? 'border-yellow-400 bg-yellow-50' : 'border-slate-100'} flex flex-col items-center justify-center gap-3 transition-transform duration-200 ${!isLocked && isDragging ? 'scale-110' : !isLocked ? 'hover:scale-105' : ''}`}
      >
        {trash.imageUrl ? (
           <img src={trash.imageUrl} alt={trash.name} className={`w-32 h-32 object-contain filter drop-shadow-xl ${isLocked ? 'grayscale opacity-70 blur-[2px]' : ''}`} />
        ) : (
           <span className={`filter drop-shadow-md ${isLocked ? 'grayscale opacity-70 blur-[2px]' : ''}`}>{trash.emoji}</span>
        )}
        
        {/* Golden Trash Overlays */}
        {trash.isGolden && (
           <div className="absolute inset-0 rounded-full shadow-[inset_0_0_50px_rgba(250,204,21,0.5)] border-4 border-yellow-200 pointer-events-none animate-[pulse_2s_infinite]"></div>
        )}
        
        {isLocked && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 rounded-full backdrop-blur-[2px]">
              <i className="ph-fill ph-lock-key text-6xl text-white drop-shadow-lg mb-2"></i>
              <span className="bg-rose-500 text-white font-black text-2xl px-4 py-1 rounded-full border-4 border-rose-300 shadow-lg animate-bounce">TAP {trash.clicksNeeded}x</span>
           </div>
        )}

        <span className="text-lg font-black text-slate-700 absolute -bottom-12 whitespace-nowrap bg-white border-4 border-slate-100 px-6 py-2 rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,0.05)]">
           {trash.isGolden ? '🌟 ' : ''}{trash.name}
        </span>
      </motion.div>
    </div>
  );
}

function DroppableBin({ id, label, color, emoji }: { id: string, label: string, color: string, emoji: string }) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });
  
  // Real 3D Recycling Bin Colors
  const binStyles: Record<string, Record<string, string>> = {
    'bg-green-500': { 
        front: 'bg-emerald-500', 
        side: 'bg-emerald-600', 
        back: 'bg-emerald-700', 
        lid: 'bg-emerald-400',
        border: 'border-emerald-600',
        shadow: 'shadow-[0_0_30px_rgba(16,185,129,0.5)]'
    },
    'bg-yellow-400': { 
        front: 'bg-amber-400', 
        side: 'bg-amber-500', 
        back: 'bg-amber-600', 
        lid: 'bg-amber-300',
        border: 'border-amber-500',
        shadow: 'shadow-[0_0_30px_rgba(245,158,11,0.5)]'
    },
    'bg-blue-400': { 
        front: 'bg-blue-500', 
        side: 'bg-blue-600', 
        back: 'bg-blue-700', 
        lid: 'bg-blue-400',
        border: 'border-blue-600',
        shadow: 'shadow-[0_0_30px_rgba(59,130,246,0.5)]'
    },
    'bg-red-500': { 
        front: 'bg-rose-500', 
        side: 'bg-rose-600', 
        back: 'bg-rose-700', 
        lid: 'bg-rose-400',
        border: 'border-rose-600',
        shadow: 'shadow-[0_0_30px_rgba(244,63,94,0.5)]'
    },
  };

  const style = binStyles[color] || binStyles['bg-green-500'];

  return (
    <div
      ref={setNodeRef}
      className={`relative w-[80px] sm:w-[120px] h-[120px] sm:h-[160px] mx-auto transition-transform duration-300 ${isOver ? 'scale-110 z-20' : 'z-10'}`}
      style={{ perspective: '1000px' }}
    >
      {/* Responsive Wrapper for Scale */}
      <div className="w-full h-full absolute top-2 sm:top-6 scale-[0.7] sm:scale-100 origin-top flex justify-center">
      {/* 3D Container */}
      <div 
        className="w-[120px] h-[160px] absolute"
        style={{ 
          transformStyle: 'preserve-3d', 
          transform: 'rotateX(-15deg) rotateY(-20deg)' 
        }}
      >
        {/* Floor Shadow */}
        <div 
           className={`absolute w-[120px] h-[120px] bg-black/30 blur-md transition-all duration-300 ${isOver ? style.shadow : ''}`} 
           style={{ transform: 'translateY(130px) rotateX(90deg)', transformOrigin: 'top center' }}
        ></div>

        {/* Back Face */}
        <div 
          className={`absolute w-[120px] h-[130px] ${style.back} border-2 ${style.border}`} 
          style={{ transform: 'rotateY(180deg) translateZ(60px)' }}
        ></div>
        
        {/* Right Face */}
        <div 
          className={`absolute w-[120px] h-[130px] ${style.side} border-2 ${style.border} flex flex-col justify-evenly`} 
          style={{ transform: 'rotateY(90deg) translateZ(60px)' }}
        >
           {/* Decorative Ridges */}
           <div className="w-full h-2 bg-black/10"></div>
           <div className="w-full h-2 bg-black/10"></div>
           <div className="w-full h-2 bg-black/10"></div>
        </div>
        
        {/* Left Face */}
        <div 
          className={`absolute w-[120px] h-[130px] ${style.side} border-2 ${style.border} flex flex-col justify-evenly`} 
          style={{ transform: 'rotateY(-90deg) translateZ(60px)' }}
        >
           <div className="w-full h-2 bg-black/10"></div>
           <div className="w-full h-2 bg-black/10"></div>
           <div className="w-full h-2 bg-black/10"></div>
        </div>
        
        {/* Inside Bottom (Base) */}
        <div 
          className="absolute w-[120px] h-[120px] bg-slate-900 border-2 border-black/50" 
          style={{ transform: 'translateY(130px) rotateX(90deg)', transformOrigin: 'top center' }}
        ></div>
        
        {/* Front Face */}
        <div 
          className={`absolute w-[120px] h-[130px] ${style.front} border-2 ${style.border} flex flex-col items-center justify-center`} 
          style={{ transform: 'translateZ(60px)' }}
        >
            <span className="text-5xl filter drop-shadow-sm mb-1">{emoji}</span>
            <span className="bg-white text-slate-800 text-[11px] font-black uppercase px-2 py-1 rounded-md shadow-sm border-2 border-slate-200 mt-2">
               {label}
            </span>
        </div>

        {/* Lid Hinge & Face */}
        <div 
          className="absolute top-0 left-0 w-[120px] h-[120px] z-30"
          style={{ 
            transformStyle: 'preserve-3d', 
            transformOrigin: 'top center',
            transform: `translateZ(-60px) ${isOver ? 'rotateX(150deg)' : 'rotateX(90deg)'}`,
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
           {/* Lid Top Face */}
           <div className={`absolute w-[124px] h-[124px] -left-[2px] -top-[2px] ${style.lid} border-2 ${style.border} flex items-center justify-center`} style={{ transform: 'translateZ(0px)' }}>
              {/* Inner detail */}
              <div className="w-24 h-24 border-4 border-black/10 rounded-sm"></div>
           </div>
           
           {/* Lid Lip (Front Edge) */}
           <div 
             className={`absolute bottom-0 left-0 w-[120px] h-[12px] ${style.lid} border-2 ${style.border}`}
             style={{ transformOrigin: 'bottom center', transform: 'rotateX(-90deg)' }}
           ></div>
        </div>
      </div>
      </div>
    </div>
  );
}
