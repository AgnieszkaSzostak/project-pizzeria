import {settings, select} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{
  constructor(element){
    super(element, settings.amountWidget.defaultValue);

    const thisWidget = this;
  
    thisWidget.getElements(element);
    thisWidget.initActions(element);
    
    console.log('AmountWidget', thisWidget);
  }
  getElements(){
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }
  renderValue(){
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  isValid(value){
    return !isNaN(value)
    && value <= settings.amountWidget.defaultMax +1 
    && value >= settings.amountWidget.defaultMin -1;
  }

  initActions(){
    const thisWidget = this;
    thisWidget.dom.input.addEventListener('change', function(){
      thisWidget.setValue(thisWidget.dom.input.value); 
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function(){
      thisWidget.setValue(thisWidget.value - 1);
      thisWidget.preventDefault;
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function(){
      thisWidget.setValue(thisWidget.value + 1);
      thisWidget.preventDefault;
    });
  }
 
}
export default AmountWidget;