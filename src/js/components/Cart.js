import {settings, select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import CartProduct from './CartProduct.js';

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
    thisCart.dom.productList = document.querySelector(select.cart.productList); 
    thisCart.dom.deliveryFee = document.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = document.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = document.querySelectorAll(select.cart.totalPrice); 
    thisCart.dom.totalNumber = document.querySelector(select.cart.totalNumber);
    thisCart.dom.form = document.querySelector(select.cart.form);
    thisCart.dom.address = document.querySelector(select.cart.address);
    thisCart.dom.phone = document.querySelector(select.cart.phone);
  }
  initActions(){
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function() 
    {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(event){
      const toRemove = event.detail.cartProduct.dom.wrapper;
      toRemove.remove();

      const indexOfRemoved = thisCart.products.indexOf(event.detail.cartProduct);
      console.log('indexOfRemoved', indexOfRemoved);
      console.log('thisCart.products', thisCart.products);
      thisCart.products.splice(indexOfRemoved, 1);
      console.log('thisCart.products', thisCart.products);
      thisCart.update();
    });
    thisCart.dom.form.addEventListener('submit', function(event){ 
      event.preventDefault();
      thisCart.sendOrder();
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
    let totalNumber = 0; 
    let subtotalPrice = 0; 
    for(let product of thisCart.products){
      totalNumber = totalNumber + product.amountWidget.value;
      subtotalPrice = subtotalPrice + product.priceSingle * product.amountWidget.value;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      thisCart.dom.totalNumber.innerHTML = totalNumber;
    }
    if(thisCart.products.length ==0) 
    {
      thisCart.totalPrice = 0;  
      thisCart.subtotalPrice = 0;
      thisCart.totalNumber = 0;
      thisCart.deliveryFee = 0;
      thisCart.dom.totalNumber.innerHTML = 0; 
      thisCart.dom.subtotalPrice.innerHTML = 0;
      thisCart.dom.deliveryFee.innerHTML = 0;
      thisCart.dom.totalPrice.forEach(element => element.innerHTML = 0);
    }
    else
    {
      thisCart.totalPrice = subtotalPrice + deliveryFee;
      thisCart.subtotalPrice = subtotalPrice;
      thisCart.totalNumber = totalNumber;
      thisCart.deliveryFee = deliveryFee;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.totalPrice.forEach(element => element.innerHTML = thisCart.totalPrice);
    }
  }
  sendOrder() {
    const thisCart = this;
    // eslint-disable-next-line no-unused-vars
    const url = settings.db.url + '/' + settings.db.orders;
    
    const payload =  
    {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: []
    };

    
    for(let prod of thisCart.products){
      payload.products.push(prod.getData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    
    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
  }
}
export default Cart;