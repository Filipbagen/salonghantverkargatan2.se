(function () {
  'use strict';

  function getHairdressers () {
    const data = [
      {
        'name': 'Sofia',
        'lastname': 'Seppälä',
        'img': 'sofia',
        'key': 'QN225Q'
      }, {
        'name': 'Petra',
        'lastname': 'Larsson',
        'img': 'petra',
        'key': '3DXXZ3'
      }, {
        'name': 'Caroline',
        'lastname': 'Asplund',
        'img': 'caroline',
        'key': '36MMMQ'
      }, {
        'name': 'Hannah',
        'lastname': 'Åkermark',
        'img': 'hannah',
        'key': '3MZVNQ'
      }, {
        'name': 'Josefina',
        'lastname': 'Nettelmark',
        'img': 'josefina',
        'key': '3M44DQ'
      }, {
        'name': '',
        'lastname': 'Snabbast möjliga tid',
        'img': 'dog',
        'key': ''
      }
    ];
    return data
  }

  /*!
   * weeknumber
   * @author commenthol
   * @license Unlicense
   */
  const WEEK = 604800000; // = 7 * 24 * 60 * 60 * 1000 = 7 days in ms

  /**
   * ISO 8601 week numbering.
   *
   * New week starts on mondays.
   * Used by most European countries, most of Asia and Oceania.
   *
   * 1st week contains 4-7 days of the new year
   * @param {Date} [date] - local date - its recommended to use noon to avoid issues for days switching to DST
   * @return {Number} week number in ISO 8601 format
   * @example
   * weekNumber(new Date(2016, 0, 3, 12)) // Sun
   * //> 53
   * weekNumber(new Date(2016, 0, 4, 12)) // Mon
   * //> 1
   */
  const weekNumber = (date = new Date()) => {
    // day 0 is monday
    const day = (date.getDay() + 6) % 7;
    // get thursday of present week
    const thursday = new Date(date);
    thursday.setDate(date.getDate() - day + 3);
    if (thursday.getHours() < 3) thursday.setHours(3); // avoid problems with DST changes
    // set 1st january first
    const firstThursday = new Date(thursday.getFullYear(), 0, 1);
    // if Jan 1st is not a thursday...
    if (firstThursday.getDay() !== 4) {
      firstThursday.setMonth(0, 1 + (11 /* 4 + 7 */ - firstThursday.getDay()) % 7);
    }
    const weekNumber = 1 + Math.floor((thursday - firstThursday) / WEEK);
    return weekNumber
  };

  /* global fetch */

  /**
   * @param {String} key
   * @returns {Promise<ResourceServices>}
   */
  function getResourceServices (key) {
    return fetch('https://liveapi04.cliento.com/api/vip/services/' + key)
      .then(function (response) {
        return response.json()
      })
  }

  /**
   * @param {Number} serviceId
   * @param {String} key
   * @param {Number} year
   * @param {Number} week
   * @returns {Promise<ResourceServices>}
   */
  function getServiceSchedule (serviceId, key, year, week) {
    // return fetch('https://liveapi04.cliento.com/api/vip/slots/service/' + String(serviceId) + '/resource/' + key + '/' + today.getFullYear() + '-' + weekNumber(today) + week + '/')
    return fetch('https://liveapi04.cliento.com/api/vip/slots/service/' + String(serviceId) + '/resource/' + key + '/' + year + '-' + week + '/')
      .then(function (response) {
        return response.json()
      })
  }

  var scrollDuration = 512;

  function easeInOutQuad (t) {
    return t < 0.5
      ? 2 * t * t
      : -1 + (4 - 2 * t) * t
  }

  function smoothScrollTo (href) {
    var start = window.performance.now();
    var target = document.getElementById(href.substring(1));

    var startY = window.scrollY;
    var deltaY = target.getBoundingClientRect().top;

    function move (pos) {
      window.scroll(0, startY + (deltaY * pos));
    }

    function update (ts) {
      var pos = (ts - start) / scrollDuration;

      if (pos >= 1) {
        return move(1)
      }

      move(easeInOutQuad(pos));

      window.requestAnimationFrame(update);
    }

    window.requestAnimationFrame(update);
  }

  var elements = Array.from(document.querySelectorAll('.smooth-scroll'));

  for (let element of elements) {
    element.addEventListener('click', function (ev) {
      ev.preventDefault();
      smoothScrollTo(element.getAttribute('href'));
    });
  }

  // const weeknumber = require('weeknumber')
  // import weeknumber from 'weeknumber'
  // import { weekNumber } from './weeknumber.js'

  const monthNames = ['Jan', 'Feb', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
  const dayNames = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

  /** @typedef {import('./data-handling.js').ResourceServices} ResourceServices */

  /**
   * @typedef {HairDresser} hairDressers[]
   */

  /**
   * @typedef {Object} HairDresser
   * @property {String} name
   * @property {String} lastname
   * @property {String} img
   * @property {String} key
   */

  let selectedOptions = { hairDresser: {}, service: {} };

  /** @type {Date} */
  let activeSchedule = getWeekStartDate(new Date());

  /**
   * Called from body.onload, starts the entire application
   */
  function initiatePage () {
    highlightDayOfTheWeek();
    populateHairdresserContainer();
  }

  function getToday () {
    return new Date().getDay() ? new Date().getDay() : 7
  }

  function highlightDayOfTheWeek () {
    const target = /** @type {HTMLElement} */ (document.querySelector('#OpeningHours :nth-child(' + getToday() + ')'));
    target.classList.add('today');
  }

  function populateHairdresserContainer () {
    const hairdresserContainer = document.querySelector('#hairdresserContainer');
    getHairdressers().forEach(hairDresser => {
      const container = document.createElement('div');
      const img = document.createElement('img');
      const ring = document.createElement('div');
      const firstName = document.createElement('p');
      const lastName = document.createElement('p');

      container.addEventListener('click', function () {
        resourceClick(hairDresser);
      });
      container.id = hairDresser.key;
      img.src = 'assets/img/profile/' + hairDresser.img + '.jpg';
      ring.classList.add('ring');
      firstName.textContent = hairDresser.name;
      lastName.textContent = hairDresser.lastname;

      container.appendChild(ring);
      container.appendChild(img);
      container.appendChild(firstName);
      container.appendChild(lastName);
      if (hairdresserContainer) { hairdresserContainer.appendChild(container); }
    });
  }

  /** @param {Object} hairDresser */
  function resourceClick (hairDresser) {
    if (animateResourceRing(hairDresser)) {
      getResourceServices(hairDresser.key).then(function (resourceServices) {
        populateResourceContainer(resourceServices);
      });
      selectedOptions.hairDresser = hairDresser;
    } else {
      animateContainer(false, '#what');
      selectedOptions = { hairDresser: {}, service: {} };
    }
  }

  /** @param {HairDresser} hairDresser */
  function animateResourceRing (hairDresser) {
    const clickedElement = document.getElementById(hairDresser.key);
    const lastClickedElement = document.querySelector('.selected');
    if (clickedElement) {
      if (lastClickedElement) {
        lastClickedElement.classList.remove('selected');
      }
      if (lastClickedElement !== clickedElement) {
        clickedElement.classList.add('selected');
        return true
      } else {
        return false
      }
    }
  }

  /** @param {ResourceServices} resourceServices */
  function populateResourceContainer (resourceServices) {
    const container = document.querySelector('#resourceServiceContainer');
    let includesSelectedResource = false;
    if (container) {
      container.innerHTML = '';
      resourceServices.services.forEach(function (service) {
        const row = document.createElement('div');
        const name = document.createElement('p');
        const timeIcon = document.createElement('i');
        const time = document.createElement('p');
        const price = document.createElement('p');

        if (selectedOptions.service.serviceId === service.serviceId) {
          row.classList.add('activeResourceOption');
          includesSelectedResource = true;
        }
        row.addEventListener('click', function () {
          selectedOptions.service = service;
          const startDate = getWeekStartDate(new Date());
          getServiceSchedule(service.serviceId, selectedOptions.hairDresser.key, startDate.getFullYear(), weekNumber(startDate)).then(function (serviceSchedule) {
            populateScheduleContainer(serviceSchedule);
          });
          animateService(service);
        });
        row.id = String(service.serviceId);
        name.textContent = service.name;
        timeIcon.className = 'fa fa-clock';
        time.textContent = (service.minDuration === service.maxDuration) ? service.minDuration + 'min' : service.minDuration + 'min - ' + service.maxDuration + 'min';
        const priceString = service.maxPrice ? service.maxPrice + 'kr' : '';
        price.textContent = priceString;

        row.appendChild(name);
        row.appendChild(timeIcon);
        row.appendChild(time);
        row.appendChild(price);
        container.appendChild(row);
      });
    }
    if (!includesSelectedResource) {
      selectedOptions.service = {};
    }
    animateContainer(true, '#what');
  }

  /** @param {Boolean} state */
  /** @param {String} id */
  function animateContainer (state, id) {
    const target = /** @type {HTMLElement} */ document.querySelector(id);

    if (target) {
      if (state) {
        const items = document.querySelector(id + ' div.content');
        if (target && items) {
          target.style.height = items.scrollHeight;
          console.log(target);
          console.log(items.scrollHeight);
        }
      } else {
        target.style.height = 0;
      }
    }
  }

  /** @param {Service} service */
  function animateService (service) {
    const previous = /** @type {HTMLElement} */ document.querySelectorAll('.activeResourceOption');
    if (previous[0]) {
      previous.forEach(function (item) {
        item.classList.remove('activeResourceOption');
      });
    }

    const next = /** @type {HTMLElement} */ document.getElementById(String(service.serviceId));
    if (next) {
      next.classList.add('activeResourceOption');
    }
  }

  /** @param {Date} date */
  function getWeekStartDate (date) {
    const newDate = new Date(date.setDate(date.getDate() - getRealDay(date)));
    return newDate
  }

  /** @param {Date} date */
  /** @param {number} toAdd */
  function addDays (date, toAdd) {
    return new Date(date.setDate(date.getDate() + toAdd))
  }

  /** @param {Date} date */
  function getRealDay (date) {
    let dateNumber = date.getDay() === 0 ? 6 : date.getDay() - 1;
    return dateNumber
  }

  /** @param {ServiceSchedule} serviceSchedule */
  function populateScheduleContainer (serviceSchedule) {
    populateScheduleDate();
    populateScheduleBoxes(serviceSchedule);
    animateContainer(true, '#when');
  }

  /** @param {string} type */
  function scheduleArrowClick (type) {
    if (type === 'forward') {
      activeSchedule = addDays(activeSchedule, 7);
    } else if (type === 'backward') {
      activeSchedule = addDays(activeSchedule, -7);
    }
    getServiceSchedule(selectedOptions.service.serviceId, selectedOptions.hairDresser.key, activeSchedule.getFullYear(), weekNumber(activeSchedule)).then(function (serviceSchedule) {
      populateScheduleContainer(serviceSchedule);
    });
  }

  /** @param {ServiceSchedule} serviceSchedule */
  function populateScheduleBoxes (serviceSchedule) {
    const target = document.getElementById('resourceScheduleContainer');
    const startDate = activeSchedule;
    const oneWeekForward = addDays(new Date(startDate.getTime()), 6);

    if (target) {
      target.innerHTML = '';
      for (let i = new Date(startDate.getTime()); i.getTime() <= oneWeekForward.getTime(); i = addDays(i, 1)) {
        const column = document.createElement('div');
        const day = document.createElement('div');
        const dayName = document.createElement('h2');
        const dayDate = document.createElement('p');
        column.classList.add('column');
        dayName.textContent = dayNames[getRealDay(i)];
        dayDate.textContent = i.getDate() + ' ' + monthNames[i.getMonth()];
        day.appendChild(dayName);
        day.appendChild(dayDate);
        column.appendChild(day);
        target.appendChild(column);
      }
    }
  }

  function populateScheduleDate () {
    const scheduleInfobar = document.getElementById('scheduleInfobar');
    if (scheduleInfobar) {
      scheduleInfobar.innerHTML = '';

      const weekElement = document.createElement('h2');
      const dateElement = document.createElement('p');
      const startDate = activeSchedule;
      const oneWeekForward = addDays(new Date(startDate.getTime()), 6);

      weekElement.textContent = 'Vecka ' + weekNumber(startDate);
      dateElement.textContent = startDate.getDate() + ' ' + monthNames[startDate.getMonth()] + ' - ' + String(oneWeekForward.getDate()) + ' ' + monthNames[oneWeekForward.getMonth()];
      scheduleInfobar.appendChild(weekElement);
      scheduleInfobar.appendChild(dateElement);
    }
  }

  /* Export public functions */
  window['initiatePage'] = initiatePage;
  window['scheduleArrowClick'] = scheduleArrowClick;

}());
//# sourceMappingURL=bundle.js.map
