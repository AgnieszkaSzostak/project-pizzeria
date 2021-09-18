/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };
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

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }
    initAccordion() {
      const thisProduct = this;
      thisProduct.accordionTrigger.addEventListener('click', function(event){
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
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }
    processOrder(){
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      //set price do default price 
      let price = thisProduct.data.price;
      //for every category (param)...
      for(let paramId in thisProduct.data.params) {
        //determine param value, e.g. paramID = 'toppings', param = {label: 'Toppings', type: chechboxes'...}
        const param = thisProduct.data.params[paramId];
        //for every option in this category
        for(let optionId in param.options) {
          //determine option value, e.g. optionId = 'olives', option = {label: 'Olives', price: 2, default: true}
          const option  = param.options[optionId];
          // verify if option is checked 
          // console.log('formData.hasOwnProperty(paramId)', formData.hasOwnProperty(paramId));
          //if checked option isn't default option - increase the price
          if(formData[paramId].includes(optionId) && !option.hasOwnProperty('default')) {
            price = price + option['price'];
          } //if default option isn't checked - lower the price
          if(!formData[paramId].includes(optionId) && option.hasOwnProperty('default')){
            price = price - option['price'];
          }
          if(formData[paramId].includes(optionId)) {
            const ingridientImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
            if(ingridientImage)
              ingridientImage.classList.add(classNames.menuProduct.imageVisible);
          }    
          if(!formData[paramId].includes(optionId)) {
            const ingridientImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
            if(ingridientImage !== null)
              ingridientImage.classList.remove(classNames.menuProduct.imageVisible);
          }    
        }
      }
      //update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    }
    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      
    }
  }

  class AmountWidget {
    constructor(element){
      const thisWidget = this;
     
      console.log('AmoutWidget', thisWidget);
      console.log('constructor arguments', element);
      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      
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
      if(newValue !== thisWidget && !isNaN(newValue)){ 
        thisWidget.value = newValue;
      }
      thisWidget.input.value = thisWidget.value;
    }
    initActions(){
      const thisWidget = this; 
      console.log('thisWidget.input.value', thisWidget.input.value);
      thisWidget.input.addEventListener('change', thisWidget.setValue(thisWidget.input.value));
      thisWidget.linkDecrease.addEventListener('click', function(event){ event.preventDefault();},  thisWidget.setValue(thisWidget.value - 1));
      thisWidget.linkIncrease.addEventListener('click', function(event){ event.preventDefault();},  thisWidget.setValue(thisWidget.value + 1));

    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    
    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
