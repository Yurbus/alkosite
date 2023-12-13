var sendURL = alco_ajax.ajax_url;

if ('ontouchstart' in window || (window.DocumentTouch && document instanceof DocumentTouch)) {
} else {
  document.body.classList.add('no-touch');
}

var inputsTel_1 = document.querySelector('.form-1 input[type="tel"]');
var inputsTel_2 = document.querySelector('.form-2 input[type="tel"]');
var inputsTel_3 = document.querySelector('.form-3 input[type="tel"]');

var countMasks = 0;

// Burger burger
let isMenuOpen = false;
const $btnBurger = document.querySelector('.burger');
const $mobileNav = document.querySelector('.nav-mobile');
const $site = document.querySelector('.site');

// forms
var form1 = document.querySelector('.form-1');
var form2 = document.querySelector('.form-2');
var form3 = document.querySelector('.form-3');

// show more
const showMore = document.querySelector('.catalog-btn-all');

// open modal
let isOpenModalProduct = false;
const $modal = document.querySelector('.modal-product');

// anchor
const anchors = document.querySelectorAll('a[href*="#"]');

formSend(form1);
formSend(form2);
formSendCart(form3);



newSocialApp();
showMoreInit();
initOpenMobileMenu();
initAnchorScroll();
initAnchorActiveScroll();
initModalProductEvents();
initModalNewProductEvents(); //New product in main section
initFixedMenu();
// var mask1 = IMask(inputsTel_1, {
//   mask: '+{380} (99) 999-99-99',
//   //placeholderChar: '_',
//   lazy: false,
// });

function initFixedMenu() {
  const $header = document.querySelector('header.header');
  const $nav = document.querySelector('.nav-pk');
  if (window.innerWidth > 767) {
    const func = () => {
      if ($header.offsetHeight <= window.scrollY) {
        $nav.classList.add('fixed');
      } else {
        $nav.classList.remove('fixed');
      }
    };
    func();
    window.addEventListener('scroll', func);
  } else {
    const func = () => {
      if (window.scrollY > 0) {
        $header.classList.add('scrolled');
      } else {
        $header.classList.remove('scrolled');
      }
    };
    func();
    window.addEventListener('scroll', func);
  }
}

function formError(form, text, success) {
  var inf = form.querySelector('.form-err');
  if (success == 'success' || success == 'pre_success') inf.classList.add('success');
  else inf.classList.remove('success');
  inf.innerHTML = '<p>' + text + '</p>';
}

