import Calendar from './calendar';
import CalendarUI from './calendar_ui';

import Schedule from './schedule';
import ScheduleUI from './schedule_ui';

const $inputs = document.querySelectorAll('.input');

Array.from($inputs).forEach($el => {
  $el.addEventListener('click', () => {
    $el.querySelector('input').focus();
  });
});

const init = () => {
  Calendar.init();
  Schedule.init(Calendar);

  ScheduleUI.init(Schedule);
  CalendarUI.init(Calendar, ScheduleUI);
  // setTitle();
};

init();
