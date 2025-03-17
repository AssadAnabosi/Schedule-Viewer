export interface ScheduleData {
  lastSaved?: string;
  schedule: Schedule;
}

export interface Schedule {
  title: string;
  items: CourseItem[];
}

export interface CourseItem {
  uid: string;
  type: string;
  title: string;
  meetingTimes: MeetingTime[];
  backgroundColor: string;
}

export interface MeetingTime {
  uid: string;
  courseType: string;
  instructor: string;
  location: string;
  startHour: number;
  endHour: number;
  startMinute: number;
  endMinute: number;
  days: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}

export interface ScheduleEvent {
  id: string;
  title: string;
  location: string;
  courseType: string;
  instructor: string;
  day: number;
  startTime: number;
  endTime: number;
  backgroundColor: string;
}

export interface ScheduleSettings {
  startDay: "sunday" | "monday";
  clockType: "12h" | "24h";
  timeIncrement: "30m" | "1h";
  theme: "light" | "dark" | "system";
}
