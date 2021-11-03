import {templates} from '../settings.js';

class Home{
  constructor(element){
    const thisHome = this;
    console.log('thisHome', thisHome);
    thisHome.render(element);
  }

  render(element){
    const thisHome = this;
    const generatedHTML = templates.home();
    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;
  }
}

export default Home;
