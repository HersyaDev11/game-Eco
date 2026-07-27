import { create } from 'zustand';

export interface Student {
  id: string;
  name: string;
  score: number;
  combo: number;
  mistakes: number;
  team?: 'merah' | 'biru';
}

export type GameDifficulty = 'mudah' | 'normal' | 'sulit';

export interface RoomSettings {
  duration: number;
  damage: number;
  difficulty: GameDifficulty;
}

interface GameState {
  // Common
  roomId: string | null;
  status: 'lobby' | 'playing' | 'podium';
  roomSettings: RoomSettings;
  setRoomId: (id: string) => void;
  setStatus: (status: 'lobby' | 'playing' | 'podium') => void;
  setRoomSettings: (settings: RoomSettings) => void;

  // Host (Panitia) State
  students: Student[];
  addStudent: (student: Student) => void;
  updateStudentScore: (id: string, scoreDelta: number, combo: number) => void;
  resetGame: () => void;
  
  // Student (Peserta) State
  studentId: string | null;
  studentName: string | null;
  studentTeam: 'merah' | 'biru' | null;
  score: number;
  setStudentInfo: (id: string, name: string, team: 'merah' | 'biru') => void;
  setScore: (score: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  roomId: null,
  status: 'lobby',
  roomSettings: { duration: 60, damage: 5, difficulty: 'normal' },
  setRoomId: (id) => set({ roomId: id }),
  setStatus: (status) => set({ status }),
  setRoomSettings: (settings) => set({ roomSettings: settings }),

  students: [],
  addStudent: (student) => 
    set((state) => {
      if (state.students.find(s => s.id === student.id)) return state;
      return { students: [...state.students, student] };
    }),
  updateStudentScore: (id, scoreDelta, combo) =>
    set((state) => ({
      students: state.students.map((s) =>
        s.id === id ? { ...s, score: s.score + scoreDelta, combo, mistakes: scoreDelta < 0 ? s.mistakes + 1 : s.mistakes } : s
      ),
    })),
  resetGame: () => set({ students: [], status: 'lobby', score: 0, studentId: null, studentName: null, studentTeam: null, roomId: null }),

  studentId: null,
  studentName: null,
  studentTeam: null,
  score: 0,
  setStudentInfo: (id, name, team) => set({ studentId: id, studentName: name, studentTeam: team }),
  setScore: (score) => set({ score }),
}));
