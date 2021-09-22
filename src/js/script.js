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
      thisCart.initActions();
    }
    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = document.querySelector(select.cart.productList); // 
      thisCart.dom.deliveryFee = document.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = document.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = document.querySelectorAll(select.cart.totalPrice); 
      thisCart.dom.totalNumber = document.querySelector(select.cart.totalNumber);
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
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      thisCart.update();
    }
    update() {
      const thisCart = this;
      const deliveryFee = settings.cart.defaultDeliveryFee;
      console.log('deliveryFee', deliveryFee);
      let totalNumber = 0; //const?
      console.log('totalNumber', totalNumber);
      let subtotalPrice = 0; //const?
      console.log('subtotalPrice', subtotalPrice);
      for(let product of thisCart.products){ // ??
        totalNumber = totalNumber + product.amount.value;
        subtotalPrice = subtotalPrice + product.priceSingle * product.amount.value;
        console.log('thisCart.product.price', product.price);
        thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
        thisCart.dom.totalNumber.innerHTML = totalNumber;
      
      }
      console.log('totalNumber', totalNumber);
      console.log('subtotalPrice', subtotalPrice);
     
      if(totalNumber == 0)
      {
        thisCart.totalPrice == 0; 
      }
      else
      {
        thisCart.totalPrice = subtotalPrice + deliveryFee;
        thisCart.dom.deliveryFee.innerHTML = deliveryFee;
        thisCart.dom.totalPrice.forEach(element =>element.innerHTML = thisCart.totalPrice);
      }
      
      console.log('thisCart.totalPrice', thisCart.totalPrice);
    }
  }
  class CartProduct {
    constructor(menuProduct, element){
      const thisCartProduct = this;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
    }
    getElements(element) {
      const thisCartProduct = this;
      thisCartProduct.dom = {
        wrapper: element,
        amountWidget: element.querySelector(select.cartProduct.amountWidget),
        price: element.querySelector(select.cartProduct.price),
        edit: element.querySelector(select.cartProduct.edit),
        remove: element.querySelector(select.cartProduct.remove),
      };
    }
    initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amount = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function()
      {
        // thisCartProduct.amount = ?? 
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount.value;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
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
    initCart: function(){
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
  };

  app.init();
  app.initCart();
}
