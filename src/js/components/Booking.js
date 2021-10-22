import { templates, select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking{
  constructor(element){
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
  }
  render(element){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    console.log('generatedHTML', generatedHTML);
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    console.log('thisBooking.dom.wrapper', thisBooking.dom.wrapper);
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
  }
  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.peopleAmountWidget.addEventListener('updated',function(){});
    thisBooking.hoursAmountWidget.addEventListener('updated',function(){});
  }
}
export default Booking;