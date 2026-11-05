import { createClient } from '@supabase/supabase-js';
import { MathmonInstance, Move, QuizQuestion } from '@/types/game';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ktjeifpqlqkojsjscjlu.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export interface PvpCallbacks {
  onGuestJoined?: (guestName: string, guestParty: MathmonInstance[]) => void;
  onHostReady?: (hostName: string, hostParty: MathmonInstance[]) => void;
  onBothSelectedMoves?: (hostMove: Move, guestMove: Move, quiz: QuizQuestion) => void;
  onOpponentAnswered?: (isCorrect: boolean, timeMs: number) => void;
  onTurnResolved?: (hostDamage: number, guestDamage: number, message: string) => void;
  onOpponentQuit?: () => void;
}

export class PvpRoomManager {
  private channel: ReturnType<typeof supabase.channel> | null = null;
  private roomId: string;
  private isHost: boolean;
  private playerName: string;
  private callbacks: PvpCallbacks;

  constructor(roomId: string, playerName: string, isHost: boolean, callbacks: PvpCallbacks) {
    this.roomId = roomId;
    this.playerName = playerName;
    this.isHost = isHost;
    this.callbacks = callbacks;
  }

  public connect(myParty: MathmonInstance[]) {
    this.channel = supabase.channel(`mathmon_pvp_${this.roomId}`, {
      config: {
        broadcast: { ack: false, self: false },
      },
    });

    this.channel
      .on('broadcast', { event: 'player_join' }, ({ payload }) => {
        if (this.isHost && payload.role === 'guest') {
          if (this.callbacks.onGuestJoined) {
            this.callbacks.onGuestJoined(payload.name, payload.party);
          }
          // 호스트가 게스트에게 환영 및 자신의 파티 정보 회신
          this.broadcast('host_welcome', { name: this.playerName, party: myParty });
        }
      })
      .on('broadcast', { event: 'host_welcome' }, ({ payload }) => {
        if (!this.isHost && this.callbacks.onHostReady) {
          this.callbacks.onHostReady(payload.name, payload.party);
        }
      })
      .on('broadcast', { event: 'move_selected' }, ({ payload }) => {
        // 상대방 기술 선택 수신
      })
      .on('broadcast', { event: 'both_ready_quiz' }, ({ payload }) => {
        if (this.callbacks.onBothSelectedMoves) {
          this.callbacks.onBothSelectedMoves(payload.hostMove, payload.guestMove, payload.quiz);
        }
      })
      .on('broadcast', { event: 'quiz_answered' }, ({ payload }) => {
        if (this.callbacks.onOpponentAnswered) {
          this.callbacks.onOpponentAnswered(payload.isCorrect, payload.timeMs);
        }
      })
      .on('broadcast', { event: 'turn_result' }, ({ payload }) => {
        if (this.callbacks.onTurnResolved) {
          this.callbacks.onTurnResolved(payload.hostDamage, payload.guestDamage, payload.message);
        }
      })
      .on('broadcast', { event: 'player_quit' }, () => {
        if (this.callbacks.onOpponentQuit) {
          this.callbacks.onOpponentQuit();
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          if (!this.isHost) {
            // 게스트가 참가했음을 브로드캐스트
            this.broadcast('player_join', { role: 'guest', name: this.playerName, party: myParty });
          }
        }
      });
  }

  public broadcast(event: string, payload: Record<string, unknown>) {
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event,
        payload,
      });
    }
  }

  public disconnect() {
    if (this.channel) {
      this.broadcast('player_quit', {});
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}
