import {ResizingType} from "../../lib/enums";
<template lang="pug">
  main.schedule
    .schedule__wrapper
      .schedule__header
        h3.schedule__date {{dateTitle}}
        .schedule__actions
          //input.search
          .search-icon
            SvgIcon(name="search")
          .layout-icon
            SvgIcon(name="layout")
      .schedule__content.vox-scroll(
        ref="scheduleContainer"
        @mousedown.left="startEventSelection")
        .event(v-for="hour in hours" ref="slots")
          .event__time {{hour}}
          .event__desc
            .event__time-line
            .event__task
        .event__wrapper(
          v-for="(event) in currentDateEvents"
          v-show="!event.isResizing"
          :style="event.styles")
          .event__resizer_up(
            @mousedown.stop="resizeEvent($event, 'top', event)"
            :class="{'hoverEnabled': !isCreatingOrResizingEvent}")

          .event__resizer_down(
            @mousedown.stop="resizeEvent($event, 'bottom', event)"
            :class="{'hoverEnabled': !isCreatingOrResizingEvent}")

          .event__task(
            @mouseup.left="editEvent(event)"
            @mousedown.left.stop="moveEvent($event, event)"
            :class="{[event.type.toLowerCase()]: true, 'hoverEnabled': !isCreatingOrResizingEvent}")
            .event__text
              p(v-show="parseInt(event.styles.height, 10) > 50") {{event.name}}
              span(v-if="event.desc && parseInt(event.styles.height, 10) > 71") {{event.desc}}
        .event__wrapper(:style="eventStyles")
          .event__task(:class="[currentEvent.type ? currentEvent.type.toLowerCase() : 'default', {isMoving: isMovingEvent}]")
            .event__text
              p(v-show="parseInt(eventStyles.height, 10) > 50") {{currentEvent.name}}
              span(v-if="currentEvent.desc && parseInt(eventStyles.height, 10) > 71") {{currentEvent.desc}}
</template>

