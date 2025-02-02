export const listenForPrevBtnClick = (btn, embla, autoplay) => {
    const scrollPrev = () => {
        autoplay.reset();
        embla.scrollPrev();
    };
    btn.addEventListener("click", scrollPrev, false);
};

export const listenForNextBtnClick = (btn, embla, autoplay) => {
    const scrollNext = () => {
        autoplay.reset();
        embla.scrollNext();
    };
    btn.addEventListener("click", scrollNext, false);
};

export const disablePrevNextBtns = (prevBtn, nextBtn, embla) => {
    return () => {
        if (embla.canScrollPrev()) prevBtn.removeAttribute("disabled");
        else prevBtn.setAttribute("disabled", "disabled");

        if (embla.canScrollNext()) nextBtn.removeAttribute("disabled");
        else nextBtn.setAttribute("disabled", "disabled");
    };
};

import EmblaCarousel from "./embla-carousel/index.js";
import Autoplay from "./embla-carousel-autoplay/index.js";

const wrap = document.querySelector(".embla");
const viewPort = wrap.querySelector(".embla__viewport");
const prevBtn = wrap.querySelector(".embla__button--prev");
const nextBtn = wrap.querySelector(".embla__button--next");

const autoplay = Autoplay(
  { delay: 5000, stopOnInteraction: false, loop: true },
  (emblaRoot) => emblaRoot.parentElement
);
const embla = EmblaCarousel(viewPort, { loop: true}, [autoplay]);
const disablePrevAndNextBtns = disablePrevNextBtns(prevBtn, nextBtn, embla);

listenForPrevBtnClick(prevBtn, embla, autoplay);
listenForNextBtnClick(nextBtn, embla, autoplay);

embla.on("init", disablePrevAndNextBtns);
embla.on("select", disablePrevAndNextBtns);

//Start of Google Calendar Codes

const renderList = (data, settings) => {
    var result = [];

    //Remove cancelled events, sort by date
    result = data.items.filter(item => item && item.hasOwnProperty('status') && item.status !== 'cancelled').sort(comp).reverse();

    var pastCounter = 0,
        upcomingCounter = 0,
        pastResult = [],
        upcomingResult = [],
        upcomingResultTemp = [],
        upcomingElem = document.querySelector(settings.upcomingSelector),
        pastElem = document.querySelector(settings.pastSelector),
        i;

    if (settings.pastTopN === -1) {
        settings.pastTopN = result.length;
    }

    if (settings.upcomingTopN === -1) {
        settings.upcomingTopN = result.length;
    }

    if (settings.past === false) {
        settings.pastTopN = 0;
    }

    if (settings.upcoming === false) {
        settings.upcomingTopN = 0;
    }

    for (i in result) {

        if (isPast(result[i].end.dateTime || result[i].end.date)) {
            if (pastCounter < settings.pastTopN) {
                pastResult.push(result[i]);
                pastCounter++;
            }
        } else {
            upcomingResultTemp.push(result[i]);
        }
    }

    upcomingResultTemp.reverse();

    for (i in upcomingResultTemp) {
        if (upcomingCounter < settings.upcomingTopN) {
            upcomingResult.push(upcomingResultTemp[i]);
            upcomingCounter++;
        }
    }

    for (i in pastResult) {
        pastElem.insertAdjacentHTML('beforeend', transformationList(pastResult[i], settings.itemsTagName, settings.format));
    }

    for (i in upcomingResult) {
        upcomingElem.insertAdjacentHTML('beforeend', transformationList(upcomingResult[i], settings.itemsTagName, settings.format));
    }

    if (upcomingElem.firstChild) {
        upcomingElem.insertAdjacentHTML('beforebegin', settings.upcomingHeading);
    }

    if (pastElem.firstChild) {
        pastElem.insertAdjacentHTML('beforebegin', settings.pastHeading);
    }
};

