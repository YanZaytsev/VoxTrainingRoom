import Vue from 'vue';
import Vuex, {GetterTree} from 'vuex';

import {ScheduleEvent, State} from "@/lib/types";
import {monthNames} from "@/lib/consts";
import {mutations} from "@/store/mutations";
import {createDefaultEvent} from "@/lib/helpers/schedule";

Vue.use(Vuex);

const state: State = {
  activeDate: new Date(),
  events: {},
  currentEvent: createDefaultEvent(),
  timeSlotsCoords: null,
};

const getters: GetterTree<State, any> = {
  dateTitle: ({activeDate}) => `${activeDate.getDate()} ${
    monthNames[activeDate.getMonth()]
    } ${activeDate.getFullYear()}`,

  currentDateEvents: ({activeDate, events}) => {
    const dateStr = activeDate.toDateString();

    if (events[dateStr] && events[dateStr].length) {
      return events[dateStr];
    }

    return [];
  },

  currentDateCategories: () => {
    const currentEvents = store.getters.currentDateEvents;

    const categories = Array.from(new Set(currentEvents.map(({type}: { type: string }) => type)));

    return categories;
  },

  hasCurrentEventExist: (state): boolean => {
    const currentEvents = store.getters.currentDateEvents;

    if (state.currentEvent && currentEvents.length) {
      return currentEvents.some((event: ScheduleEvent) => {
        return state.currentEvent.id === event.id
      });
    }

    return false;
  }

};

export const store = new Vuex.Store({
  state,
  getters,
  mutations
});