<script lang="ts">
  import {Component, Vue} from 'vue-property-decorator';
  import {Getter, Mutation, State} from 'vuex-class'

  import SvgIcon from '@/components/ui/SvgIcon.vue';
  import {EventCoords, ScheduleEvent, TimeSlotsCoords} from "@/lib/types";
  import {range} from "@/lib/helpers/common";
  import {nineAMTopPosition} from "@/lib/consts";
  import {ResizingType} from '@/lib/enums';
  import {getTopAndBottomBorders} from "@/lib/helpers/schedule";

  @Component({
    components: {SvgIcon}
  })
  export default class EventsSchedule extends Vue {
    @State currentEvent: ScheduleEvent;

    @Getter dateTitle: string;
    @Getter currentDateEvents: ScheduleEvent[];

    @Mutation setTimeInterval!: ({top, bottom}: EventCoords) => void;
    @Mutation setTimeSlotCoords!: (timeSlotCoords: TimeSlotsCoords[]) => void;
    @Mutation setEventStyles!: ({top, height}: { top: string, height: string }) => void;
    @Mutation setCurrentEvent!: (event: ScheduleEvent) => void;
    @Mutation('editEvent') editExistingEvent: (event: ScheduleEvent) => void;
    @Mutation resetEvent!: () => void;
    @Mutation deleteEvent!: (event: ScheduleEvent) => void;

    @Mutation setStartingPoint!: (value: number) => void;
    @Mutation setVectorHeight!: (value: number) => void;

    $refs!: {
      scheduleContainer: Element,
      slots: Element[]
    };

    private isCreatingEvent: boolean = false;
    private isIntersecting: boolean = false;
    private resizing: ResizingType | false;
    private isMovingEvent: boolean = false;

    private scheduleContainer: HTMLElement | null = null;
    private containerTop: number = 0;
    private containerBottom: number = 0;
    private paddingHeight: number = 0;
    private currentScrollTop: number = 0;
    private lastMousePoint: number = 0;
    private lastScrollTop: number = 0;
    private movementTimeout: number = 0;

    private closestIntersectingEventCoords: { top: number, height: number, startingPoint: number, vectorHeight: number } | undefined;


    private hours: string[] = range(0, 23).map(n => `${n >= 10 ? n : `0${n}`}:00`);

    private vectorHeight: number = 0;
    private startingPoint: number = 0;

    beforeDestroy() {
      (<HTMLElement>this.scheduleContainer).removeEventListener('scroll', this.handleScroll);

      this.$root.$off('window:mousemove', this.handleMouseMove);
      this.$root.$off('window:mouseup', this.stopEventSelection);
      this.$root.$off('event:reset', this.resetCoords);
    }

    mounted(): void {
      this.scheduleContainer = <HTMLElement>this.$refs.scheduleContainer;
      const containerCoords = this.scheduleContainer.getBoundingClientRect();

      this.scheduleContainer.addEventListener('scroll', this.handleScroll);

      this.containerTop = containerCoords.top;

      this.paddingHeight = parseInt(
        <string>window.getComputedStyle(this.scheduleContainer).paddingTop,
        10
      );

      const timeSlotsCoords = this.getTimeSlotsCoords();
      this.setTimeSlotCoords(timeSlotsCoords);
      this.containerBottom = parseInt(timeSlotsCoords[timeSlotsCoords.length - 1].bottom, 10);

      (<HTMLElement>this.scheduleContainer).scrollTo(0, nineAMTopPosition);

      this.$root.$on('scrolllschedule', () => {
        (<HTMLElement>this.scheduleContainer).scrollTo(0, nineAMTopPosition);
      });

      this.$root.$on('window:mousemove', this.handleMouseMove);
      this.$root.$on('window:mouseup', this.stopEventSelection);
      this.$root.$on('event:reset', this.resetCoords);
    }

    private getTimeSlotsCoords(): TimeSlotsCoords[] {
      const coords = this.$refs.slots.map(($el: Element, ind: number) => {
        let {top}: { top: number } = $el.getBoundingClientRect();
        const {height}: { height: number } = $el.getBoundingClientRect();

        top -= this.containerTop;
        top = Math.ceil(top);

        return {
          top,
          height,
          bottom: top + height,
          time: this.hours[ind]
        };
      });

      return coords;
    }

    private get eventStyles(): { top: string, height: string, cursor?: string } {
      let newTop = this.vectorHeight > 0 ? this.startingPoint
        : this.startingPoint - Math.abs(this.vectorHeight);

      let newHeight = Math.abs(this.vectorHeight);

      if (this.isMovingEvent) {
        newTop = this.startingPoint + this.vectorHeight;
        newHeight = parseInt(this.currentEvent.styles.height, 10);
      }


      const isCrossingTopBorder = this.borders && newTop <= this.borders.topBorder;
      const isCrossingBottomBorder = this.borders && newTop + newHeight > this.borders.bottomBorder;

      const withinBorders = isCrossingTopBorder || isCrossingBottomBorder;

      if (withinBorders) {
        if (isCrossingTopBorder) {
          newTop = this.borders.topBorder;

          if (!this.isMovingEvent) {
            const maxHeight = Math.abs(this.startingPoint - this.borders.topBorder);
            newHeight = maxHeight;
          }
        } else if (isCrossingBottomBorder) {
          if (this.isMovingEvent) {
            newTop = Math.abs(this.borders.bottomBorder - parseInt(this.currentEvent.styles.height, 10));
          } else {
            const maxHeight = Math.abs(this.borders.bottomBorder - this.startingPoint);

            newHeight = maxHeight;
          }
        }
      } else {
        this.closestIntersectingEventCoords = undefined;
      }

      if (newTop === this.paddingHeight && newHeight === this.paddingHeight) {
        newTop = newHeight = 0;
      }

      return {top: `${newTop}px`, height: `${newHeight}px`, ...(this.isMovingEvent && {cursor: 'move'})}
    }

    private get isCreatingOrResizingEvent(): boolean {
      return parseInt(this.eventStyles.height, 10) > this.paddingHeight || !!this.resizing;
    }

    private get borders() {
      const coords = getTopAndBottomBorders(this.currentDateEvents, {
        startingPoint: this.startingPoint,
        id: Number(this.currentEvent.id)
      });

      const topBorder = (coords && coords.topBorder) || this.paddingHeight;
      const bottomBorder = (coords && coords.bottomBorder) || this.containerBottom;

      return {
        topBorder,
        bottomBorder
      };
    }

    private resetCoords() {
      this.vectorHeight = 0;
      this.startingPoint = 0;
    }

    private handleScroll() {
      this.currentScrollTop = (<HTMLElement>this.scheduleContainer).scrollTop;
      const scrollDiff = this.currentScrollTop - this.lastScrollTop;

      if (this.isCreatingEvent) {
        const vectorHeight = this.vectorHeight + scrollDiff;

        this.vectorHeight = vectorHeight;
        this.lastScrollTop = this.currentScrollTop;
      }
    }

    private handleMouseMove(e: MouseEvent) {
      if (this.isCreatingEvent) {

        if (e.pageY > (<HTMLElement>this.scheduleContainer).getBoundingClientRect().bottom) {
          return false;
        }

        const currentMousePoint = e.pageY;
        const mouseDiff = currentMousePoint - this.lastMousePoint;

        const vectorHeight = this.vectorHeight + mouseDiff;
        this.vectorHeight = vectorHeight;

        this.lastMousePoint = currentMousePoint;
      }
    }

    private startEventSelection(e: MouseEvent) {
      if (this.resizing) {
        return false;
      }


      this.lastMousePoint = e.pageY;
      this.lastScrollTop = (<HTMLElement>this.scheduleContainer).scrollTop;

      const withinPadding: boolean = e.pageY - this.containerTop <= this.paddingHeight;

      if (withinPadding) {
        return false;
      }

      if (!this.isCreatingEvent) {
        this.isCreatingEvent = true;
        this.startingPoint = e.pageY - this.containerTop + this.currentScrollTop;
      }

      return true;
    }

    private stopEventSelection() {
      const height: number = parseInt(this.eventStyles.height, 10);

      const top: number = parseInt(this.eventStyles.top, 10);
      const bottom: number = top + height;

      this.setTimeInterval({top, bottom});

      if (this.isCreatingEvent) {
        if (height) {
          this.setVectorHeight(parseInt(this.eventStyles.height, 10));
          this.setStartingPoint(this.startingPoint);
          this.setEventStyles(this.eventStyles);
        }

        if (!this.resizing && !this.isMovingEvent && height) {
          this.$root.$emit('openmodal', this.currentEvent);
        } else if (this.resizing || this.isMovingEvent) {
          if (!height) {
            this.deleteEvent(this.currentEvent);
          } else {
            this.editExistingEvent(this.currentEvent);
            this.resetCoords();
          }
        }
      }

      this.resetEvent();
      this.resizing = false;
      this.isIntersecting = false;
      this.isCreatingEvent = false;
      this.isMovingEvent = false;
      this.currentEvent.isResizing = false;
    }

    private editEvent(event: ScheduleEvent) {
      clearTimeout(this.movementTimeout);

      if (this.resizing || this.isMovingEvent) {
        return false;
      }

      this.$root.$emit('openmodal', event);
    }

    private moveEvent(e: MouseEvent, event: ScheduleEvent) {
      this.movementTimeout = setTimeout(() => {
        this.isMovingEvent = true;
        this.lastMousePoint = e.pageY;
        this.lastScrollTop = (<HTMLElement>this.scheduleContainer).scrollTop;
        this.isCreatingEvent = true;

        this.setCurrentEvent({...event});

        this.startingPoint = parseInt(event.styles.top, 10);
        this.vectorHeight = 0;
        event.isResizing = true;
      }, 200);
    }

    private resizeEvent(e: MouseEvent, resizingFrom: ResizingType, event: ScheduleEvent) {
      this.resizing = resizingFrom;

      this.lastMousePoint = e.pageY;
      this.lastScrollTop = (<HTMLElement>this.scheduleContainer).scrollTop;
      this.isCreatingEvent = true;

      this.setCurrentEvent({...event});

      this.startingPoint = this.resizing === ResizingType.Top
        ? parseInt(event.styles.top, 10) + parseInt(event.styles.height, 10)
        : parseInt(event.styles.top);

      this.vectorHeight = this.resizing === ResizingType.Top
        ? -Math.abs(event.meta.vectorHeight)
        : Math.abs(event.meta.vectorHeight);

      event.isResizing = true;
    }

  }