//Gets JSON from Google Calendar and transfroms it into html list items and appends it to past or upcoming events list
const retrieveGoogleCalendarEvents = (settings) => {
    var finalURL = settings.calendarUrl;

    if (settings.recurringEvents) {
        finalURL = finalURL.concat('&singleEvents=true&orderBy=starttime');
    }

    if (settings.timeMin) {
        finalURL = finalURL.concat('&timeMin=' + settings.timeMin);
    };
    
    if (settings.timeMax) {
        finalURL = finalURL.concat('&timeMax=' + settings.timeMax);
    };

    //Get JSON, parse it, transform into list items and append it to past or upcoming events list
    var request = new XMLHttpRequest();
    request.open('GET', finalURL, true);
    
    request.onload = () => {
        if (request.status >= 200 && request.status < 400) {
            var data = JSON.parse(request.responseText);
            renderList(data, settings);
        } else {
            console.error('err');
        }
    };
    
    request.onerror = () => {
        console.error('err');
    };
    
    request.send();
};

//Overwrites defaultSettings values with overrideSettings and adds overrideSettings if non existent in defaultSettings
const mergeOptions = (defaultSettings, overrideSettings) => {
    var newObject = {},
        i;
    for (i in defaultSettings) {
        newObject[i] = defaultSettings[i];
    }
    for (i in overrideSettings) {
        newObject[i] = overrideSettings[i];
    }
    return newObject;
};

const isAllDay = (dateStart, dateEnd) => {
    var dateEndTemp = subtractOneDay(dateEnd);
    var isAll = true;
    
    for (var i = 0; i < 3; i++) {
        if (dateStart[i] !== dateEndTemp[i]) {
            isAll = false;
        }
    } 

    return isAll;
};

const isSameDay = (dateStart, dateEnd) => {
    var isSame = true;

    for (var i = 0; i < 3; i++) {
        if (dateStart[i] !== dateEnd[i]) {
            isSame = false;
        }
    } 

    return isSame;
}

//Get all necessary data (dates, location, summary, description) and creates a list item
const transformationList = (result, tagName, format) => {
    var dateStart = getDateInfo(result.start.dateTime || result.start.date),
        dateEnd = getDateInfo(result.end.dateTime || result.end.date),
        dayNames = dayNames,
        moreDaysEvent = true,
        isAllDayEvent = isAllDay(dateStart, dateEnd);

    if (typeof result.end.date !== 'undefined') {
        dateEnd = subtractOneDay(dateEnd);
    }

    if (isSameDay(dateStart, dateEnd)) {
        moreDaysEvent = false;
    }

    var dateFormatted = getFormattedDate(dateStart, dateEnd, dayNames, moreDaysEvent, isAllDayEvent),
        output = '<' + tagName + '>',
        summary = result.summary || '',
        description = result.description || '',
        location = result.location || '',
        i;

    for (i = 0; i < format.length; i++) {
        format[i] = format[i].toString();

        if (format[i] === '*summary*') {
            output = output.concat(`<span class="summary">${summary}</span>`);
        } else if (format[i] === '*date*') {
            output = output.concat(`<span class="date">${dateFormatted}</span>`);
        } else if (format[i] === '*description*') {
            output = output.concat(`<span class="description">${description}</span>`);
        } else if (format[i] === '*location*') {
            output = output.concat(`<span class="location">${location}</span>`);
        } else {
            if ((format[i + 1] === '*location*' && location !== '') ||
                (format[i + 1] === '*summary*' && summary !== '') ||
                (format[i + 1] === '*date*' && dateFormatted !== '') ||
                (format[i + 1] === '*description*' && description !== '')) {

                output = output.concat(format[i]);
            }
        }
    }

    return output + '</' + tagName + '>';
};

//Check if date is later then now
const isPast = date => {
    var compareDate = new Date(date),
        now = new Date();

    if (now.getTime() > compareDate.getTime()) {
        return true;
    }

    return false;
};

