import { templates, select } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking{
  constructor(element){
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
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