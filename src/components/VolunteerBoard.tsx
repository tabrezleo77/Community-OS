import React from 'react';
import { useAppContext } from '../StateContext';
import { TaskStatus } from '../types';
import { ClipboardList, Clock, User, CheckCircle2 } from 'lucide-react';

export default function VolunteerBoard({ showToast }: { showToast: (msg: string) => void }) {
  const { tasks, updateTaskStatus } = useAppContext();

  const columns: { title: string; status: TaskStatus; color: string }[] = [
    { title: 'To Do', status: 'Unassigned', color: 'bg-[#E9E5D6] border-[#E9E5D6] text-[#8E8A7A]' },
    { title: 'In Progress', status: 'Assigned', color: 'bg-[#7C9082]/10 border-[#7C9082]/20 text-[#7C9082]' },
    { title: 'Done', status: 'Completed', color: 'bg-[#D4A373]/20 border-[#D4A373]/20 text-[#B07D62]' },
  ];

  const handleStatusChange = (taskId: string, newStatus: TaskStatus, taskName: string) => {
    updateTaskStatus(taskId, newStatus);
    showToast(`Task for ${taskName} moved to ${newStatus}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {columns.map(col => (
        <div key={col.status} className="flex flex-col">
          <div className={`px-4 py-3 rounded-t-xl border-t border-x font-semibold flex items-center justify-between ${col.color}`}>
            <span>{col.title}</span>
            <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs">
              {tasks.filter(t => t.status === col.status).length}
            </span>
          </div>
          <div className="bg-[#F3F1EA] border border-[#E9E5D6] rounded-b-xl p-4 flex-1 flex flex-col gap-3 min-h-[300px]">
            {tasks.filter(t => t.status === col.status).map(task => (
              <div key={task.id} className="bg-white p-4 rounded-2xl border border-[#E9E5D6] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-[#2D302E]">{task.assignedRole}</span>
                  {task.status === 'Completed' && <CheckCircle2 className="w-5 h-5 text-[#7C9082]" />}
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-[#8E8A7A]">
                    <User className="w-4 h-4 mr-2 text-[#A5A08F]" />
                    {task.volunteerName}
                  </div>
                  <div className="flex items-center text-sm text-[#8E8A7A]">
                    <Clock className="w-4 h-4 mr-2 text-[#A5A08F]" />
                    {task.shiftTime}
                  </div>
                </div>

                <div className="flex gap-2">
                  {col.status !== 'Unassigned' && (
                    <button 
                      onClick={() => handleStatusChange(task.id, 'Unassigned', task.volunteerName)}
                      className="flex-1 py-1.5 text-xs font-bold text-[#8E8A7A] bg-[#F3F1EA] rounded-lg hover:bg-[#E9E5D6] transition-colors"
                    >
                      Reset
                    </button>
                  )}
                  {col.status === 'Unassigned' && (
                    <button 
                      onClick={() => handleStatusChange(task.id, 'Assigned', task.volunteerName)}
                      className="flex-1 py-1.5 text-xs font-bold text-white bg-[#7C9082] rounded-lg hover:brightness-110 transition-all shadow-sm"
                    >
                      Assign
                    </button>
                  )}
                  {col.status === 'Assigned' && (
                    <button 
                      onClick={() => handleStatusChange(task.id, 'Completed', task.volunteerName)}
                      className="flex-1 py-1.5 text-xs font-bold text-[#B07D62] bg-[#D4A373]/20 rounded-lg hover:bg-[#D4A373]/30 transition-colors"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
            {tasks.filter(t => t.status === col.status).length === 0 && (
              <div className="text-center text-[#A5A08F] text-sm py-8 border-2 border-dashed border-[#E9E5D6] rounded-2xl">
                No tasks here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