//Get temp array with information abou day in followin format: [day number, month number, year, hours, minutes]
const getDateInfo = date => {
    date = new Date(date);
    return [date.getDate(), date.getMonth(), date.getFullYear(), date.getHours(), date.getMinutes(), 0, 0];
};

//Get month name according to index
const getMonthName = month => {
    var monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return monthNames[month];
};

const getDayName = day => {
    var dayNames = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];

    return dayNames[day];
};

const getDayOfWeekName = incoming_date => {
    return Intl.DateTimeFormat('en-US', {weekday: 'long'}).format(incoming_date);
}

const calculateDate = (dateInfo, amount) => {
    var date = getDateFormatted(dateInfo);
    date.setTime(date.getTime() + amount);
    return getDateInfo(date);
};

const getDayNameFormatted = dateFormatted => getDayName(getDateFormatted(dateFormatted).getDay()) + ' ';

const getDateFormatted = dateInfo => new Date(dateInfo[2], dateInfo[1], dateInfo[0], dateInfo[3], dateInfo[4] + 0, 0);

//Compare dates
const comp = (a, b) => new Date(a.start.dateTime || a.start.date).getTime() - new Date(b.start.dateTime || b.start.date).getTime();  

//Add one day
const addOneDay = (dateInfo) => calculateDate(dateInfo, 86400000);

//Subtract one day
const subtractOneDay = (dateInfo) => calculateDate(dateInfo, -86400000);

//Subtract one minute
const subtractOneMinute = (dateInfo) => calculateDate(dateInfo, -60000);


//Transformations for formatting date into human readable format
const formatDateSameDay = (dateStart, dateEnd, dayNames, moreDaysEvent, isAllDayEvent) => {
    var formattedTime = '',
        dayNameStart = '';

    if (dayNames) {
        dayNameStart = getDayNameFormatted(dateStart);
    }

    if (!moreDaysEvent && !isAllDayEvent) {
        formattedTime = ' from ' + getFormattedTime(dateStart) + ' - ' + getFormattedTime(dateEnd);
    }

    //month day, year time-time
    return dayNameStart + getMonthName(dateStart[1]) + ' ' + dateStart[0] + ', ' + dateStart[2] + formattedTime;
};

const formatDateOneDay = (dateStart, dayNames) => {
    var dayName = '';

    if (dayNames) {
    dayName = getDayNameFormatted(dateStart);
    }
    //month day, year
    return dayName + getMonthName(dateStart[1]) + ' ' + dateStart[0] + ', ' + dateStart[2];
};

const formatDateDifferentDay = (dateStart, dateEnd, dayNames) => {
    var dayNameStart = '',
        dayNameEnd = '';

    if (dayNames) {
    dayNameStart = getDayNameFormatted(dateStart);
    dayNameEnd = getDayNameFormatted(dateEnd);
    }
    //month day-day, year
    return dayNameStart + getMonthName(dateStart[1]) + ' ' + dateStart[0] + '-' + dayNameEnd + dateEnd[0] + ', ' + dateStart[2];
};

const formatDateDifferentMonth = (dateStart, dateEnd, dayNames) => {
    var dayNameStart = '',
        dayNameEnd = '';

    if (dayNames) {
    dayNameStart = getDayNameFormatted(dateStart);
    dayNameEnd = getDayNameFormatted(dateEnd);
    }
    //month day - month day, year
    return dayNameStart + getMonthName(dateStart[1]) + ' ' + dateStart[0] + '-' + dayNameEnd + getMonthName(dateEnd[1]) + ' ' + dateEnd[0] + ', ' + dateStart[2];
};

