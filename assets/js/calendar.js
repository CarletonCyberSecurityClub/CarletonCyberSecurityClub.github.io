!function() {

  var today = moment();

  function Calendar(selector, events) {
    this.el = document.querySelector(selector);
    this.events = events;
    this.current = moment().date(1);
    this.draw();
    var current = document.querySelector('.today');
    
    if(current) {
      var self = this;
      window.setTimeout(function() {
        self.openDay(current, "selected-date");
      }, 500);
    }

  }

  Calendar.prototype.draw = function() {
    //Create Header
    this.drawHeader();

    //Draw Month
    this.drawMonth();

    this.drawLegend();
  }

  Calendar.prototype.drawHeader = function() {
    var self = this;
    if(!this.header) {
      //Create the header elements
      this.header = createElement('div', 'header');
      this.header.className = 'header';

      this.title = createElement('h1');

      var right = createElement('div', 'right');
      right.addEventListener('click', function() { self.nextMonth(); });

      var left = createElement('div', 'left');
      left.addEventListener('click', function() { self.prevMonth(); });

      //Append the Elements
      this.header.appendChild(this.title); 
      this.header.appendChild(right);
      this.header.appendChild(left);
      this.el.appendChild(this.header);
    }

    this.title.innerHTML = this.current.format('MMMM YYYY');
  }

  Calendar.prototype.drawMonth = function() {
    var self = this;
    
    this.events.forEach(function(ev) {
     ev.date = moment(ev.d);
    });
    
    
    if(this.month) {
      this.oldMonth = this.month;
      this.oldMonth.className = 'month out ' + (self.next ? 'next' : 'prev');
      this.oldMonth.addEventListener('webkitAnimationEnd', function() {
        self.oldMonth.parentNode.removeChild(self.oldMonth);
        self.month = createElement('div', 'month');
        self.backFill();
        self.currentMonth();
        self.fowardFill();
        self.el.appendChild(self.month);
        window.setTimeout(function() {
          self.month.className = 'month in ' + (self.next ? 'next' : 'prev');
        }, 16);
      });
    } else {
        this.month = createElement('div', 'month');
        this.el.appendChild(this.month);
        this.backFill();
        this.currentMonth();
        this.fowardFill();
        this.month.className = 'month new';
    }
  }

  Calendar.prototype.backFill = function() {
    var clone = this.current.clone();
    var dayOfWeek = clone.day();

    if(!dayOfWeek) { return; }

    clone.subtract(dayOfWeek+1., 'days');

    for(var i = dayOfWeek; i > 0 ; i--) {
      this.drawDay(clone.add(1, 'days'));
    }
  }

  Calendar.prototype.fowardFill = function() {
    var clone = this.current.clone().add(1, 'months').subtract(1, 'days');
    var dayOfWeek = clone.day();

    if(dayOfWeek === 6) { return; }

    for(var i = dayOfWeek; i < 6 ; i++) {
      this.drawDay(clone.add(1,'days'));
    }
  }

  Calendar.prototype.currentMonth = function() {
    var clone = this.current.clone();

    while(clone.month() === this.current.month()) {
      this.drawDay(clone);
      clone.add(1,'days');
    }
  }

  Calendar.prototype.getWeek = function(day) {
    if(!this.week || day.day() === 0) {
      this.week = createElement('div', 'week');
      this.month.appendChild(this.week);
    }
  }

  Calendar.prototype.drawDay = function(day) {
    var self = this;
    this.getWeek(day);

    //Outer Day
    var outer = createElement('div', this.getDayClass(day));
    outer.addEventListener('click', function() {
      self.openDay(this);
    });

    //Day Name
    var name = createElement('div', 'day-name', day.format('ddd'));

    //Day Number
    var number = createElement('div', 'day-number', day.format('DD'));


    //Events
    var events = createElement('div', 'day-events');
    this.drawEvents(day, events);

    outer.appendChild(name);
    outer.appendChild(number);
    outer.appendChild(events);
    this.week.appendChild(outer);
  }

  Calendar.prototype.drawEvents = function(day, element) {
    if(day.month() === this.current.month()) {
      var todaysEvents = this.events.reduce(function(memo, ev) {
        if(ev.date.isSame(day, 'day')) {
          memo.push(ev);
        }
        return memo;
      }, []);

      todaysEvents.forEach(function(ev) {
        var evSpan = createElement('span', ev.color);
        element.appendChild(evSpan);
      });
    }
  }

  Calendar.prototype.getDayClass = function(day) {
    classes = ['day'];
    if(day.month() !== this.current.month()) {
      classes.push('other');
    } else if (today.isSame(day, 'day')) {
      classes.push('today');
    }
    return classes.join(' ');
  }

  Calendar.prototype.openDay = function(el) {
    var details, arrow;
    var dayNumber = +el.querySelectorAll('.day-number')[0].innerText || +el.querySelectorAll('.day-number')[0].textContent;
    var day = this.current.clone().date(dayNumber);

    var currentOpened = document.querySelector('.details');
    

    var todaysEvents = this.events.reduce(function(memo, ev) {
      if(ev.date.isSame(day, 'day')) {
        memo.push(ev);
      }
      return memo;
    }, []);

    this.renderEvents(todaysEvents, "selected-date");

    //arrow.style.left = el.offsetLeft - el.parentNode.offsetLeft + 27 + 'px';
  }

  Calendar.prototype.renderEvents = function(events, event_div) {
    var current_date = document.getElementById(event_div);
    current_date.innerHTML = '';
    events.forEach(function(ev) {
      var div = createElement('div', 'event card text-dark bg-light mb-2');
      var square = createElement('i', 'bi bi-circle-fill i' + ev.color);
      var span = createElement('span', 'event-title', "");
      var title = createElement("span", "", ev.eventName);
      span.appendChild(square);
      span.appendChild(title);
      
      var timespan = createElement('span', 'event-location', '');
      var timei = createElement('i', 'bi bi-clock', '');
      timespan.appendChild(timei);
      var time = createElement('span', '', ev.d + " " + ev.t);
      timespan.appendChild(time);
      var loc = createElement('span', 'event-location', 'Location: '+ev.loc);
      var description = createElement('span', 'event-location', 'Description: '+ev.descr);

      div.appendChild(span);
      div.appendChild(timespan);
      div.appendChild(loc);
      div.appendChild(description);
      current_date.appendChild(div);
    });

    if(!events.length) {
      var div = createElement('div', 'event empty');
      var span = createElement('span', '', 'No Events');

      div.appendChild(span);
      current_date.appendChild(div);
    }
  }

  Calendar.prototype.drawLegend = function() {
    var legend = createElement('div', 'legend');
    var calendars = this.events.map(function(e) {
      return e.calendar + '|' + e.color;
    }).reduce(function(memo, e) {
      if(memo.indexOf(e) === -1) {
        memo.push(e);
      }
      return memo;
    }, []).forEach(function(e) {
      var parts = e.split('|');
      var entry = createElement('span', 'entry ' +  parts[1], parts[0]);
      legend.appendChild(entry);
    });
    this.el.appendChild(legend);
  }

  Calendar.prototype.nextMonth = function() {
    this.current.add(1, 'months');
    this.next = true;
    this.draw();
  }

  Calendar.prototype.prevMonth = function() {
    this.current.subtract(1, 'months');
    this.next = false;
    this.draw();
  }

  window.Calendar = Calendar;

  function createElement(tagName, className, innerText) {
    var ele = document.createElement(tagName);
    if(className) {
      ele.className = className;
    }
    if(innerText) {
      ele.innerText = ele.textContent = innerText;
    }
    return ele;
  }
}();

