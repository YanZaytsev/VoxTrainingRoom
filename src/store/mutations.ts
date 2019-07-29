import {MutationTree} from "vuex";
import {EventCoords, EventTimeInterval, ScheduleEvent, State, TimeSlotsCoords} from "@/lib/types";
import {createDefaultEvent, getCoordsByTime, getTimeByCoords} from "@/lib/helpers/schedule";

let currentId = 0;

export const mutations: MutationTree<State> = {
  changeDate(state, newDate) {
    state.activeDate = newDate;
  },

  addEvent(state, event) {
    const dateStr: string = state.activeDate.toDateString();

    if (!state.events.hasOwnProperty(dateStr)) {
      state.events = {...state.events, [dateStr]: []}
    }

    event.id = currentId++;

    state.events[dateStr].push(event);
  },

  resetEvent(state) {
    state.currentEvent = createDefaultEvent();
  },

  setTimeSlotCoords(state, timeSlotCoords) {
    state.timeSlotsCoords = timeSlotCoords;
  },

  setEventStyles(state, {top, height}) {
    if (top) {
      state.currentEvent.styles.top = top;
    }

    if (height) {
      state.currentEvent.styles.height = height;
    }
  },

  setTimeInterval(state, {top, bottom}) {
    const {startTime, endTime}: EventTimeInterval = getTimeByCoords(<TimeSlotsCoords[]>state.timeSlotsCoords, {
      top,
      bottom
    });

    state.currentEvent.startTime = startTime;
    state.currentEvent.endTime = endTime;
  },

  setCurrentEvent(state, event: ScheduleEvent) {
    state.currentEvent = event;
  },

  editEvent(state, event: ScheduleEvent) {
    const dateStr = state.activeDate.toDateString();
    const currentDateEvents = state.events[dateStr];

    if (currentDateEvents && currentDateEvents.length) {
      const editEventInd = currentDateEvents.findIndex(ev => ev.id === event.id);

      const newEvents = [...currentDateEvents.slice(0, editEventInd), event, ...currentDateEvents.slice(editEventInd + 1)];

      state.events[dateStr] = newEvents;
    }
  },

  deleteEvent(state, event: ScheduleEvent) {
    const dateStr = state.activeDate.toDateString();
    const currentDateEvents = state.events[dateStr];

    if (currentDateEvents && currentDateEvents.length) {
      state.events[dateStr] = currentDateEvents
        .filter((ev: ScheduleEvent) => event.id !== ev.id)
    }
  },

  setVectorHeight(state, vectorHeight) {
    state.currentEvent.meta.vectorHeight = vectorHeight;
  },

  setStartingPoint(state, startingPoint) {
    state.currentEvent.meta.startingPoint = startingPoint;
  },
};
