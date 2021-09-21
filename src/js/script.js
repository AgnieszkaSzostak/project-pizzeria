/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';
  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
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
        input: 'input.amount', 
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
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
      /* multiply price by amount */
      price *= thisProduct.amountWidget.value;
      //update calculated price in the HTML
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
      console.log('app', app);
      app.cart.add(thisProduct.prepareCartProduct());
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
      console.log('productSummary', productSummary);
      return productSummary;

    } 
    prepareCartProductParams(){
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      console.log('formData in prepareCart', formData);
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
      console.log('checkedParams', checkedParams);
      return checkedParams;
    } 
  }
  

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
      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }
  class Cart {
    constructor(element){
      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      console.log('new Cart', thisCart);
      thisCart.initActions();
    }
    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = document.querySelector(select.cart.productList); // 
    }
    initActions(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function() 
      {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }
    add(menuProduct) {
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(generatedDOM);
      thisCart.products.push(menuProduct);
      console.log('thisCart.products', thisCart.products);
    }
  }
  // class CartProduct {
  //   constructor(menuProduct, element){
  //     const thisCartProduct = this;



  //   }
  // }
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
    initCart: function(){
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
  };

  app.init();
  app.initCart();
}
