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
      console.log('thisProduct', thisProduct);
      thisProduct.renderInMenu();
      console.log('new Product:', thisProduct);
      thisProduct.initAccordion();
    }
    renderInMenu(){
      // eslint-disable-next-line no-unused-vars
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* create element using utils.createElementsFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }
    initAccordion() {

      // eslint-disable-next-line no-unused-vars
      const thisProduct = this;
      /* find the clickable trigger (the element that should react to clicking) */
      // eslint-disable-next-line no-unused-vars
      const clickableTrigger = document.querySelectorAll(select.menuProduct.clickable);
      console.log('clickableTrigger', clickableTrigger);
      clickableTrigger.addEventListener('click', function(event){
        event.preventDefault();
        const activeProduct =  document.querySelector(classNames.menuProduct.wrapperActive);
        if(activeProduct && activeProduct !== thisProduct.element) {
          activeProduct.classList.remove('active');
          thisProduct.element.classList.toggle('active');
        }
      });
    }
  }
  const app = {
    initMenu: function(){
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);
      
      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
        console.log('productData:', productData);
        console.log('thisApp.data.products[productData]', thisApp.data.products[productData]);
      }
      console.log('thisApp.data.products:', thisApp.data.products);
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
