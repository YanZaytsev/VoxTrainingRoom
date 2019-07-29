import {MonthTypes} from "@/lib/enums";

export interface SidebarItem {
  name: string;
  icon?: string;
}

export interface MonthDay {
  day: number,
  month: MonthTypes,
  isCurrentDate: boolean
}

export interface SelectOption {
  value: string | number,
  name: string
}

export interface EventBlockStyles {
  height: string,
  top: string
}

export interface EventMeta {
  startingPoint: number,
  vectorHeight: number,
}

export interface ScheduleEvent {
  id?: number,
  name: string,
  desc: string,
  startTime: string,
  endTime: string,
  type: string,
  styles: EventBlockStyles,
  meta: EventMeta,
  isResizing: boolean
}

export interface TimeSlotsCoords {
  top: number,
  height: number,
  bottom: number,
  time: string
}

export interface EventTimeInterval {
  startTime: string,
  endTime: string
}

export interface EventCoords {
  top: number,
  bottom: number,
}

export interface EventStyles {
  top: number,
  height: number,
}

export interface DateEventsMap {
  [key: string]: ScheduleEvent[]
}

export interface InputValidator {
  isValid: (...args: any[]) => boolean,
  error: string
}

export interface State {
  activeDate: Date,
  currentEvent: ScheduleEvent,
  events: DateEventsMap,
  timeSlotsCoords: TimeSlotsCoords[] | null,
}
