import { useGameStore } from '../store/gameStore';
import type { Student, RoomSettings } from '../store/gameStore';

export type MessageType = 
  | { type: 'JOIN_ROOM'; roomId: string; student: Student }
  | { type: 'START_GAME'; roomId: string; settings: RoomSettings }
  | { type: 'SCORE_UPDATE'; roomId: string; studentId: string; scoreDelta: number; combo: number }
  | { type: 'GAME_OVER'; roomId: string };

const channel = new BroadcastChannel('ecosort_game_channel');

export const initMultiplayerListener = () => {
  channel.onmessage = (event: MessageEvent<MessageType>) => {
    const data = event.data;
    const store = useGameStore.getState();

    // Only process messages for the current room
    if (store.roomId !== data.roomId) return;

    switch (data.type) {
      case 'JOIN_ROOM':
        // Host receives this
        store.addStudent(data.student);
        break;
      case 'START_GAME':
        // Student receives this
        store.setRoomSettings(data.settings);
        store.setStatus('playing');
        break;
      case 'SCORE_UPDATE':
        // Host receives this
        store.updateStudentScore(data.studentId, data.scoreDelta, data.combo);
        break;
      case 'GAME_OVER':
        // Student receives this
        store.setStatus('podium');
        break;
    }
  };
};

export const joinRoom = (roomId: string, student: Student) => {
  channel.postMessage({ type: 'JOIN_ROOM', roomId, student });
};

export const startGame = (roomId: string, settings: RoomSettings) => {
  channel.postMessage({ type: 'START_GAME', roomId, settings });
};

export const sendScoreUpdate = (roomId: string, studentId: string, scoreDelta: number, combo: number) => {
  channel.postMessage({ type: 'SCORE_UPDATE', roomId, studentId, scoreDelta, combo });
};

export const endGame = (roomId: string) => {
  channel.postMessage({ type: 'GAME_OVER', roomId });
};