</script>

<style>
  .schedule {
    padding: 0px 80px;

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      height: 80px;
      position: relative;
      background: var(--white);
      top: 0;
      z-index: 3;
      border-bottom: 2px solid var(--gray-3);
    }

    &__date {
      font-weight: normal;
      font-size: 20px;
      color: var(--dark-blue-200);
    }

    &__content {
      padding-top: 6px;
      position: relative;
      max-height: calc(100vh - 180px);
      margin-top: 70px;
      margin-bottom: 30px;
    }

    &__actions {
      display: flex;
      align-items: center;
      width: 60px;
      justify-content: space-between;

      svg {
        width: 20px;
        height: 20px;
        stroke: #8998b4;
        cursor: pointer;

        &:hover {
          stroke: var(--dark-blue-100);
        }
      }
    }
  }

  .event {
    height: 70px;
    display: flex;
    align-items: center;

    &__desc {
      margin-left: 40px;
      height: 100%;
      width: 100%;
    }

    &__time {
      align-self: flex-start;
      position: relative;
      bottom: 8px;
      font-size: 16px;
      color: #a4b0c3;
      user-select: none;
    }

    &__time-line {
      height: 1px;
      background: var(--gray-3);
      width: 100%;
    }

    &__wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      font-size: 18px;
      color: var(--dark-blue-200);
      font-weight: 600;
      z-index: 2;
      height: 100%;
      position: absolute;
      width: calc(100% - 80px);
      margin-left: 80px;
      left: 0;
    }

    &__text {
      margin-top: 30px;
      padding: 0 35px;
      height: 100%;
      display: flex;
      position: relative;
      flex-direction: column;


      p,
      span {
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: break-word;
        white-space: normal;
      }

      p {
        font-size: 18px;

      }

      span {
        display: block;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1 0;
        margin-top: 16px;
        font-size: 14px;
        opacity: 0.7;
      }

    }

    &__task {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;

      transition: background 0s ease, opacity 0s ease;

      &.default,
      &.design,
      &.finance,
      &.management {
        cursor: pointer;

        &.isMoving:hover {
          cursor: move !important;
        }
      }

      &.default {
        opacity: 0.15;
        background: var(--grey-blue);
        border-left: 4px solid var(--dark-blue-100);
      }

      &.finance {
        background: rgba(133, 118, 237, 0.15);
        border-left: 4px solid #8576ed;
      }

      &.design {
        background: rgba(61, 131, 249, 0.15);
        border-left: 4px solid #3d83f9;
      }

      &.management {
        background: rgba(238, 165, 124, 0.15);
        border-left: 4px solid #eea57c;
      }

      &.hoverEnabled {
        transition: background 0.3s ease;
      }

      &.finance.hoverEnabled:hover {
        background: rgba(133, 118, 237, 0.3);
      }


      &.design.hoverEnabled:hover {
        background: rgba(61, 131, 249, 0.3);
      }


      &.management.hoverEnabled:hover {
        background: rgba(238, 165, 124, 0.3);
      }

    }


    &__resizer_up,
    &__resizer_down {
      width: calc(100% + 4px);
      height: 20px;
      left: -4px;
      position: absolute;

      &.hoverEnabled {
        cursor: n-resize;
      }
    }

    &__resizer_up {
      top: -10px;

      &.hoverEnabled:hover ~ .finance {
        background: linear-gradient(to top, rgba(133, 118, 237, 0.15) 70%, rgba(133, 118, 237, 0.30));
      }

      &.hoverEnabled:hover ~ .management {
        background: linear-gradient(to top, rgba(238, 165, 124, 0.15) 70%, rgba(238, 165, 124, 0.30));
      }

      &.hoverEnabled:hover ~ .design {
        background: linear-gradient(to top, rgba(61, 131, 249, 0.15) 70%, rgba(61, 131, 249, 0.30));
      }
    }

    &__resizer_down {
      bottom: -10px;

      &.hoverEnabled:hover + .finance {
        background: linear-gradient(to bottom, rgba(133, 118, 237, 0.15) 70%, rgba(133, 118, 237, 0.30));
      }

      &.hoverEnabled:hover + .management {
        background: linear-gradient(to bottom, rgba(238, 165, 124, 0.15) 70%, rgba(238, 165, 124, 0.30));
      }

      &.hoverEnabled:hover + .design {
        background: linear-gradient(to bottom, rgba(61, 131, 249, 0.15) 70%, rgba(61, 131, 249, 0.30));
      }
    }
  }
</style>
