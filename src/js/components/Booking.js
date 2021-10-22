import { templates } from '../settings.js';
import { utils } from '../utils.js';

class Booking{
  constructor(element){
    const thisBooking = this;
    thisBooking.render(element);
    // thisBooking.initWidgets();
  }
  render(elem){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    console.log('generatedHTML', generatedHTML);
    thisBooking.dom = {};
    thisBooking.dom.wrapper = elem;
    console.log('thisBooking.dom.wrapper', thisBooking.dom.wrapper);
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

  }
}
export default Booking;