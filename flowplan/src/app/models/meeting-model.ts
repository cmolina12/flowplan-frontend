export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface MeetingModel{
    day: DayOfWeek; // The day of the week for the meeting
    start: string; // Start time in HH:MM:ss format
    end: string; // End time in HH:MM:ss format
    location: string; // Location of the meeting,
}