import React, { useState } from 'react';
import { useAppContext } from '../StateContext';
import { Award, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function CertificateGenerator({ showToast }: { showToast: (msg: string) => void }) {
  const { attendees, currentRole, currentUserAttendeeId } = useAppContext();
  
  // If attendee, only show themselves. If organizer, select anyone.
  const eligibleAttendees = currentRole === 'Attendee' 
    ? attendees.filter(a => a.id === currentUserAttendeeId && a.status === 'Checked-In')
    : attendees.filter(a => a.status === 'Checked-In');

  const [selectedId, setSelectedId] = useState<string>(eligibleAttendees[0]?.id || '');

  const selectedAttendee = attendees.find(a => a.id === selectedId);

  const handleDownload = () => {
    showToast('Certificate downloaded successfully!');
  };

  if (eligibleAttendees.length === 0) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-[#E9E5D6] shadow-sm text-center">
        <Award className="w-12 h-12 text-[#E9E5D6] mx-auto mb-4" />
        <h3 className="text-lg font-medium text-[#4A4E69]">No Certificates Available</h3>
        <p className="text-[#A5A08F] mt-2">
          {currentRole === 'Attendee' 
            ? "You must be checked-in to generate your certificate." 
            : "No attendees have checked in yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {currentRole === 'Organizer' && (
        <div className="bg-white p-6 rounded-3xl border border-[#E9E5D6] shadow-sm">
          <label className="block text-[10px] uppercase tracking-widest font-bold text-[#A5A08F] mb-3">Select Checked-In Attendee</label>
          <select 
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full md:w-1/2 rounded-xl border border-[#E9E5D6] bg-[#F3F1EA] text-sm outline-none focus:border-[#7C9082] p-3 transition-colors"
          >
            {eligibleAttendees.map(a => (
              <option key={a.id} value={a.id}>{a.name} ({a.ticketType})</option>
            ))}
          </select>
        </div>
      )}

      {selectedAttendee && (
        <div className="flex flex-col items-center space-y-8">
          {/* Certificate SVG Canvas */}
          <div className="w-full max-w-3xl aspect-[1.414] bg-[#FDFCF9] rounded-2xl shadow-xl border border-[#E9E5D6] overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#7C9082_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Content */}
            <div className="absolute inset-0 p-12 flex flex-col items-center text-center justify-center border-[12px] border-double border-[#E9E5D6] m-4">
              <Award className="w-16 h-16 text-[#7C9082] mb-6" />
              <h1 className="text-4xl font-serif text-[#4A4E69] tracking-wider mb-2">CERTIFICATE OF ATTENDANCE</h1>
              <p className="text-[#A5A08F] uppercase tracking-widest text-sm mb-8">Community Event OS 2026</p>
              
              <p className="text-[#8E8A7A] mb-2">This is to certify that</p>
              <h2 className="text-4xl font-bold text-[#2D302E] border-b-2 border-[#E9E5D6] pb-2 mb-6 px-12">
                {selectedAttendee.name}
              </h2>
              
              <p className="text-[#8E8A7A] mb-12 max-w-lg">
                has successfully participated as a <strong className="text-[#4A4E69]">{selectedAttendee.ticketType}</strong> attendee 
                at our annual community tech conference.
              </p>

              <div className="flex justify-between w-full max-w-md mt-auto pt-8 border-t border-[#E9E5D6]">
                <div className="text-center">
                  <p className="font-medium text-[#2D302E]">{format(new Date(), 'MMMM d, yyyy')}</p>
                  <p className="text-[10px] text-[#A5A08F] uppercase tracking-widest font-bold">Date</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-[#4A4E69] italic font-serif">Jane Doe</p>
                  <p className="text-[10px] text-[#A5A08F] uppercase tracking-widest font-bold">Lead Organizer</p>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleDownload}
            className="flex items-center px-8 py-4 bg-[#7C9082] hover:brightness-110 text-white rounded-xl uppercase tracking-widest font-bold text-sm transition-all shadow-lg shadow-black/10"
          >
            <Download className="w-5 h-5 mr-3" />
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
}
