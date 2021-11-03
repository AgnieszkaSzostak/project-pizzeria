import { templates, select, settings, classNames } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import {utils} from '../utils.js';

class Booking{
  constructor(element){
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.initActions();
  }
  getData(){
    const thisBooking = this;
    
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.dateWidget.minDate); 
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.dateWidget.maxDate);
    
    const params = {
      bookings: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    const  urls = {
      booking:       settings.db.url + '/' + settings.db.booking 
                                     + '?' + params.bookings.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event   
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event   
                                     + '?' + params.eventsRepeat.join('&'),
    };
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ]).then(function(allResponses){
      const bookingsResponse = allResponses[0];
      const eventsCurrentResponse = allResponses[1];
      const eventsRepeatResponse = allResponses[2];
      return Promise.all([
        bookingsResponse.json(),
        eventsCurrentResponse.json(),
        eventsRepeatResponse.json(),
      ]);
      
    }).then(function([bookings, eventsCurrent, eventsRepeat]){
      thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
    });
  }
  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.dateWidget.minDate;
    const maxDate = thisBooking.dateWidget.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    thisBooking.updateDOM();
  }  
  makeBooked(date, hour, duration, table){
    const thisBooking = this;
      
    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);
      
    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
  
      thisBooking.booked[date][hourBlock].push(table);
    }
    thisBooking.updateDOM();
  }
  
  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.dateWidget.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourWidget.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }
      if(
        !allAvailable
        && 
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }
  render(element){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.dateWrapper = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourWrapper = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.tablesWrapper = thisBooking.dom.wrapper.querySelector(select.containerOf.tables);
    thisBooking.peopleAmount = thisBooking.dom.peopleAmount.querySelector(select.widgets.amount.input);
    thisBooking.dom.addressInput = thisBooking.dom.wrapper.querySelector(select.cart.address);
    thisBooking.dom.phoneInput = thisBooking.dom.wrapper.querySelector(select.cart.phone);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll('[name="starter"]');
    thisBooking.dom.bookingForm = thisBooking.dom.wrapper.querySelector('.booking-form');
  }
  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated',function(event){
      event.preventDefault();
    });
    thisBooking.dom.hoursAmount.addEventListener('updated',function(event){
      event.preventDefault();
    });
    thisBooking.dateWidget = new DatePicker(thisBooking.dom.dateWrapper);
    thisBooking.hourWidget = new HourPicker(thisBooking.dom.hourWrapper);

    thisBooking.dom.wrapper.addEventListener('updated', function(event){
      event.preventDefault();
      thisBooking.updateDOM();
      
      if(thisBooking.pickedTableId !== null){
        thisBooking.selectedTable.classList.remove(classNames.table.selected);
        thisBooking.pickedTableId = null;
      }
    });
  }
  initActions(){
    const thisBooking = this;
    thisBooking.pickedTableId = null;
    thisBooking.dom.tablesWrapper.addEventListener('click', function(event){
      event.preventDefault();
      thisBooking.updateDOM();
      thisBooking.selectedTable = event.target;
      
      const tableId = thisBooking.selectedTable.getAttribute('data-table');
      const isItTable = thisBooking.selectedTable.classList.contains('table');
      const isTableBooked = thisBooking.selectedTable.classList.contains('booked');
      const isTableSelected = thisBooking.selectedTable.classList.contains(classNames.table.selected);
      const tableToVacate = document.querySelector('.selected');

      if(isItTable
        &&
        !isTableBooked
      ){
        if(isTableSelected){
          thisBooking.selectedTable.classList.remove(classNames.table.selected);
          thisBooking.pickedTableId = null;
        } else {
          if (thisBooking.pickedTableId != null)
          {
            tableToVacate.classList.remove(classNames.table.selected);
            thisBooking.selectedTable.classList.add(classNames.table.selected);
            thisBooking.pickedTableId = tableId;
          } else {
            thisBooking.selectedTable.classList.add(classNames.table.selected);
            thisBooking.pickedTableId = tableId;
          }
        }
      } else if(
        isItTable
        &&
        isTableBooked
      ){
        alert('Table is not available');
      }
    });

    thisBooking.dom.bookingForm.addEventListener('submit', function(event){ 
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }
  sendBooking(){
    const thisBooking = this;

    // eslint-disable-next-line no-unused-vars
    const url = settings.db.url + '/' + settings.db.booking;
    
    // eslint-disable-next-line no-unused-vars
   
    const payload = {
      date: thisBooking.dateWidget.correctValue,
      hour: thisBooking.hourWidget.correctValue, 
      table: parseInt(thisBooking.pickedTableId),
      duration: parseInt(thisBooking.hoursAmountWidget.correctValue),
      ppl: parseInt(thisBooking.peopleAmount.value),
      starters: [],
      phone: thisBooking.dom.phoneInput.value,
      address: thisBooking.dom.addressInput.value,
    };
   
    for(let starter of thisBooking.dom.starters){
      if (starter.checked == true){
        payload.starters.push(starter.value);
      }
    }
  
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    
    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
        thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
      });
    
  }
}
export default Booking;