const formatDateDifferentYear = (dateStart, dateEnd, dayNames) => {
    var dayNameStart = '',
        dayNameEnd = '';

    if (dayNames) {
    dayNameStart = getDayNameFormatted(dateStart);
    dayNameEnd = getDayNameFormatted(dateEnd);
    }
    //month day, year - month day, year
    return dayNameStart + getMonthName(dateStart[1]) + ' ' + dateStart[0] + ', ' + dateStart[2] + '-' + dayNameEnd + getMonthName(dateEnd[1]) + ' ' + dateEnd[0] + ', ' + dateEnd[2];
};

//Check differences between dates and format them
const getFormattedDate = (dateStart, dateEnd, dayNames, moreDaysEvent, isAllDayEvent) => {
    var formattedDate = '';

    if (dateStart[0] === dateEnd[0]) {
        if (dateStart[1] === dateEnd[1]) {
            if (dateStart[2] === dateEnd[2]) {
                //month day, year
                formattedDate = formatDateSameDay(dateStart, dateEnd, dayNames, moreDaysEvent, isAllDayEvent);
            } else {
                //month day, year - month day, year
                formattedDate = formatDateDifferentYear(dateStart, dateEnd, dayNames);
            }
        } else {
            if (dateStart[2] === dateEnd[2]) {
                //month day - month day, year
                formattedDate = formatDateDifferentMonth(dateStart, dateEnd, dayNames);
            } else {
                //month day, year - month day, year
                formattedDate = formatDateDifferentYear(dateStart, dateEnd, dayNames);
            }
        }
    } else {
        if (dateStart[1] === dateEnd[1]) {
            if (dateStart[2] === dateEnd[2]) {
                //month day-day, year
                formattedDate = formatDateDifferentDay(dateStart, dateEnd, dayNames);
            } else {
                //month day, year - month day, year
                formattedDate = formatDateDifferentYear(dateStart, dateEnd, dayNames);
            }
        } else {
            if (dateStart[2] === dateEnd[2]) {
                //month day - month day, year
                formattedDate = formatDateDifferentMonth(dateStart, dateEnd, dayNames);
            } else {
                //month day, year - month day, year
                formattedDate = formatDateDifferentYear(dateStart, dateEnd, dayNames);
            }
        }
    }

    return formattedDate;
};

const getFormattedTime = (date) => {
    var formattedTime = '',
        period = 'AM',
        hour = date[3],
        minute = date[4];

    // Handle afternoon.
    if (hour >= 12) {
        period = 'PM';

        if (hour >= 13) {
            hour -= 12;
        }
    }

    // Handle midnight.
    if (hour === 0) {
        hour = 12;
    }

    // Ensure 2-digit minute value.
    minute = (minute < 10 ? '0' : '') + minute;

    // Format time.
    formattedTime = hour + ':' + minute + period;
    return formattedTime;
};

var api_key='YOUR_KEY_HERE';
var calendar_id='YOUR_CALENDAR_ID_HERE';
var currentDate = new Date();
let thirty_days_ago = new Date();
thirty_days_ago.setDate(thirty_days_ago.getDate() - 30);
let thirty_days_ahead = new Date();
thirty_days_ahead.setDate(thirty_days_ahead.getDate() + 30);
var settings = {
    calendarUrl: 'https://www.googleapis.com/calendar/v3/calendars/'+calendar_id+'/events?key='+api_key+'',
    past: true,
    upcoming: true,
    sameDayTimes: true,
    dayNames: true,
    pastTopN: 0,
    upcomingTopN: 5,
    recurringEvents: true,
    itemsTagName: 'li',
    upcomingSelector: '#events-upcoming',
    pastSelector: '#events-past',
    upcomingHeading: '<h2 class=\'font-bold\'>Upcoming events</h2>',
    pastHeading: '<h2>Past events</h2>',
    format: ['*date*', ': ', '*summary*', ' &mdash; ', '*description*', ' in ', '*location*'],
    timeMin: thirty_days_ago.toISOString(),
    timeMax: thirty_days_ahead.toISOString()
};

//settings = mergeOptions(settings, settingsOverride);

retrieveGoogleCalendarEvents(settings);

//End of Google Calendar Codes