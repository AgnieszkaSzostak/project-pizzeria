import {templates, select, classNames} from '../settings.js'; 

class Home{
  constructor(element){
    const thisHome = this;
    console.log('thisHome', thisHome);
    thisHome.render(element);
    thisHome.initLinks();
    thisHome.initCarousel();
  }

  render(element){
    const thisHome = this;
    const generatedHTML = templates.home();
    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;
  }
  
  activatePage(pageId){
    const thisHome = this;

    thisHome.pages = document.querySelector(select.containerOf.pages).children;
    thisHome.navLinks = document.querySelectorAll(select.nav.links);

    for(let page of thisHome.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId );
    }
    for(let link of thisHome.navLinks){
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
    }

  }
  initLinks(){
    const thisHome = this;
    
    thisHome.links = document.querySelectorAll('.link');

    for(let link of thisHome.links){
      link.addEventListener('click', function(event){
        event.preventDefault;

        const clickedLink = this;
        const id = clickedLink.getAttribute('href').replace('#', '');

        thisHome.activatePage(id);
      });
    }
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
