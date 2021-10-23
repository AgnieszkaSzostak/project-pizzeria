import {select, templates, classNames} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product{
  constructor(id, data){
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    thisProduct.prepareCartProductParams();
      
  }
  renderInMenu(){
    const thisProduct = this;
    const generatedHTML = templates.menuProduct(thisProduct.data);
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    const menuContainer = document.querySelector(select.containerOf.menu);
    menuContainer.appendChild(thisProduct.element);
  }
  getElements(){
    const thisProduct = this;
    thisProduct.dom = {};
    thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
    thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    
  }
  initAccordion() {
    const thisProduct = this;
    thisProduct.dom.accordionTrigger.addEventListener('click', function(event){
      event.preventDefault();
      const activeProduct =  document.querySelector(select.all.menuProductsActive);
      if(activeProduct && activeProduct !== thisProduct.element) {
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      }
      else {
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      }
    });
  }
  initOrderForm(){
    const thisProduct = this;
    thisProduct.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
      
    for(let input of thisProduct.dom.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
      
    thisProduct.dom.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }
  processOrder(){
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    let price = thisProduct.data.price;
    for(let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      for(let optionId in param.options) {
        const option  = param.options[optionId];
        if(formData[paramId].includes(optionId) && !option.hasOwnProperty('default')) {
          price = price + option['price'];
        } 
        if(!formData[paramId].includes(optionId) && option.hasOwnProperty('default')){
          price = price - option['price'];
        }
        if(formData[paramId].includes(optionId)) {
          const ingridientImage = thisProduct.dom.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          if(ingridientImage)
            ingridientImage.classList.add(classNames.menuProduct.imageVisible);
        }    
        if(!formData[paramId].includes(optionId)) {
          const ingridientImage = thisProduct.dom.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          if(ingridientImage !== null)
            ingridientImage.classList.remove(classNames.menuProduct.imageVisible);
        }    
      }
    }
    price *= thisProduct.amountWidget.value;
    thisProduct.priceSingle = price / thisProduct.amountWidget.value;
    thisProduct.dom.priceElem.innerHTML = price;
  }
  initAmountWidget(){
    const thisProduct = this;
      
    thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
    thisProduct.dom.amountWidgetElem.addEventListener('updated', function() {thisProduct.processOrder();});
      
  }
  addToCart(){
    const thisProduct = this;
    // app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);
  }
  prepareCartProduct() {
    const thisProduct = this;
    const productSummary = 
      {
        name: thisProduct.data.name,
        id: thisProduct.id,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.dom.priceElem.innerHTML,
      };
    productSummary.params = thisProduct.prepareCartProductParams();
    return productSummary;

  } 
  prepareCartProductParams(){
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    const checkedParams = {};
    for(let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      checkedParams[paramId] = {
        label: param.label,
        options: {}
      };
      for(let optionId in param.options) {
        const option  = param.options[optionId];
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
        if(optionSelected){
          checkedParams[paramId].options[optionId] = option.label;
        }
      }
    }
    return checkedParams;
  } 
}
export default Product;