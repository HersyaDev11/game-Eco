import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, Student } from '../store/gameStore';
import { initMultiplayerListener, startGame, endGame } from '../services/multiplayer';

export default function HostScreen() {
  const { roomId } = useParams();
  const { status, students, setRoomId, setStatus, resetGame, roomSettings, setRoomSettings } = useGameStore();
  const [timeLeft, setTimeLeft] = useState(60);
  const [showGlobal, setShowGlobal] = useState(false);
  const [globalScores, setGlobalScores] = useState<Student[]>([]);

  useEffect(() => {
    if (roomId) {
      setRoomId(roomId);
      initMultiplayerListener();
    }
    return () => {
      resetGame();
    };
  }, [roomId, setRoomId, resetGame]);

  // Load global scores
  useEffect(() => {
    const saved = localStorage.getItem('ecosort_global_leaderboard');
    if (saved) {
      try {
        setGlobalScores(JSON.parse(saved));
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    let timer: number;
    if (status === 'playing' && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (status === 'playing' && timeLeft === 0) {
      setStatus('podium');
      if (roomId) endGame(roomId);
      
      // Save scores to global leaderboard
      const saved = localStorage.getItem('ecosort_global_leaderboard');
      let currentGlobal: Student[] = saved ? JSON.parse(saved) : [];
      
      // Merge current students into global (if ID exists, update max score)
      students.forEach(s => {
        const existing = currentGlobal.find(g => g.id === s.id);
        if (existing) {
          if (s.score > existing.score) {
            existing.score = s.score;
            existing.combo = Math.max(existing.combo, s.combo);
          }
        } else {
          currentGlobal.push(s);
        }
      });
      
      localStorage.setItem('ecosort_global_leaderboard', JSON.stringify(currentGlobal));
      setGlobalScores(currentGlobal);
    }
    return () => clearInterval(timer);
  }, [status, timeLeft, setStatus, roomId, students]);

  // Check for K.O. (Survival Mode)
  useEffect(() => {
    if (status === 'playing' && timeLeft > 0) {
      const merahMistakes = students.filter(s => s.team === 'merah').reduce((acc, curr) => acc + (curr.mistakes || 0), 0);
      const biruMistakes = students.filter(s => s.team === 'biru').reduce((acc, curr) => acc + (curr.mistakes || 0), 0);
      const mHP = Math.max(0, 100 - merahMistakes * roomSettings.damage);
      const bHP = Math.max(0, 100 - biruMistakes * roomSettings.damage);
      
      if (mHP <= 0 || bHP <= 0) {
        setTimeLeft(0); // End game immediately
      }
    }
  }, [students, status, timeLeft, roomSettings.damage]);

  const handleStart = () => {
    if (roomId) {
      setStatus('playing');
      setTimeLeft(roomSettings.duration);
      startGame(roomId, roomSettings);
    }
  };

  const sortedStudents = [...students].sort((a, b) => b.score - a.score);
  const sortedGlobal = [...globalScores].sort((a, b) => b.score - a.score);


  const merahMistakes = students.filter(s => s.team === 'merah').reduce((acc, curr) => acc + (curr.mistakes || 0), 0);
  const biruMistakes = students.filter(s => s.team === 'biru').reduce((acc, curr) => acc + (curr.mistakes || 0), 0);
  const merahHP = Math.max(0, 100 - merahMistakes * roomSettings.damage);
  const biruHP = Math.max(0, 100 - biruMistakes * roomSettings.damage);

  return (
    <div className="min-h-screen p-8 flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/20 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-200/40 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

      {/* Header */}
      <header className="flex justify-between items-center mb-12 bg-white p-6 rounded-[2.5rem] border-4 border-slate-100 shadow-[0_15px_0_0_rgba(16,185,129,0.2)] relative z-20">
        <div>
          <h1 className="text-5xl font-black text-emerald-500">EcoSort HIMATI</h1>
          <p className="text-slate-400 mt-1 font-bold tracking-widest uppercase text-sm">Dashboard Panitia HIMATI</p>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowGlobal(!showGlobal)}
            className="px-6 py-4 bg-purple-100 text-purple-500 font-black rounded-3xl border-4 border-purple-200 shadow-[0_6px_0_0_#e9d5ff] hover:brightness-95 active:shadow-none active:translate-y-[6px] transition-all"
          >
            {showGlobal ? 'Tutup Klasemen' : '🏆 Klasemen Global'}
          </button>
          <div className="text-center px-8 py-3 bg-slate-100 rounded-3xl border-4 border-slate-200">
            <p className="text-sm text-slate-400 font-black mb-1 uppercase tracking-widest">PIN Ruangan</p>
            <p className="text-5xl font-black text-slate-800 tracking-[0.2em]">{roomId}</p>
          </div>
          <div className="text-center px-6 py-3 bg-blue-50 rounded-3xl border-4 border-blue-200">
             <p className="text-sm text-blue-400 font-black mb-1 uppercase tracking-widest">Peserta</p>
             <p className="text-4xl font-black text-blue-500">{students.length}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10">
        <AnimatePresence mode="wait">
          {showGlobal && (
               <motion.div
               key="global"
               initial={{ opacity: 0, y: 50, scale: 0.9 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 50, scale: 0.9 }}
               transition={{ type: 'spring', bounce: 0.5 }}
               className="w-full max-w-4xl bg-white p-10 rounded-[3rem] border-8 border-purple-200 shadow-[0_20px_0_0_#e9d5ff]"
             >
               <h2 className="text-5xl font-black text-purple-500 mb-8 text-center uppercase tracking-widest">Klasemen Global</h2>
               {sortedGlobal.length === 0 ? (
                  <p className="text-center text-slate-400 text-xl font-bold">Belum ada data skor tersimpan.</p>
               ) : (
                 <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                   {sortedGlobal.map((student, index) => (
                     <div key={student.id} className="bg-slate-50 p-4 rounded-3xl flex items-center justify-between border-4 border-slate-100 shadow-sm">
                        <div className="flex items-center gap-6">
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${index === 0 ? 'bg-yellow-400 text-white shadow-[0_4px_0_0_#ca8a04]' : index === 1 ? 'bg-slate-300 text-slate-600 shadow-[0_4px_0_0_#94a3b8]' : index === 2 ? 'bg-amber-600 text-white shadow-[0_4px_0_0_#b45309]' : 'bg-slate-200 text-slate-500 shadow-[0_4px_0_0_#cbd5e1]'}`}>
                              {index + 1}
                           </div>
                           <div>
                              <span className="text-3xl font-black text-slate-700">{student.name}</span>
                              <div className="flex gap-2 mt-1">
                                <span className={`text-sm px-3 py-1 rounded-full font-black ${student.team === 'merah' ? 'bg-rose-100 text-rose-500' : 'bg-blue-100 text-blue-500'}`}>
                                  Tim {student.team === 'merah' ? 'Merah' : 'Biru'}
                                </span>
                              </div>
                           </div>
                        </div>
                        <div className="text-4xl font-black text-emerald-500">{student.score}</div>
                     </div>
                   ))}
                 </div>
               )}
             </motion.div>
          )}

          {!showGlobal && status === 'lobby' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="text-center w-full max-w-4xl"
            >
              <div className="mb-12 bg-white p-10 rounded-[3rem] border-8 border-slate-100 shadow-[0_15px_0_0_#f1f5f9]">
                 <h2 className="text-4xl font-black text-slate-700 mb-8">Pengaturan Ruangan</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
                    <div className="bg-slate-50 p-4 rounded-2xl border-4 border-slate-200">
                       <p className="font-black text-slate-500 mb-2">Durasi Permainan</p>
                       <select 
                         className="w-full bg-white border-2 border-slate-300 rounded-xl p-2 font-bold text-slate-700 outline-none cursor-pointer"
                         value={roomSettings.duration}
                         onChange={(e) => setRoomSettings({ ...roomSettings, duration: Number(e.target.value) })}
                       >
                          <option value={30}>30 Detik</option>
                          <option value={60}>60 Detik</option>
                          <option value={90}>90 Detik</option>
                       </select>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border-4 border-slate-200">
                       <p className="font-black text-slate-500 mb-2">Damage Kesalahan</p>
                       <select 
                         className="w-full bg-white border-2 border-slate-300 rounded-xl p-2 font-bold text-slate-700 outline-none cursor-pointer"
                         value={roomSettings.damage}
                         onChange={(e) => setRoomSettings({ ...roomSettings, damage: Number(e.target.value) })}
                       >
                          <option value={2}>Mudah (2 HP)</option>
                          <option value={5}>Normal (5 HP)</option>
                          <option value={10}>Hardcore (10 HP)</option>
                       </select>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border-4 border-slate-200">
                       <p className="font-black text-slate-500 mb-2">Tingkat Kesulitan</p>
                       <select 
                         className="w-full bg-white border-2 border-slate-300 rounded-xl p-2 font-bold text-slate-700 outline-none cursor-pointer"
                         value={roomSettings.difficulty}
                         onChange={(e) => setRoomSettings({ ...roomSettings, difficulty: e.target.value as any })}
                       >
                          <option value="mudah">Mudah (2 Jenis)</option>
                          <option value="normal">Normal (3 Jenis)</option>
                          <option value="sulit">Sulit (4 Jenis)</option>
                       </select>
                    </div>
                 </div>
                 
                 <h2 className="text-4xl font-black text-slate-700 mb-8 border-t-4 border-slate-100 pt-8">Peserta yang bergabung:</h2>
                 <div className="flex flex-wrap justify-center gap-4 min-h-[200px]">
                   {students.length === 0 ? (
                     <div className="flex flex-col items-center justify-center text-slate-400 w-full font-bold">
                       <i className="ph-duotone ph-hourglass-high text-7xl mb-4 animate-bounce text-emerald-300"></i>
                       <p className="text-2xl">Menunggu peserta...</p>
                     </div>
                   ) : (
                     students.map((student) => (
                       <motion.div
                         key={student.id}
                         initial={{ opacity: 0, scale: 0.5, y: 50 }}
                         animate={{ opacity: 1, scale: 1, y: 0 }}
                         transition={{ type: 'spring', bounce: 0.6 }}
                         className={`px-8 py-4 rounded-3xl font-black text-2xl border-4 ${student.team === 'merah' ? 'bg-rose-100 text-rose-500 border-rose-200 shadow-[0_6px_0_0_#fecdd3]' : 'bg-blue-100 text-blue-500 border-blue-200 shadow-[0_6px_0_0_#bfdbfe]'}`}
                       >
                         {student.name}
                       </motion.div>
                     ))
                   )}
                 </div>
              </div>
              
              <button
                onClick={handleStart}
                disabled={students.length === 0}
                className="group relative px-12 py-6 bg-emerald-400 text-white font-black text-4xl rounded-full disabled:opacity-50 disabled:cursor-not-allowed border-b-[12px] border-emerald-600 active:border-b-0 active:translate-y-[12px] transition-all overflow-hidden"
              >
                MULAI PERMAINAN
              </button>
            </motion.div>
          )}

          {!showGlobal && status === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-6xl flex flex-col items-center"
            >
              <div className="w-full flex justify-between items-end mb-8">
                {/* Timer */}
                <div className="text-center bg-white px-10 py-6 rounded-[3rem] border-8 border-slate-100 shadow-[0_15px_0_0_#f1f5f9]">
                  <p className="text-slate-400 font-black tracking-widest uppercase mb-2 text-xl">Waktu</p>
                  <div className={`text-7xl font-black ${timeLeft <= 10 ? 'text-rose-500 animate-bounce' : 'text-slate-800'}`}>
                    {timeLeft}
                  </div>
                </div>

                 {/* Survival Mode HP Bars */}
                <div className="flex-1 max-w-3xl mx-8 bg-white p-6 rounded-[3rem] border-8 border-slate-100 shadow-[0_15px_0_0_#f1f5f9] flex flex-col justify-center gap-4">
                   <div className="flex justify-between items-center w-full">
                      <div className="text-rose-500 font-black text-2xl w-24">TIM MERAH</div>
                      <div className="flex-1 mx-4 h-10 bg-slate-100 rounded-full overflow-hidden flex border-4 border-slate-200 shadow-inner relative">
                         <motion.div 
                            className="h-full bg-rose-500 relative"
                            animate={{ width: `${merahHP}%` }}
                            transition={{ type: 'spring', bounce: 0.5 }}
                         >
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_1s_infinite_linear]"></div>
                         </motion.div>
                      </div>
                      <div className="text-rose-500 font-black text-3xl w-20 text-right">{merahHP}%</div>
                   </div>

                   <div className="flex justify-between items-center w-full">
                      <div className="text-blue-500 font-black text-2xl w-24">TIM BIRU</div>
                      <div className="flex-1 mx-4 h-10 bg-slate-100 rounded-full overflow-hidden flex border-4 border-slate-200 shadow-inner relative">
                         <motion.div 
                            className="h-full bg-blue-500 relative"
                            animate={{ width: `${biruHP}%` }}
                            transition={{ type: 'spring', bounce: 0.5 }}
                         >
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_1s_infinite_linear]"></div>
                         </motion.div>
                      </div>
                      <div className="text-blue-500 font-black text-3xl w-20 text-right">{biruHP}%</div>
                   </div>
                </div>
              </div>

              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedStudents.map((student, index) => (
                  <motion.div
                    key={student.id}
                    layout
                    className={`bg-white border-4 rounded-[2rem] p-6 flex items-center justify-between shadow-[0_10px_0_0_rgba(0,0,0,0.05)] ${student.team === 'merah' ? 'border-rose-200' : 'border-blue-200'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl ${index === 0 ? 'bg-yellow-400 text-white shadow-[0_4px_0_0_#ca8a04]' : index === 1 ? 'bg-slate-300 text-slate-600 shadow-[0_4px_0_0_#94a3b8]' : index === 2 ? 'bg-amber-600 text-white shadow-[0_4px_0_0_#b45309]' : 'bg-slate-100 text-slate-400 shadow-[0_4px_0_0_#e2e8f0]'}`}>
                        {index + 1}
                      </div>
                      <span className="text-3xl font-black text-slate-700">{student.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-5xl font-black text-emerald-500">{student.score}</div>
                      {student.combo >= 3 && (
                        <motion.div 
                          initial={{ scale: 0.5 }}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 0.5 }}
                          className="text-lg font-black text-yellow-500 mt-1"
                        >
                          🔥 {student.combo}x COMBO
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {!showGlobal && status === 'podium' && (
            <motion.div
              key="podium"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-5xl text-center"
            >
              <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 mb-8 drop-shadow-lg uppercase tracking-wider">Hasil Akhir Lomba HIMATI</h2>
              
              <div className="mb-12 text-4xl font-black p-8 bg-white rounded-[3rem] border-8 border-slate-100 shadow-[0_15px_0_0_#f1f5f9] inline-block text-slate-700">
                 TIM BERTAHAN: 
                 <span className={`ml-4 ${merahHP > biruHP ? 'text-rose-500' : merahHP < biruHP ? 'text-blue-500' : 'text-slate-400'}`}>
                    {merahHP > biruHP ? '🔴 TIM MERAH' : merahHP < biruHP ? '🔵 TIM BIRU' : 'SERI'}
                 </span>
              </div>

              <div className="flex justify-center items-end gap-6 h-[450px]">
                {/* 2nd Place */}
                {sortedStudents[1] && (
                  <motion.div 
                    initial={{ y: 200, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                    className="flex flex-col items-center z-10"
                  >
                    <i className="ph-fill ph-medal text-6xl mb-4 bg-slate-100 p-4 rounded-full border-4 border-slate-300 text-slate-400 shadow-[0_8px_0_0_#cbd5e1]"></i>
                    <div className="bg-white px-6 py-2 rounded-2xl border-4 border-slate-100 shadow-[0_6px_0_0_#f1f5f9] mb-4 text-center">
                       <div className="text-3xl font-black text-slate-700">{sortedStudents[1].name}</div>
                       <div className="text-xl font-bold text-emerald-500">{sortedStudents[1].score} pts</div>
                    </div>
                    <div className="w-48 h-48 bg-slate-200 rounded-t-3xl border-t-8 border-slate-300 shadow-[0_-10px_0_0_rgba(0,0,0,0.05)] flex items-center justify-center">
                       <span className="text-7xl font-black text-slate-400">2</span>
                    </div>
                  </motion.div>
                )}

                {/* 1st Place */}
                {sortedStudents[0] && (
                  <motion.div 
                    initial={{ y: 300, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, type: 'spring', bounce: 0.5 }}
                    className="flex flex-col items-center z-20"
                  >
                    <i className="ph-fill ph-crown text-8xl mb-6 bg-yellow-100 p-5 rounded-full border-4 border-yellow-300 text-yellow-400 shadow-[0_8px_0_0_#fde047] animate-bounce"></i>
                    <div className="bg-white px-8 py-3 rounded-3xl border-4 border-yellow-100 shadow-[0_8px_0_0_#fef08a] mb-4 text-center">
                       <div className="text-4xl font-black text-slate-800">{sortedStudents[0].name}</div>
                       <div className="text-2xl font-black text-emerald-500">{sortedStudents[0].score} pts</div>
                    </div>
                    <div className="w-56 h-64 bg-yellow-400 rounded-t-3xl border-t-8 border-yellow-300 shadow-[0_-10px_0_0_rgba(0,0,0,0.1)] flex items-center justify-center">
                       <span className="text-8xl font-black text-yellow-600">1</span>
                    </div>
                  </motion.div>
                )}

                {/* 3rd Place */}
                {sortedStudents[2] && (
                  <motion.div 
                    initial={{ y: 150, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0, type: 'spring', bounce: 0.5 }}
                    className="flex flex-col items-center z-0"
                  >
                    <i className="ph-fill ph-medal text-5xl mb-4 bg-amber-100 p-3 rounded-full border-4 border-amber-300 text-amber-500 shadow-[0_8px_0_0_#fcd34d]"></i>
                    <div className="bg-white px-6 py-2 rounded-2xl border-4 border-amber-50 shadow-[0_6px_0_0_#fef3c7] mb-4 text-center">
                       <div className="text-2xl font-black text-slate-700">{sortedStudents[2].name}</div>
                       <div className="text-xl font-bold text-emerald-500">{sortedStudents[2].score} pts</div>
                    </div>
                    <div className="w-48 h-36 bg-amber-600 rounded-t-3xl border-t-8 border-amber-500 shadow-[0_-10px_0_0_rgba(0,0,0,0.1)] flex items-center justify-center">
                       <span className="text-7xl font-black text-amber-700">3</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
