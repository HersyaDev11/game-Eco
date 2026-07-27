import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export default function Home() {
  const navigate = useNavigate();
  const setRoomId = useGameStore((state) => state.setRoomId);
  const setStudentInfo = useGameStore((state) => state.setStudentInfo);

  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [team, setTeam] = useState<'merah' | 'biru' | null>(null);
  const [mode, setMode] = useState<'select' | 'student'>('select');

  const handleCreateRoom = () => {
    // Generate random 5 digit PIN
    const newPin = Math.floor(10000 + Math.random() * 90000).toString();
    setRoomId(newPin);
    navigate(`/host/${newPin}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 5 && name.trim() && team) {
      setRoomId(pin);
      const studentId = Math.random().toString(36).substring(7);
      setStudentInfo(studentId, name, team);
      navigate(`/play/${pin}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative bouncy background blobs */}
      <motion.div 
         animate={{ y: [-20, 20, -20], rotate: [0, 10, 0] }}
         transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
         className="absolute top-10 left-10 w-64 h-64 bg-white/30 rounded-full blur-3xl -z-10 pointer-events-none"
      ></motion.div>
      <motion.div 
         animate={{ y: [20, -20, 20], rotate: [0, -10, 0] }}
         transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
         className="absolute bottom-10 right-10 w-80 h-80 bg-teal-400/30 rounded-full blur-3xl -z-10 pointer-events-none"
      ></motion.div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
        className="bg-white rounded-[3rem] p-10 shadow-[0_20px_0_0_rgba(16,185,129,0.3)] border-4 border-emerald-100 max-w-md w-full text-center relative overflow-visible"
      >
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-400 text-white font-black px-6 py-2 rounded-full border-4 border-white shadow-[0_8px_0_0_#d97706] rotate-[-5deg] text-xl z-20">
           EcoSort!
        </div>
        
        <h1 className="text-6xl font-black text-emerald-500 mb-2 drop-shadow-sm tracking-tight mt-4">EcoSort</h1>
        <p className="text-slate-400 mb-10 font-bold tracking-wide uppercase text-sm">HIMATI Edition</p>

        {mode === 'select' ? (
          <div className="space-y-6 relative z-10">
            <button 
              onClick={handleCreateRoom}
              className="w-full bg-emerald-400 text-white font-black py-5 rounded-3xl text-2xl transition-all duration-150 border-4 border-emerald-500 shadow-[0_8px_0_0_#059669] hover:brightness-110 active:shadow-none active:translate-y-[8px]"
            >
              <span className="flex items-center justify-center gap-3">
                <i className="ph-fill ph-presentation-chart text-3xl"></i> Buat Ruangan
              </span>
            </button>
            <button 
              onClick={() => setMode('student')}
              className="w-full bg-blue-400 text-white font-black py-5 rounded-3xl text-2xl transition-all duration-150 border-4 border-blue-500 shadow-[0_8px_0_0_#2563eb] hover:brightness-110 active:shadow-none active:translate-y-[8px]"
            >
              <span className="flex items-center justify-center gap-3">
                <i className="ph-fill ph-game-controller text-3xl"></i> Main Sekarang
              </span>
            </button>
          </div>
        ) : (
          <motion.form 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.6 }}
            onSubmit={handleJoinRoom} 
            className="space-y-5 relative z-10"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="PIN RUANGAN"
                className="w-full text-center text-4xl font-black py-5 px-6 bg-slate-100 border-4 border-slate-200 rounded-3xl focus:border-teal-400 focus:outline-none uppercase text-slate-800 placeholder-slate-400 transition-all shadow-inner"
                maxLength={5}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 5))}
                required
              />
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Nama Peserta"
                className="w-full text-center text-2xl font-bold py-5 px-6 bg-slate-100 border-4 border-slate-200 rounded-3xl focus:border-blue-400 focus:outline-none text-slate-800 placeholder-slate-400 transition-all shadow-inner"
                maxLength={12}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Team Selection */}
            <div className="flex gap-4 w-full">
               <button
                  type="button"
                  onClick={() => setTeam('merah')}
                  className={`w-1/2 py-4 rounded-3xl font-black text-xl transition-all duration-150 border-4 ${team === 'merah' ? 'bg-rose-500 text-white border-rose-600 shadow-[0_8px_0_0_#be123c] -translate-y-2' : 'bg-rose-100 text-rose-400 border-rose-200 shadow-[0_8px_0_0_#fecdd3] active:shadow-none active:translate-y-[8px]'}`}
               >
                 TIM MERAH
               </button>
               <button
                  type="button"
                  onClick={() => setTeam('biru')}
                  className={`w-1/2 py-4 rounded-3xl font-black text-xl transition-all duration-150 border-4 ${team === 'biru' ? 'bg-blue-500 text-white border-blue-600 shadow-[0_8px_0_0_#1d4ed8] -translate-y-2' : 'bg-blue-100 text-blue-400 border-blue-200 shadow-[0_8px_0_0_#bfdbfe] active:shadow-none active:translate-y-[8px]'}`}
               >
                 TIM BIRU
               </button>
            </div>

            <div className="flex gap-4 pt-6">
              <button 
                type="button"
                onClick={() => setMode('select')}
                className="w-1/3 bg-slate-200 text-slate-500 font-black py-4 rounded-3xl border-4 border-slate-300 shadow-[0_6px_0_0_#cbd5e1] hover:brightness-95 active:shadow-none active:translate-y-[6px] transition-all duration-150"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="w-2/3 bg-gradient-to-b from-teal-400 to-emerald-500 text-white font-black py-4 rounded-3xl border-4 border-emerald-600 shadow-[0_8px_0_0_#047857] hover:brightness-110 active:shadow-none active:translate-y-[8px] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none text-xl"
                disabled={pin.length !== 5 || !name.trim() || !team}
              >
                Masuk Room
              </button>
            </div>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
}
