import React, { useState } from 'react';
import { useAppContext } from '../StateContext';
import { Megaphone, Send, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AnnouncementFeed({ showToast }: { showToast: (msg: string) => void }) {
  const { announcements, addAnnouncement, currentRole } = useAppContext();
  const [newMessage, setNewMessage] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    addAnnouncement(newMessage, currentRole);
    setNewMessage('');
    showToast('Announcement broadcasted successfully');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {currentRole === 'Organizer' && (
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-[#E9E5D6] shadow-sm sticky top-6">
            <h3 className="text-lg font-medium text-[#4A4E69] mb-4 flex items-center">
              <Megaphone className="w-5 h-5 text-[#7C9082] mr-2" />
              Broadcast Message
            </h3>
            <form onSubmit={handleSend}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your announcement here..."
                rows={4}
                className="w-full rounded-2xl border border-[#E9E5D6] bg-[#F3F1EA] text-sm outline-none focus:border-[#7C9082] p-4 mb-4 resize-none transition-colors"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="w-full flex items-center justify-center px-4 py-3.5 bg-[#7C9082] text-white rounded-xl uppercase tracking-widest font-bold text-xs hover:brightness-110 disabled:opacity-50 transition-all shadow-md shadow-black/10"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Broadcast
              </button>
            </form>
          </div>
        </div>
      )}

      <div className={`space-y-4 ${currentRole === 'Organizer' ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
        <h3 className="text-lg font-bold text-[#4A4E69] italic mb-4 flex items-center">
          <div className="w-2 h-2 rounded-full bg-[#D4A373] mr-3 animate-pulse"></div>
          Live Event Feed
        </h3>
        
        {announcements.map((ann, i) => (
          <div key={ann.id} className={`p-6 rounded-3xl border shadow-sm ${i === 0 ? 'bg-[#D4A373]/10 border-[#D4A373]/20' : 'bg-white border-[#E9E5D6]'}`}>
            <div className="flex justify-between items-start mb-4">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${i === 0 ? 'bg-white/50 text-[#B07D62]' : 'bg-[#F3F1EA] text-[#8E8A7A]'}`}>
                {ann.sender}
              </span>
              <span className={`flex items-center text-xs ${i === 0 ? 'text-[#B07D62]' : 'text-[#A5A08F]'}`}>
                <Clock className="w-3.5 h-3.5 mr-1" />
                {formatDistanceToNow(new Date(ann.timestamp), { addSuffix: true })}
              </span>
            </div>
            <p className={`text-sm leading-relaxed whitespace-pre-wrap ${i === 0 ? 'text-[#B07D62] font-medium italic' : 'text-[#2D302E]'}`}>{ann.message}</p>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="text-center py-12 text-[#A5A08F] bg-[#FDFCF9] rounded-3xl border border-dashed border-[#E9E5D6]">
            No announcements yet.
          </div>
        )}
      </div>

    </div>
  );
}
