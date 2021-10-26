import { templates, select, settings } from '../settings.js';
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
  }
  getData(){
    const thisBooking = this;
    console.log('thisBooking', thisBooking);
    
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(new Date()); 
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(utils.addDays(utils.dateToStr(new Date()), settings.datePicker.maxDaysInFuture));
    
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

    console.log('getData params', params);

    const  urls = {
      bookings:       settings.db.url + '/' + settings.db.booking 
                                     + '?' + params.bookings.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event   
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event   
                                     + '?' + params.eventsRepeat.join('&'),
    };

    fetch(urls.bookings)
      .then(function(bookingsResponse){
        return bookingsResponse.json();
      })
      .then(function(bookings){
        console.log('bookings', bookings);
      });
    console.log('getData urls', urls);
  }
  render(element){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.dateWrapper = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourWrapper = document.querySelector(select.widgets.hourPicker.wrapper);
    
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

  }
}
export default Booking;