import React, { useState } from 'react';
import { useAppContext } from '../StateContext';
import { Session } from '../types';
import { MapPin, User, Clock, X } from 'lucide-react';

export default function Agenda({ showToast }: { showToast: (msg: string) => void }) {
  const { sessions, currentRole } = useAppContext();
  const [selectedTrack, setSelectedTrack] = useState<string>('All');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const tracks = ['All', ...Array.from(new Set(sessions.map(s => s.track)))];

  const filteredSessions = selectedTrack === 'All' 
    ? sessions 
    : sessions.filter(s => s.track === selectedTrack);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {tracks.map(track => (
          <button
            key={track}
            onClick={() => setSelectedTrack(track)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
              selectedTrack === track 
                ? 'bg-[#4A4E69] text-white shadow-sm' 
                : 'bg-white text-[#8E8A7A] border border-[#E9E5D6] hover:bg-[#F3F1EA]'
            }`}
          >
            {track}
          </button>
        ))}
      </div>

      {/* Agenda Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSessions.map(session => (
          <div 
            key={session.id} 
            onClick={() => setSelectedSession(session)}
            className="bg-white p-6 rounded-2xl border border-[#E9E5D6] shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="px-2.5 py-1 bg-[#F3F1EA] text-[#8E8A7A] text-[10px] font-bold uppercase tracking-wider rounded-full">
                {session.track}
              </span>
              <div className="flex items-center text-xs text-[#D4A373] font-bold bg-[#D4A373]/10 px-2.5 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5 mr-1" />
                {session.startTime}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-[#2D302E] mb-2 line-clamp-2">{session.title}</h3>
            
            <div className="mt-auto space-y-2 pt-4">
              <div className="flex items-center text-sm text-[#8E8A7A]">
                <User className="w-4 h-4 mr-2 text-[#A5A08F]" />
                <span className="font-semibold text-[#2D302E]">{session.speakerName}</span>
                <span className="mx-2 text-[#E9E5D6]">•</span>
                <span className="truncate">{session.speakerRole}</span>
              </div>
              <div className="flex items-center text-sm text-[#8E8A7A]">
                <MapPin className="w-4 h-4 mr-2 text-[#A5A08F]" />
                {session.room}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Session Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D302E]/60 backdrop-blur-sm">
          <div className="bg-[#FDFCF9] rounded-3xl w-full max-w-lg shadow-xl overflow-hidden border border-[#E9E5D6]" onClick={e => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <span className="px-3 py-1.5 bg-[#4A4E69]/10 text-[#4A4E69] text-xs font-bold uppercase tracking-wider rounded-full">
                  {selectedSession.track}
                </span>
                <button 
                  onClick={() => setSelectedSession(null)}
                  className="text-[#A5A08F] hover:text-[#4A4E69] transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <h2 className="text-2xl font-bold text-[#4A4E69] italic mb-6">{selectedSession.title}</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white border border-[#E9E5D6] p-4 rounded-2xl">
                  <div className="flex items-center text-[#A5A08F] mb-1 text-[10px] uppercase font-bold tracking-wider">
                    <Clock className="w-4 h-4 mr-1.5" /> Time
                  </div>
                  <div className="font-semibold text-[#2D302E]">
                    {selectedSession.startTime} - {selectedSession.endTime}
                  </div>
                </div>
                <div className="bg-white border border-[#E9E5D6] p-4 rounded-2xl">
                  <div className="flex items-center text-[#A5A08F] mb-1 text-[10px] uppercase font-bold tracking-wider">
                    <MapPin className="w-4 h-4 mr-1.5" /> Location
                  </div>
                  <div className="font-semibold text-[#2D302E]">
                    {selectedSession.room}
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-[10px] font-bold text-[#A5A08F] uppercase tracking-wider mb-3">Speaker</h4>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#7C9082]/20 rounded-full flex items-center justify-center text-[#7C9082] font-bold text-lg mr-4">
                    {selectedSession.speakerName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-[#2D302E]">{selectedSession.speakerName}</div>
                    <div className="text-xs text-[#8E8A7A]">{selectedSession.speakerRole}</div>
                  </div>
                </div>
              </div>

              <p className="text-[#8E8A7A] text-sm leading-relaxed mb-8">
                Join us for this deep dive into {selectedSession.title.toLowerCase()}. 
                We will explore key concepts, practical applications, and future trends 
                in this interactive session. Capacity is limited to {selectedSession.capacity} attendees.
              </p>

              {currentRole === 'Attendee' && (
                <button 
                  onClick={() => {
                    showToast(`Added "${selectedSession.title}" to your schedule`);
                    setSelectedSession(null);
                  }}
                  className="w-full py-4 bg-[#7C9082] hover:brightness-110 shadow-lg shadow-black/10 text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-all"
                >
                  Add to Schedule
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
