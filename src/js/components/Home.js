import {templates} from '../settings.js';


class Home{
  constructor(element){
    const thisHome = this;
    console.log('thisHome', thisHome);
    thisHome.render(element);
    thisHome.initCarousel();
  }

  render(element){
    const thisHome = this;
    const generatedHTML = templates.home();
    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;
  }

  initCarousel(){
    const thisHome = this;
    
    // eslint-disable-next-line no-undef
    thisHome.flickity = new Flickity('.main-carousel', {
      // options
      cellAlign: 'left',
      contain: true,
      wrapAround: true,
      autoPlay: 3000,
      prevNextButtons: false
    });
  }
}

export default Home;
