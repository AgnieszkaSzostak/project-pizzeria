import {settings, select} from '../settings.js';
class AmountWidget {
  constructor(element){
    const thisWidget = this;
    thisWidget.value = settings.amountWidget.defaultValue;
    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions(element);
  }
  getElements(element){
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }
  setValue(value){
    const thisWidget = this;

    const newValue = parseInt(value);

    /* To do: Add validation */
    if(thisWidget !== newValue && !isNaN(newValue) 
        && newValue <= settings.amountWidget.defaultMax +1 
        && newValue >= settings.amountWidget.defaultMin -1)
    { 
      thisWidget.value = newValue;
    }
    thisWidget.input.value = thisWidget.value;
    thisWidget.announce();
      
  }
  initActions(){
    const thisWidget = this;
    thisWidget.input.addEventListener('change', function(){thisWidget.setValue(thisWidget.input.value); });
    thisWidget.linkDecrease.addEventListener('click', function(){ thisWidget.setValue(thisWidget.value - 1);
      thisWidget.preventDefault;});
    thisWidget.linkIncrease.addEventListener('click', function(){ thisWidget.setValue(thisWidget.value + 1);
      thisWidget.preventDefault;});
  }
  announce(){
    const thisWidget = this;
    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }
}
export default AmountWidget;