function formSend(form, mask) {
  let first = true;
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const $name = form.querySelector('input[name="name"]');
    const $tel = form.querySelector('input[name="phone"]');
    const $productId = form.querySelector('input[name="product"]');
    const $counts = form.querySelector('input[name="counts"]');
    const $product = form.querySelector('.modal-product__title');
    const $price = form.querySelector('.modal-product__price');
    const dataForm = {};

    if ($name) dataForm.name = $name.value;
    if ($tel) dataForm.tel = $tel.value.replace(/\D+/g, '');
    if ($productId) dataForm.id = $productId.value;
    if ($counts) dataForm.counts = $counts.value;
    if ($product) dataForm.product = $product.innerText;
    if ($price) dataForm.price = $price.innerText.replace(/\D+/g, '');

    if ((dataForm.tel.length !== 12 && dataForm.tel.length !== 10) || dataForm.name.length < 2) {
      return formError(form, "Введіть коректний номер телефону або ім'я!");
    }
    if (dataForm.counts && !(dataForm.counts > 0)) {
      return formError(form, 'Кількість введена не вірно!');
    }

    form.querySelector('.form-err').innerHTML = '';
    var btn = form.querySelector('button');
    btn.style.pointerEvents = 'none';
    btn.classList.add('btn-load');

    const bodyForm = new FormData();
    bodyForm.append('action', 'send_crm');
    bodyForm.append('first', first);

    // let c_token = form.id == 'form1' ? grecaptcha.getResponse(cap1) : grecaptcha.getResponse(cap2);
    // bodyForm.append('g-recaptcha-response', c_token);

    if(form.querySelector('input.recaptcha')) bodyForm.append('recaptcha_response', form.querySelector('input.recaptcha').value);

    if(!first) bodyForm.append('code', form.querySelector('.input-code input').value);
    for (const key in dataForm) {
      if (Object.hasOwnProperty.call(dataForm, key)) {
        bodyForm.append(key, dataForm[key])
      }
    }
    sendCrm(sendURL, bodyForm, (res) => {
      if (res.type === 'success') {
        let nameAndPhone = 'fullname=' + dataForm.name + '&phone=' + dataForm.tel;
        let srch = '';
        if (window.location.search) srch = window.location.search;
        srch ? (nameAndPhone = '&' + nameAndPhone) : (nameAndPhone = '?' + nameAndPhone);
        window.location.href = window.location.origin + '/thanks/' + srch + nameAndPhone + '&order='+res.order;
        // if(typeof fbq === 'function') fbq('track', 'Lead');
        form.reset();
        // formError(form, res.msg, res.type);
      } else if(res.type === 'pre_success') {
        first = false;
        form.querySelector('.input-code').classList.add('visible');
        formError(form, res.msg, res.type);
      }
      else {
        formError(form, res.msg, res.type);
      }
      btn.style.pointerEvents = 'all';
      btn.classList.remove('btn-load');
    });
  });
}

function formSendCart(form, mask) {
  let first = true;
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const $name = form.querySelector('input[name="name"]');
    const $tel = form.querySelector('input[name="phone"]');
    const cartItems = cart.getState();
    const dataForm = {};

    dataForm.products = [];
   
  

    if ($name) dataForm.name = $name.value;
    if ($tel) dataForm.tel = $tel.value.replace(/\D+/g, '');
    
    
    if ((dataForm.tel.length !== 12 && dataForm.tel.length !== 10) || dataForm.name.length < 2) {
      return formError(form, "Введіть коректний номер телефону або ім'я!");
    }

    cartItems.forEach((cartItem) => {
      dataForm.products.push({
        id: cartItem.id,
        price: callculatePrice(cartItem.count, cartItem.prices),
        count: cartItem.count,
        title: cartItem.title,
      });
    });

    dataForm.products = JSON.stringify(dataForm.products);
    
    form.querySelector('.form-err').innerHTML = '';
    var btn = form.querySelector('button');
    btn.style.pointerEvents = 'none';
    btn.classList.add('btn-load');

    const bodyForm = new FormData();
    bodyForm.append('action', 'send_crm');
    bodyForm.append('first', first);

    // let c_token = grecaptcha.getResponse(cap3);
    // bodyForm.append('g-recaptcha-response', c_token);

    if(form.querySelector('input.recaptcha')) bodyForm.append('recaptcha_response', form.querySelector('input.recaptcha').value);

    if(!first) bodyForm.append('code', form.querySelector('.input-code input').value);
    for (const key in dataForm) {
      if (Object.hasOwnProperty.call(dataForm, key)) {
        bodyForm.append(key, dataForm[key])
      }
    }
    sendCrm(sendURL, bodyForm, (res) => {
      if (res.type === 'success') {
        cart.removeCart();
        let nameAndPhone = 'fullname=' + dataForm.name + '&phone=' + dataForm.tel;
        let srch = '';
        if (window.location.search) srch = window.location.search;
        srch ? (nameAndPhone = '&' + nameAndPhone) : (nameAndPhone = '?' + nameAndPhone);
        window.location.href = window.location.origin + '/thanks/' + srch + nameAndPhone + '&order='+res.order;
        form.reset();
      
      }else if(res.type === 'pre_success') {
        first = false;
        form.querySelector('.input-code').classList.add('visible');
        formError(form, res.msg, res.type);
      } else {
        formError(form, res.msg, res.type);
      }
      btn.style.pointerEvents = 'all';
      btn.classList.remove('btn-load');
    });
  });
}