!function() {
  var data = [
    { eventName: 'Classes Resume', calendar: 'School', color: 'orange', d: '2021-09-07', t: '', loc: 'N/A', descr: 'None.'},
    { eventName: 'ALLES! CTF 2021', calendar: 'CTF', color: 'green', d: '2021-09-03', t: '16:00', loc: 'Online', descr: 'None.'},
    { eventName: 'What is 5G? And the security behind it', color: 'blue', calendar: 'Event', d: '2021-09-16', t: '17:30', loc: 'Discord Server', descr: 'None.'},
    { eventName: 'Sunshine CTF 2021', color: 'green', calendar: 'CTF', d: '2021-09-18', t: '10:00', loc: 'Online', descr: 'None.'},
    { eventName: 'Accenture Information Session', color: 'blue', calendar: 'Event', d: '2021-09-30', t: '1:30', loc: 'Online', descr: 'See discord for info.'},
    { eventName: 'Thanksgiving Holiday', color: 'orange', calendar: 'School', d: '2021-10-11', t: 'all day', loc: 'Online', descr: 'NA'}
  ];

  function addDate(ev) {
    
  }

  var calendar = new Calendar('#calendar', data);
  const today = new Date();
  const filterByToday = arr => arr.filter(({ d }) => new Date(d.replace(/-/g, "/")) >= today);
  calendar.renderEvents(filterByToday(data) , "all");
}();

