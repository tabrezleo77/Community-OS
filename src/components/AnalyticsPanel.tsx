import React from 'react';
import { useAppContext } from '../StateContext';
import { Users, CheckCircle, Clock, Map } from 'lucide-react';

export default function AnalyticsPanel() {
  const { attendees, sessions } = useAppContext();

  const totalRegistered = attendees.length;
  const totalCheckedIn = attendees.filter(a => a.status === 'Checked-In').length;
  const checkInRate = totalRegistered > 0 ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0;

  // Calculate some dummy peak times based on check-ins
  const checkInHours = attendees
    .filter(a => a.status === 'Checked-In' && a.checkInTime)
    .map(a => new Date(a.checkInTime!).getHours());
  
  const mostCommonHour = checkInHours.length > 0 ? 
    checkInHours.sort((a,b) => checkInHours.filter(v => v===a).length - checkInHours.filter(v => v===b).length).pop() : 
    null;

  const peakTimeStr = mostCommonHour !== null ? `${mostCommonHour}:00 - ${mostCommonHour + 1}:00` : 'N/A';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-6 rounded-3xl border border-[#E9E5D6] shadow-sm flex items-start space-x-4">
        <div className="p-3 bg-[#F3F1EA] text-[#8E8A7A] rounded-xl">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-[#A5A08F] mb-1">Total Registered</p>
          <p className="text-2xl font-semibold text-[#2D302E]">{totalRegistered}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-[#E9E5D6] shadow-sm flex items-start space-x-4">
        <div className="p-3 bg-[#7C9082]/10 text-[#7C9082] rounded-xl">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-[#A5A08F] mb-1">Checked In</p>
          <p className="text-2xl font-semibold text-[#7C9082]">{totalCheckedIn}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-[#E9E5D6] shadow-sm flex items-start space-x-4">
        <div className="p-3 bg-[#F3F1EA] text-[#8E8A7A] rounded-xl">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-[#A5A08F] mb-1">Check-In Rate</p>
          <p className="text-2xl font-semibold text-[#2D302E]">{checkInRate}%</p>
          <div className="w-full bg-[#F3F1EA] rounded-full h-1.5 mt-2">
            <div className="bg-[#7C9082] h-1.5 rounded-full" style={{ width: `${checkInRate}%` }}></div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-[#E9E5D6] shadow-sm flex items-start space-x-4">
        <div className="p-3 bg-[#F3F1EA] text-[#8E8A7A] rounded-xl">
          <Map className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-[#A5A08F] mb-1">Peak Arrival Time</p>
          <p className="text-xl font-semibold text-[#2D302E]">{peakTimeStr}</p>
          <p className="text-[10px] font-normal opacity-60 mt-1">Based on current check-ins</p>
        </div>
      </div>
    </div>
  );
}
