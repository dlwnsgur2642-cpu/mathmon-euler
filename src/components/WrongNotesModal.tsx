'use client';

import React from 'react';
import { QuizQuestion } from '@/types/game';

interface WrongNotesModalProps {
  notes: { quiz: QuizQuestion; myChoice: string; date: number }[];
  onClose: () => void;
}

export const WrongNotesModal: React.FC<WrongNotesModalProps> = ({ notes, onClose }) => {
  return (
    <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-4 text-white font-game select-none animate-in fade-in">
      {/* 헤더 */}
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-3">
        <div>
          <h2 className="text-sm font-bold text-amber-400 font-pixel">📖 나의 오답노트</h2>
          <span className="text-[10px] text-slate-400">배틀 중 틀렸던 문제들의 해설을 복습하세요!</span>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs"
        >
          닫기
        </button>
      </div>

      {/* 리스트 영역 */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {notes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs">
            <span>🎉 아직 틀린 문제가 없습니다!</span>
            <span className="mt-1 text-[10px]">배틀에서 문제를 틀리면 자동으로 여기에 저장됩니다.</span>
          </div>
        ) : (
          notes.map((item, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs space-y-1.5 shadow">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded">
                  {item.quiz.unitName}
                </span>
                <span className="text-slate-500 font-mono">
                  {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="font-bold text-white leading-relaxed">{item.quiz.question}</div>

              {item.quiz.svgFigure && (
                <div
                  dangerouslySetInnerHTML={{ __html: item.quiz.svgFigure }}
                  className="flex justify-center my-1 scale-90"
                />
              )}

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="bg-rose-950/50 border border-rose-800/60 rounded px-2 py-1 text-rose-300">
                  내가 고른 답: <span className="font-bold line-through">{item.myChoice}</span>
                </div>
                <div className="bg-emerald-950/50 border border-emerald-800/60 rounded px-2 py-1 text-emerald-300 font-bold">
                  정답: {item.quiz.options[item.quiz.answerIndex]}
                </div>
              </div>

              <div className="bg-slate-800/70 rounded p-2 text-[10px] text-slate-300 leading-normal border-l-2 border-amber-500">
                💡 <span className="font-bold text-amber-300">개념 해설:</span> {item.quiz.explanation}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