function sendCrm(url, data, success) {
  fetch(url, {
    method: 'post',
    body: data,
  })
    .then((response) => {
      return response.json();
    })
    .then((res) => {
      if (success !== undefined) success(res);
    })
    .catch((error) => {
      console.log(error);
    });
}

function newSocialApp() {
  var socialsLink = document.querySelectorAll('.socials a');
  var phoneModal = document.querySelector('.modal-tel');
  var phoneModalText = phoneModal.querySelector('.modal-tel__text');
  var phoneModalPhone = phoneModal.querySelector('.modal-tel__phone');
  var phoneModalClose = phoneModal.querySelector('.modal-tel__close');

  phoneModalClose.addEventListener('click', (e) => {
    e.preventDefault();
    phoneModal.classList.remove('open');
    document.body.classList.remove('open-modal');
  });

  for (const link of socialsLink) {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      var elem = e.currentTarget;
      var dataText = elem.dataset.text;
      var dataPhones = JSON.parse(elem.dataset.phone, true);


      if(Object.values(dataPhones).length === 1){
        return location.href = Object.values(dataPhones)[0];
      }

      phoneModalText.innerHTML = '<h3>' + dataText + '</h3>';

      phoneModalPhone.innerHTML = '';

      for (const key in dataPhones) {
        if (Object.hasOwnProperty.call(dataPhones, key)) {
          const element = dataPhones[key];
          phoneModalPhone.innerHTML += `<a href="${element}">${key}</a>`;
        }
      }
      setTimeout(() => {
        document.body.classList.add('open-modal');
        phoneModal.classList.add('open');
      }, 0);
    });
  }

  window.addEventListener('click', (e) => {
    if (!phoneModal.classList.contains('open')) return;
    if (!e.target.closest('.modal-tel')) {
      e.preventDefault();
      e.stopPropagation();
      phoneModal.classList.remove('open');
      document.body.classList.remove('open-modal');
    }
  });
}

function showMoreInit() {
  if (showMore) {
    showMore.addEventListener('click', function (e) {
      if (e.target.tagName !== 'A') return;
      e.preventDefault();
      document.querySelector('.catalog-grid').classList.add('opened');
      this.remove();
    });
  }
}

function increaseCount(a, b) {
  var input = b.previousElementSibling;
  var value = parseInt(input.value, 10);
  value = isNaN(value) ? 0 : value;
  value++;
  input.value = value;
}

function decreaseCount(a, b) {
  var input = b.nextElementSibling;
  var value = parseInt(input.value, 10);
  if (value > 1) {
    value = isNaN(value) ? 0 : value;
    value--;
    input.value = value;
  }
}

function modalAnimation(ms, target) {
  if (isOpenModalProduct) {
    target.classList.remove('opened');
    target.classList.add('closing');
    setTimeout(() => {
      target.classList.remove('closing');
      target.classList.add('closed');
      document.body.classList.remove('open-modal');
      isOpenModalProduct = false;
    }, ms);
  } else {
    target.classList.remove('closed');
    target.classList.add('opening');
    document.body.classList.add('open-modal');
    setTimeout(() => {
      target.classList.remove('opening');
      target.classList.add('opened');
      isOpenModalProduct = true;
    }, ms);
  }
}

