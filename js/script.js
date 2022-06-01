'use strict';

window.addEventListener('DOMContentLoaded', () => {
  //tabs
  const tabs = document.querySelectorAll('.tabheader__item');
  const tabsContent = document.querySelectorAll('.tabcontent');
  const tabsParent = document.querySelector('.tabheader__items');

  function hideTabContent() {
    tabsContent.forEach(item => {
      item.classList.add('hide');
      item.classList.remove('show', 'fade');
    });

    tabs.forEach(item => {
      item.classList.remove('tabheader__item_active');
    });
  }

  function showTabContent(i = 0) {
    tabsContent[i].classList.add('show', 'fade');
    tabsContent[i].classList.remove('hide');
    tabs[i].classList.add('tabheader__item_active');
  }

  hideTabContent();
  showTabContent();

  tabsParent.addEventListener('click', (event) => {
    const target = event.target;

    if (target && target.classList.contains('tabheader__item')) {
      tabs.forEach((item, i) => {
        if (target === item) {
          hideTabContent();
          showTabContent(i);
        }
      });
    }
  });

  //Timer
  const deadline = '2022-05-14';

  //returns the time left object
  function getTimeRemaining(endtime) {
    const timerEndpoint = Date.parse(endtime);
    const timeNow = Date.now();
    const total = (timerEndpoint >= timeNow) ? timerEndpoint - timeNow : 0;
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const seconds = Math.floor((total / 1000) % 60);

    return {
      'total': total,
      'days': days,
      'hours': hours,
      'minutes': minutes,
      'seconds': seconds
    };
  }

  //adds 0 to a particular number
  function getZero(number) {
    if (number >= 0 && number < 10) {
      return `0${number}`;
    } else {
      return number;
    }
  }

  //parses clock on a page
  function setClock(selector, endtime) {
    const timer = document.querySelector(selector);
    const days = timer.querySelector('#days');
    const hours = timer.querySelector('#hours');
    const minutes = timer.querySelector('#minutes');
    const seconds = timer.querySelector('#seconds');
    const timeInterval = setInterval(updateClock, 1000);

    updateClock();

    //updates the clock according to an interval
    function updateClock() {
      const time = getTimeRemaining(endtime);

      days.innerHTML = getZero(time.days);
      hours.innerHTML = getZero(time.hours);
      minutes.innerHTML = getZero(time.minutes);
      seconds.innerHTML = getZero(time.seconds);

      if (time.total <= 0) {
        clearInterval(timeInterval);
      }
    }
  }

  setClock('.timer', deadline);

  //Modal window
  const modalButtons = document.querySelectorAll('[data-modal]');
  const modalWindow = document.querySelector('.modal');
  const modalTimerId = setTimeout(openModal, 15000);

  function openModal() {
    modalWindow.classList.add('show');
    modalWindow.classList.remove('hide');
    document.body.style.overflow = 'hidden';
    clearInterval(modalTimerId);
  }

  function closeModal() {
    modalWindow.classList.add('hide');
    modalWindow.classList.remove('show');
    document.body.style.overflow = '';
  }

  function showModalByScroll() {
    if (window.scrollY + document.documentElement.clientHeight >= 
        document.documentElement.scrollHeight) {
      openModal();
      window.removeEventListener('scroll', showModalByScroll);
    }
  }

  modalButtons.forEach(button => {
    button.addEventListener('click', openModal);
  });

  modalWindow.addEventListener('click', (event) => {
    if (event.target === modalWindow || event.target.getAttribute('data-close') == '') {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.code === 'Escape' && modalWindow.classList.contains('show')) {
      console.log('closed');
      closeModal();
    }
  });

  window.addEventListener('scroll', showModalByScroll);

  //Dinamic menu
  class MenuItem {
    constructor(imageUrl, alternative, subtitle, description, price, parent, ...classes) {
      this.imageUrl = imageUrl;
      this.alternative = alternative;
      this.subtitle = subtitle;
      this.description = description;
      this.price = price;
      this.transfer = 28;
      this.parent = document.querySelector(parent);
      this.classes = classes.length === 0 ? ['menu__item'] : classes;
      this.changeToUAH();
    }

    changeToUAH() {
      this.price *= this.transfer;
    }

    render() {
      const divMenuItem = document.createElement('div');
      
      this.classes.forEach(className => {
        divMenuItem.classList.add(className);
      });

      divMenuItem.innerHTML = `
                  <img src="${this.imageUrl}" alt=${this.alternative}>
                  <h3 class="menu__item-subtitle">${this.subtitle}</h3>
                  <div class="menu__item-descr">${this.description}</div>
                  <div class="menu__item-divider"></div>
                  <div class="menu__item-price">
                      <div class="menu__item-cost">Цена:</div>
                      <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
                  </div>`;
      this.parent.append(divMenuItem);
    }
  }

  const getResource = async (url) => {
    const result = await fetch(url);

    if (!result.ok) {
      throw new Error(`Could't fetch ${url}, status: ${result.status}`);
    }

    return await result.json();
  };

  getResource('http://localhost:3000/menu')
  .then(data => {
    data.forEach(({ img, altimg, title, descr, price }) => {
      new MenuItem(img, altimg, title, descr, price, '.menu__field .container').render();
    });
  });

  function fixMenuHeight() {
    document.querySelectorAll('.menu__item-descr').forEach(item => {
      item.classList.add('menu__item-height');
    });
  }

  fixMenuHeight();

  //Forms
  const forms = document.querySelectorAll('form');
  const message = {
    loading: 'icons/spinner.svg',
    succsess: 'We will call you soon',
    failure: 'Something went wrong'
  };

  forms.forEach(form => {
    bindPostData(form);
  });

  const postData = async (url, data) => {
    const result = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: data
    });

    return await result.json();
  };

  function bindPostData(form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const statusMessage = document.createElement('img');
      statusMessage.src = message.loading;
      statusMessage.style.cssText = `
        display: block;
        margin: 0 auto;
      `;
      statusMessage.textContent = message.loading;
      form.insertAdjacentElement('afterend', statusMessage);

      const formData = new FormData(form);
      
      const json = JSON.stringify(Object.fromEntries(formData.entries()));
      console.log(json);

      postData('http://localhost:3000/requests', json)
      .then(data => {
          console.log(data);
          showThanksModal(message.succsess);
          statusMessage.remove();
      }).catch(() => {
        showThanksModal(message.failure);
      }).finally(() => {
        form.reset();
      });
    });
  }

  function showThanksModal(message) {
    const prevModDialog = document.querySelector('.modal__dialog');

    prevModDialog.classList.add('hide');
    openModal();

    const thanksModal = document.createElement('div');
    thanksModal.classList.add('modal__dialog');
    thanksModal.innerHTML = `
      <div class="modal__content">
        <div class="modal__close" data-close>&times;</div>
        <div class="modal__title">${message}</div>
      </div>
    `;

    document.querySelector('.modal').append(thanksModal);
    setTimeout(() => {
      thanksModal.remove();
      prevModDialog.classList.add('show');
      prevModDialog.classList.remove('hide');
      closeModal();
    }, 4000);
  }

  //Slider

  class SliderItem {
    constructor(imageUrl, altimg, parent, ...classes) {
      this.imageUrl = imageUrl;
      this.altimg = altimg;
      this.parent = document.querySelector(parent);
      this.classes = classes.length === 0 ? ['offer__slide'] : classes;
    }

    render() {
      const divSliderItem = document.createElement('div');

      this.classes.forEach(classname => {
        divSliderItem.classList.add(classname);
      });

      divSliderItem.innerHTML = `
        <img src="${this.imageUrl}" alt=${this.altimg}>
      `;
      this.parent.append(divSliderItem);
    }
  }

  new SliderItem(
    'img/slider/pepper.jpg',
    'pepper',
    '.offer__slider-wrapper',
    'offer__slide',
    'hide'
  ).render();

  new SliderItem(
    'img/slider/food-12.jpg',
    'food',
    '.offer__slider-wrapper',
    'offer__slide',
    'hide'
  ).render();

  new SliderItem(
    'img/slider/olive-oil.jpg',
    'oil',
    '.offer__slider-wrapper',
    'offer__slide', 
    'hide'
  ).render();

  new SliderItem(
    'img/slider/paprika.jpg',
    'paprika',
    '.offer__slider-wrapper',
    'offer__slide', 
    'hide'
  ).render();

  function showSlider(element) {
    element.classList.add('show', 'fade');
    element.classList.remove('hide');
  }

  function hideSlider(element) {
    element.classList.add('hide');
    element.classList.remove('show', 'fade');
  }

  function changeCurrentsliderNumber(currentSlider, index) {
    currentSlider.textContent = getZero(index + 1);
  }

  function showSliders() {
    const sliders = document.querySelectorAll('.offer__slide');
    const prev = document.querySelector('.offer__slider-prev');
    const next = document.querySelector('.offer__slider-next');
    const currentSlider = document.querySelector('#current');
    const totalLength = sliders.length;
    document.querySelector('#total').textContent = getZero(totalLength);

    let index = 0;

    showSlider(sliders[index]);
    changeCurrentsliderNumber(currentSlider, index);

    next.addEventListener('click', () => {
      if (index === totalLength - 1) {
        hideSlider(sliders[index]);
        index = 0;
      } else {
        hideSlider(sliders[index++]);
      }

      showSlider(sliders[index]);
      changeCurrentsliderNumber(currentSlider, index);
    });

    prev.addEventListener('click', () => {
      if (index === 0) {
        hideSlider(sliders[index]);
        index = totalLength - 1;
      } else {
        hideSlider(sliders[index--]);
      }

      showSlider(sliders[index]);
      changeCurrentsliderNumber(currentSlider, index);
    });
  }

  showSliders();
});