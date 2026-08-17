export type TicketType = 'VIP' | 'General' | 'Speaker';
export type CheckInStatus = 'Registered' | 'Checked-In';
export type VolunteerRole = 'Door Scanner' | 'Speaker Escort' | 'Helpdesk';
export type TaskStatus = 'Unassigned' | 'Assigned' | 'Completed';
export type UserRole = 'Organizer' | 'Volunteer' | 'Attendee';

export interface Attendee {
  id: string;
  name: string;
  email: string;
  ticketType: TicketType;
  qrToken: string;
  status: CheckInStatus;
  checkInTime: string | null;
  dietary: string;
}

export interface Session {
  id: string;
  title: string;
  speakerName: string;
  speakerRole: string;
  track: string;
  startTime: string;
  endTime: string;
  room: string;
  capacity: number;
}

export interface VolunteerTask {
  id: string;
  volunteerName: string;
  assignedRole: VolunteerRole;
  shiftTime: string;
  status: TaskStatus;
}

export interface Announcement {
  id: string;
  message: string;
  timestamp: string;
  sender: string;
}

export interface AppState {
  attendees: Attendee[];
  sessions: Session[];
  tasks: VolunteerTask[];
  announcements: Announcement[];
  currentRole: UserRole;
  currentUserAttendeeId: string | null; // For Attendee view
}