function renderInfoProductModal(btn, $modal, $form) {
  const $card = btn.closest('.card');
  $form.reset();
  $form.querySelector('.form-err').innerHTML = '';
  const dataCard = {
    srcImage: $card.querySelector('.card__image img').getAttribute('src'),
    title: $card.querySelector('.card__title').textContent,
    price: $card.querySelector('.card__price').textContent,
    prices: $card.querySelector('.card__prices')?.innerHTML,
    table: $card.querySelector('.card__table')?.innerHTML,
    productId: btn.getAttribute('data-product-id'),
  };

  if($card.classList.contains('card-sale')){
    $modal.classList.add('sale');
  }else{
    $modal.classList.remove('sale');
  }
  
  $form.querySelector('input[name="product"]').value = dataCard.productId;
  $modal.querySelector('.modal-product__image img').setAttribute('src', dataCard.srcImage);
  $modal.querySelector('.modal-product__title').innerHTML = dataCard.title || '';
  $modal.querySelector('.modal-product__price').innerHTML = dataCard.price || '';
  $modal.querySelector('.modal-product__list').innerHTML = dataCard.prices || '';
  $modal.querySelector(' .modal-product__table').innerHTML = dataCard.table || '';
}

function initModalProductEvents() {
  document.querySelector('#catalog').addEventListener('click', (e) => {
    const clickElement = e.target;
    if (!clickElement.getAttribute('data-product-id')) return;
    e.preventDefault();
    renderInfoProductModal(clickElement, $modal, form2);
    modalAnimation(0, $modal);
  });

  document.querySelector('.modal-product').addEventListener('click', (e) => {
    if (e.target === e.currentTarget || e.target.closest('.modal-product__close'))
      modalAnimation(300, $modal);
  });
}

//New product in main section
function initModalNewProductEvents() {
    document.querySelector('#new-product').addEventListener('click', (e) => {
        const clickElement = e.target;
        if (!clickElement.getAttribute('data-product-id')) return;
        e.preventDefault();
        renderInfoProductModal(clickElement, $modal, form2);
        modalAnimation(0, $modal);
    });

    document.querySelector('.modal-product').addEventListener('click', (e) => {
        if (
            e.target === e.currentTarget ||
            e.target.closest('.modal-product__close')
        )
            modalAnimation(300, $modal);
    });
}


