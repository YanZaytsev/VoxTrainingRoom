import {MonthTypes} from "../../lib/enums";
import {MonthTypes} from "../../lib/enums";
<template lang="pug">
  aside.calendar__wrapper
    .calendar__header
      .arrow.arrow_left(@click="changeMonth(-1)")
        SvgIcon(name="calendar_arrow")
      h3.calendar__month  {{monthTitle}}
      .arrow.arrow_right(@click="changeMonth(1)")
        SvgIcon(name="calendar_arrow")
    .calendar
      ul.calendar__weekdays
        li.weekday(v-for="weekday in weekDays") {{weekday}}
      ul.calendar__monthdays
        li.monthday(
          v-for="{day, isCurrentDate, month} in daysToDisplay"
          :class="{active: isCurrentDate, [month]: true}"
          :key="day + month"
          @click="changeCurrentDate(day, month)")
          span {{day}}
    .categories__wrapper
      p.categories__title(v-if="currentDateCategories.length") Your categories
      .categories
        button.category(
          v-for="category in currentDateCategories"
          :class="{[category.toLowerCase()]: true}") {{category}}
</template>

<script lang="ts">
  import {Component, Vue} from 'vue-property-decorator';
  import {Getter, Mutation, State} from 'vuex-class'

  import {MonthDay} from '@/lib/types';
  import {monthNames} from "@/lib/consts";
  import {MonthTypes} from "@/lib/enums";
  import SvgIcon from "@/components/ui/SvgIcon.vue";
  import {getDaysInMonth, getNextMonthDaysToDisplay, getPrevMonthDaysToDisplay} from "@/lib/helpers/calendar";
  import {range} from "@/lib/helpers/common";


  @Component({
    components: {SvgIcon}
  })
  export default class RightSidebar extends Vue {
    @State activeDate: Date;

    @Getter currentDateCategories: string[];

    @Mutation private changeDate!: (date: Date) => void;

    private calendarDate: Date = new Date();
    private weekDays: string[] = ['M', 'T', 'W', 'T', 'F', 'Sat', 'Sun'];

    get monthTitle(): string {
      return `${monthNames[this.calendarDate.getMonth()]} ${this.calendarDate.getFullYear()}`;
    }

    get daysToDisplay(): MonthDay[] {
      const now: Date = new Date();
      const month = this.calendarDate.getMonth();

      now.setMonth(month);

      const daysInCurrentMonth = getDaysInMonth(month);

      const prevMonth: number = new Date(
        new Date().setMonth(now.getMonth() - 1)
      ).getMonth();

      const nextMonth: number = new Date(
        new Date().setMonth(now.getMonth() + 1)
      ).getMonth();

      const daysInPrevMonth: number = getDaysInMonth(prevMonth);
      const daysInNextMonth: number = getDaysInMonth(nextMonth);

      const firstMonthWeekDay: number = new Date(now.setDate(1)).getDay();
      const lastMonthWeekday: number = new Date(now.setDate(daysInCurrentMonth)).getDay();

      const prevMonthDaysToDisplay: number = getPrevMonthDaysToDisplay(
        firstMonthWeekDay
      );
      const lastMonthDaysToDisplay: number = getNextMonthDaysToDisplay(
        lastMonthWeekday
      );


      const prevMonthDays: MonthDay[] = range(1, daysInPrevMonth)
        .slice(-prevMonthDaysToDisplay)
        .map(day => ({
          day,
          month: MonthTypes.Prev,
          isCurrentDate:
            prevMonth === this.activeDate.getMonth() && day === this.activeDate.getDate()
        }));

      const currentMonthDays: MonthDay[] = range(1, daysInCurrentMonth).map(day => ({
        day,
        month: MonthTypes.Current,
        isCurrentDate:
          this.calendarDate.getMonth() === this.activeDate.getMonth() && day === this.activeDate.getDate()
      }));

      const nextMonthDays: MonthDay[] = range(1, daysInNextMonth)
        .slice(0, lastMonthDaysToDisplay)
        .map(day => ({
          day,
          month: MonthTypes.Next,
          isCurrentDate:
            nextMonth === this.activeDate.getMonth() && day === this.activeDate.getDate()
        }));

      return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
    }

    changeMonth(offset: number): void {
      this.calendarDate = new Date(this.calendarDate.setMonth(this.calendarDate.getMonth() + offset));
    }

    changeCurrentDate(day: number, month: MonthTypes): void {
      if (month === MonthTypes.Prev) {
        this.changeMonth(-1);
      } else if (month === MonthTypes.Next) {
        this.changeMonth(1);
      }


      const newDate = new Date(this.calendarDate.setDate(day));
      this.changeDate(newDate);

      this.$root.$emit('scrolllschedule');
    }
  }
</script>

<style>
  .calendar {
    padding: 20px 10px 30px 10px;
    height: 460px;
    font-size: 18px;
    color: var(--white);
    position: relative;

    li {
      width: 24px;
      height: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 16px;

      &.weekday,
      &.monthday.next span,
      &.monthday.prev span {
        opacity: 0.6;
      }

      &.monthday:hover,
      &.monthday.active {
        cursor: pointer;
        background: #3c82f9;
        transform: scale(1.8);
        border-radius: 50%;

        span {
          transform: scale(0.6);
        }
      }
    }

    &__weekdays,
    &__monthdays {
      margin: 0;
      align-items: center;
      padding: 22px 0;
      display: grid;
      grid-column-gap: 14px;
      grid-row-gap: 32px;
      justify-items: center;
      grid-template-columns: repeat(7, 1fr);
    }


    &__wrapper {
      padding: 0px 35px;
      background: rgba(42, 46, 65, 0.7);
    }

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      height: 80px;
      position: relative;
    }

    &__month {
      font-weight: normal;
      font-size: 20px;
      color: var(--white);
    }
  }

  .calendar::after,
  .calendar__header::after {
    content: '';
    width: 100%;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.17) 0% 50%,
      rgba(255, 255, 255, 0.13) 50% 100%
    );
    position: absolute;
    height: 4px;
    bottom: 0;
    opacity: 0.25;
  }

  .categories {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    justify-content: space-between;

    &__title {
      font-size: 18px;
      color: var(--white);
      margin: 30px 0 30px 0;
    }
  }

  .category {
    padding: 12px 16px;
    height: 45px;
    border-radius: 5px;
    border-width: 0;
    text-transform: uppercase;
    width: 48%;
    font-size: 14px;
    color: var(--white);
    margin-bottom: 20px;

    &.finance {
      background: #8576ed;
    }

    &.management {
      background: #f39946;
    }

    &.design {
      background: #3D83F9;
    }
  }

  .arrow {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 30px;
    height: 30px;
    cursor: pointer;

    &_right {
      svg {
        transform: rotate(180deg);
      }
    }
  }
</style>
