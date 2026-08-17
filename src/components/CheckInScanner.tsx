import React, { useState } from 'react';
import { useAppContext } from '../StateContext';
import { Search, Camera, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function CheckInScanner({ showToast }: { showToast: (msg: string) => void }) {
  const { attendees, checkInAttendee, uncheckInAttendee } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScanToken, setSelectedScanToken] = useState('');

  const filteredAttendees = attendees.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.qrToken.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSimulateScan = () => {
    if (!selectedScanToken) return;
    const attendee = attendees.find(a => a.qrToken === selectedScanToken);
    if (attendee) {
      if (attendee.status === 'Registered') {
        checkInAttendee(attendee.id);
        showToast(`Successfully checked in ${attendee.name}`);
      } else {
        showToast(`${attendee.name} is already checked in.`);
      }
    } else {
      showToast(`Invalid QR Token: ${selectedScanToken}`);
    }
    setSelectedScanToken('');
  };

  const toggleCheckIn = (id: string, currentStatus: string, name: string) => {
    if (currentStatus === 'Registered') {
      checkInAttendee(id);
      showToast(`Checked in ${name}`);
    } else {
      uncheckInAttendee(id);
      showToast(`Un-checked in ${name}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#4A4E69] p-6 rounded-3xl text-white shadow-sm flex flex-col">
        <h2 className="text-lg font-medium italic mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5 text-white/80" />
          Simulate QR Scan
        </h2>
        <div className="flex gap-3 mb-6">
          <select 
            value={selectedScanToken}
            onChange={(e) => setSelectedScanToken(e.target.value)}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none"
          >
            <option className="text-gray-900" value="">Select a QR Token to scan...</option>
            {attendees.map(a => (
              <option className="text-gray-900" key={a.id} value={a.qrToken}>{a.qrToken} - {a.name} ({a.status})</option>
            ))}
            <option className="text-gray-900" value="INVALID-999">INVALID-999 (Simulate Error)</option>
          </select>
          <button 
            onClick={handleSimulateScan}
            disabled={!selectedScanToken}
            className="px-6 py-3 bg-[#7C9082] text-white rounded-xl uppercase tracking-widest font-bold text-sm hover:brightness-110 shadow-lg shadow-black/20 disabled:opacity-50 transition-all"
          >
            Scan
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-[#E9E5D6] shadow-sm flex flex-col">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-medium text-[#4A4E69]">Attendee Directory</h2>
            <p className="text-xs text-[#A5A08F]">Managing current check-ins and registration data</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#A5A08F]" />
            <input 
              type="text" 
              placeholder="Search name, email, QR..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-xl border border-[#E9E5D6] bg-[#F3F1EA] text-xs outline-none focus:border-[#7C9082] transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead className="text-[10px] uppercase tracking-wider text-[#A5A08F] border-b border-[#F3F1EA]">
              <tr className="h-10">
                <th className="font-bold pl-4">Attendee</th>
                <th className="font-bold">Ticket</th>
                <th className="font-bold">QR Token</th>
                <th className="font-bold">Status</th>
                <th className="font-bold text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {filteredAttendees.map(attendee => (
                <tr key={attendee.id} className="border-b border-[#F8F7F2] h-14 hover:bg-[#FDFCF9] transition-colors">
                  <td className="pl-4">
                    <div className="font-semibold text-[#2D302E]">{attendee.name}</div>
                    <div className="text-[10px] opacity-60 text-[#2D302E]">{attendee.email}</div>
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded-md font-bold ${
                      attendee.ticketType === 'VIP' ? 'bg-[#D4A373]/20 text-[#D4A373]' :
                      attendee.ticketType === 'Speaker' ? 'bg-[#4A4E69]/10 text-[#4A4E69]' :
                      'bg-[#F3F1EA] text-[#8E8A7A]'
                    }`}>
                      {attendee.ticketType}
                    </span>
                  </td>
                  <td className="font-mono opacity-60 uppercase text-[#2D302E]">{attendee.qrToken}</td>
                  <td>
                    {attendee.status === 'Checked-In' ? (
                      <span className="flex items-center gap-2 text-[#2D302E]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#7C9082]"></div>
                        Checked-In
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-[#2D302E]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#E9E5D6]"></div>
                        Registered
                      </span>
                    )}
                    {attendee.checkInTime && (
                      <div className="text-[10px] opacity-60 text-[#2D302E] mt-0.5">
                        {format(new Date(attendee.checkInTime), 'HH:mm')}
                      </div>
                    )}
                  </td>
                  <td className="text-right pr-4">
                    <button
                      onClick={() => toggleCheckIn(attendee.id, attendee.status, attendee.name)}
                      className={`transition-colors ${
                        attendee.status === 'Registered' 
                          ? 'bg-[#7C9082] text-white px-3 py-1.5 rounded-lg font-medium'
                          : 'text-[#A5A08F] font-bold hover:text-[#4A4E69]'
                      }`}
                    >
                      {attendee.status === 'Registered' ? 'Check In' : 'Edit'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAttendees.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#A5A08F]">
                    No attendees found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