function initAnchorScroll() {
  for (let anchor of anchors) {

 

    anchor.addEventListener('click', function (e) {

      if(window.innerWidth <= 767) {
        if(e.target.classList.contains('btn-main')){
          e.preventDefault();
          return;
        }
      }

      e.preventDefault();
      if (e.target.closest('.nav-mobile') && isMenuOpen) {
        openMobileMenu();
        setTimeout(() => {
          const blockID = anchor.getAttribute('href').substr(1);

          document.getElementById(blockID).scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 300);
      } else {
        const blockID = anchor.getAttribute('href').substr(1);

        document.getElementById(blockID).scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  }
}

function initAnchorActiveScroll() {
  if (window.innerWidth > 767) {
    let navbarLinks = document.querySelectorAll('.nav-pk a[href*="#"]');
    window.addEventListener('scroll', (e) => {
      navbarLinks.forEach((link) => {
        let section = document.querySelector(link.hash);
        let { top, height } = section.getBoundingClientRect();
        if (top <= 150 && top + height > 150) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    });
  }
}

function openMobileMenu() {
  if (isMenuOpen) {
    document.body.classList.remove('open-modal');
    $btnBurger.classList.remove('active');

    $mobileNav.classList.remove('active');

    $site.classList.remove('nav-open');
    isMenuOpen = false;
  } else {
    document.body.classList.add('open-modal');
    $btnBurger.classList.add('active');
    $mobileNav.classList.add('active');
    $site.classList.add('nav-open');
    isMenuOpen = true;
  }
}

function initOpenMobileMenu() {
  $btnBurger.addEventListener('click', openMobileMenu);
  const $btnMain = document.querySelector('.btn-main');
  if(window.innerWidth <= 767) {
    $btnMain.addEventListener('click', openMobileMenu);
  }
}


function stateBtnAddCart(cartItems) {
  const btnsAddtoCart = document.querySelectorAll('.btn-add-cart.added');
  for(const btn of btnsAddtoCart){
    btn.classList.remove('added');
    btn.innerHTML = btn.getAttribute('data-text');
  }
  cartItems.forEach(item => {
    const btn = document.querySelector('.btn-add-cart[data-product-id="'+item.id+'"]');
    if(btn){
      btn.classList.add('added');
      btn.innerHTML = btn.getAttribute('data-text-added');
    } 
  });
}


// cart module in js

/*
  state = [];
  {
    id: number,
    count: number,
    prices: {
      string: number
    }
  }
*/

function initStateCart() {
  let state = JSON.parse(localStorage.getItem('cart')) || [];
  const eventUpdate = new Event('cart:update');
  const eventInit = new Event('cart:init');


  setTimeout(()=>{
    document.dispatchEvent(eventInit);
  }, 0);

  const getState = () => {
    return state;
  };

  const setState = () => {
    localStorage.setItem('cart', JSON.stringify(state));
    document.dispatchEvent(eventUpdate);
  };

  const addItem = (item) => {
    state.push(item);
    setState();
  };

  const removeItem = (itemId) => {
    state = state.filter(item => item.id != itemId);
    setState();
  };

  const addCountItem = (itemId) => {
    const findItem = state.find(item => item.id == itemId);
    findItem.count = findItem.count + 1;
    setState();
  };
  const minusCountItem = (itemId) => {
    const findItem = state.find(item => item.id == itemId);
    if(findItem && findItem.count === 1) return;
    findItem.count = findItem.count - 1;
    setState();
  }
  const removeCart = () => {
    state = [];
    setState();
  }
   
  return {
    getState,
    setState,
    addItem,
    removeItem,
    addCountItem,
    minusCountItem,
    removeCart,
  }
}


const btnsAddtoCart = document.querySelectorAll('.btn-add-cart');
const cartBtns = document.querySelectorAll('.cart-btn');
const $cartModal = document.querySelector('.modal-cart');


for (const cartBtn of cartBtns) {
  cartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    modalAnimation(0, $cartModal);
  });
}

$cartModal.addEventListener('click', (e) => {
  if (e.target === e.currentTarget || e.target.closest('.modal-cart__close'))
    modalAnimation(300, $cartModal);
});

for (const btn of btnsAddtoCart) {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if(e.target.classList.contains('added')) return;
    const card = e.target.closest('.card');

    const item = {
      id: e.target.getAttribute('data-product-id'),
      count: 1,
      prices: {
        1: card.querySelector('.card__price').getAttribute('data-price'),
      },
      image: card.querySelector('.card__image img').getAttribute('src'),
      title: card.querySelector('.card__title').innerText
    };
    for (const li of card.querySelectorAll('.card__prices li:not(.opt)')) {
      item.prices[Number(li.getAttribute('data-counts'))] = li.getAttribute('data-prices');
    }

    cart.addItem(item);

  });

}

const $cart = document.querySelector('.modal-cart');
const $cartItems = document.querySelector('.modal-cart__items');
const $cartSubtotal = document.querySelector('.modal-cart__subtotal span');
const cart = initStateCart();

document.addEventListener('cart:init', () => {
  const cartItems = cart.getState() || [];

  for (const cartBtn of cartBtns) {
    cartBtn.dataset.count = cartItems.length;
  }

  stateBtnAddCart(cartItems);
  renderCart(cartItems);
});

document.addEventListener('cart:update', () => {
  const cartItems = cart.getState();
  for (const cartBtn of cartBtns) {
    cartBtn.dataset.count = cartItems.length;
  }

  stateBtnAddCart(cartItems);
  renderCart(cartItems);
});



function renderCart(items) {

  if(items.length){
    let template = '';
    let AllPrice = 0;
    $cart.classList.remove('empty');
    items.forEach(item => {
      let price = callculatePrice(item.count, item.prices);
      AllPrice += +price * item.count;
      template += templateItemCart(item, price);
    });
    $cartItems.innerHTML = template;
    $cartSubtotal.innerHTML = AllPrice + ' ₴';
  }else{
    $cart.classList.add('empty');
    $cartItems.innerHTML = '<div class="modal-cart__notify">Кошик пустий :(<span>додайте товар для оформлення замовлення</span></div>';
  }
}

function templateItemCart(item, priceIsCount){
  return `<div class="cart-item" data-id="${item.id}">
    <div class="cart-item__image"><img src="${item.image}" alt="${item.title}" /></div>
    <div class="cart-item__content">
      <div class=cart-item__top>
        <div class="cart-item__title">${item.title}</div>
        <div class="cart-item__remove" onclick="cart.removeItem(${item.id})"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#fff" version="1.1" id="Capa_1" width="20px" height="20px" viewBox="0 0 482.428 482.429" xml:space="preserve"> <g> <g> <path d="M381.163,57.799h-75.094C302.323,25.316,274.686,0,241.214,0c-33.471,0-61.104,25.315-64.85,57.799h-75.098    c-30.39,0-55.111,24.728-55.111,55.117v2.828c0,23.223,14.46,43.1,34.83,51.199v260.369c0,30.39,24.724,55.117,55.112,55.117    h210.236c30.389,0,55.111-24.729,55.111-55.117V166.944c20.369-8.1,34.83-27.977,34.83-51.199v-2.828    C436.274,82.527,411.551,57.799,381.163,57.799z M241.214,26.139c19.037,0,34.927,13.645,38.443,31.66h-76.879    C206.293,39.783,222.184,26.139,241.214,26.139z M375.305,427.312c0,15.978-13,28.979-28.973,28.979H136.096    c-15.973,0-28.973-13.002-28.973-28.979V170.861h268.182V427.312z M410.135,115.744c0,15.978-13,28.979-28.973,28.979H101.266    c-15.973,0-28.973-13.001-28.973-28.979v-2.828c0-15.978,13-28.979,28.973-28.979h279.897c15.973,0,28.973,13.001,28.973,28.979    V115.744z"/> <path d="M171.144,422.863c7.218,0,13.069-5.853,13.069-13.068V262.641c0-7.216-5.852-13.07-13.069-13.07    c-7.217,0-13.069,5.854-13.069,13.07v147.154C158.074,417.012,163.926,422.863,171.144,422.863z"/> <path d="M241.214,422.863c7.218,0,13.07-5.853,13.07-13.068V262.641c0-7.216-5.854-13.07-13.07-13.07    c-7.217,0-13.069,5.854-13.069,13.07v147.154C228.145,417.012,233.996,422.863,241.214,422.863z"/> <path d="M311.284,422.863c7.217,0,13.068-5.853,13.068-13.068V262.641c0-7.216-5.852-13.07-13.068-13.07    c-7.219,0-13.07,5.854-13.07,13.07v147.154C298.213,417.012,304.067,422.863,311.284,422.863z"/> </g> </g> </svg></div>
      </div>
      <div class="cart-item__bottom">
        <div class="cart-item__counts-box counter">
          <div class="cart-item__count-btn down" onclick="cart.minusCountItem(${item.id})">-</div>
          <div class="cart-item__counts">${item.count}</div>
          <div class="cart-item__count-btn up" onclick="cart.addCountItem(${item.id})">+</div>
        </div>
        <div class="cart-item__price" data-price="${priceIsCount}">${item.count} x ${priceIsCount} ₴</div>
      </div>
    </div>
  </div>`;
}

function callculatePrice(num, obj) {

  let keys = Object.keys(obj);

  if (num < keys[0]) {
    return obj[keys[0]];
  }
  if (num >= keys[keys.length - 1]) {
    return obj[keys[keys.length - 1]];
  }

  for (let i = 0; i < keys.length - 1; i++) {
    let curr = parseInt(keys[i]);
    let next = parseInt(keys[i + 1]);

    if (num >= curr && num < next) {
      return obj[keys[i]];
    }
  }

}

