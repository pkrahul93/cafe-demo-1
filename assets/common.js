
(function(){
  "use strict";

  const CART_KEY = "sutoCart";
  const PROMO_KEY = "sutoPromoCode";
  const ORDER_KEY = "sutoLastOrder";

  function safeRead(key, fallback){
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch(e){ return fallback; }
  }
  function safeWrite(key, value){
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch(e){ return false; }
  }

  const Cart = {
    get(){
      const value = safeRead(CART_KEY, []);
      return Array.isArray(value) ? value : [];
    },
    save(items){
      safeWrite(CART_KEY, Array.isArray(items) ? items : []);
      this.sync();
      window.dispatchEvent(new CustomEvent("suto:cart-updated"));
    },
    clear(){
      localStorage.removeItem(CART_KEY);
      this.sync();
      window.dispatchEvent(new CustomEvent("suto:cart-updated"));
    },
    count(){
      return this.get().reduce((n,item)=>n + Math.max(0, Number(item.quantity)||0), 0);
    },
    subtotal(){
      return this.get().reduce((n,item)=>n + (Number(item.price)||0)*(Number(item.quantity)||0), 0);
    },
    setPromo(code){ if(code) localStorage.setItem(PROMO_KEY, String(code).toUpperCase()); },
    getPromo(){ return localStorage.getItem(PROMO_KEY) || ""; },
    clearPromo(){ localStorage.removeItem(PROMO_KEY); },
    sync(){
      const count = this.count();
      document.querySelectorAll("#headerCartCount,#cartCount,[data-site-cart-count]").forEach(el=>el.textContent=count);
    }
  };
  window.SutoCart = Cart;

  const page = location.pathname.split("/").pop() || "index.html";

  function active(name){
    return page === name ? " active" : "";
  }

  function renderChrome(){
    const headerHost = document.getElementById("siteHeader");
    const footerHost = document.getElementById("siteFooter");

    if(headerHost){
      headerHost.innerHTML = `
        <header class="site-header">
          <a href="index.html" class="site-logo" aria-label="Suto Cafe home">
            <span class="site-logo-mark">S</span><span class="site-logo-name">Suto Cafe</span>
          </a>
          <nav class="site-nav" aria-label="Primary navigation">
            <a class="${active("index.html")}" href="index.html">Home</a>
            <a class="${active("menu.html")}" href="menu.html">Menu</a>
            <a class="${active("offers.html")}" href="offers.html">Offers</a>
            <a class="${active("about.html")}" href="about.html">Our Story</a>
            <a class="${active("contact.html")}" href="contact.html">Contact</a>
          </nav>
          <div class="site-actions">
            <a class="site-call" href="tel:+919126501137" aria-label="Call Suto Cafe">☎ <span>Call</span></a>
            <button class="site-cart" type="button" onclick="openSiteCart()" aria-label="Open cart">🛒 <span>Cart</span> <b class="site-cart-count" data-site-cart-count>0</b></button>
            <button class="site-menu-toggle" type="button" onclick="toggleSiteNav()" aria-label="Open menu">☰</button>
          </div>
        </header>
        <div class="site-mobile-nav" id="siteMobileNav">
          <a class="${active("index.html")}" href="index.html">Home</a>
          <a class="${active("menu.html")}" href="menu.html">Menu</a>
          <a class="${active("offers.html")}" href="offers.html">Offers</a>
          <a class="${active("about.html")}" href="about.html">Our Story</a>
          <a class="${active("contact.html")}" href="contact.html">Contact</a>
          <a href="checkout.html">Checkout</a>
        </div>`;
    }

    if(footerHost){
      footerHost.innerHTML = `
        <footer class="site-footer">
          <div class="site-footer-grid">
            <div>
              <div class="site-footer-brand">Suto Cafe</div>
              <p>Your neighbourhood café for coffee, food, desserts and good moments in Preet Vihar.</p>
            </div>
            <div>
              <h4>Explore</h4>
              <ul>
                <li><a href="index.html">Home</a></li><li><a href="menu.html">Menu</a></li>
                <li><a href="offers.html">Offers</a></li><li><a href="about.html">Our Story</a></li>
              </ul>
            </div>
            <div>
              <h4>Visit</h4>
              <ul>
                <li>Shop No. 12 & 14</li><li>New Rajdhani Enclave</li><li>Swasthya Vihar</li><li>New Delhi – 110092</li>
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>
                <li><a href="tel:+919126501137">+91 91265 01137</a></li>
                <li><a href="https://www.google.com/maps/search/?api=1&query=Suto%20Cafe%20Preet%20Vihar%20New%20Delhi%20110092" target="_blank" rel="noopener">Get Directions</a></li>
                <li>11 AM – 11 PM</li><li>Vegetarian Café</li>
              </ul>
            </div>
          </div>
          <div class="site-footer-bottom"><span>© 2026 Suto Cafe. All rights reserved.</span><span>Preet Vihar · New Delhi</span></div>
        </footer>`;
    }

    if(!document.getElementById("sutoToast")){
      document.body.insertAdjacentHTML("beforeend", `<div id="sutoToast" class="sc-toast" role="status" aria-live="polite"></div>`);
    }
    if(!document.getElementById("sutoBackTop")){
      document.body.insertAdjacentHTML("beforeend", `<button id="sutoBackTop" class="sc-back-top" type="button" aria-label="Back to top">↑</button>`);
      document.getElementById("sutoBackTop").addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
    }
    Cart.sync();
  }

  window.toggleSiteNav = function(){
    const nav=document.getElementById("siteMobileNav");
    if(nav) nav.classList.toggle("open");
  };

  window.openSiteCart = function(){
    if(typeof window.openCart === "function"){
      window.openCart();
      return;
    }
    if(page === "checkout.html"){
      document.querySelector(".checkout-summary,.order-summary,.summary-card")?.scrollIntoView({behavior:"smooth",block:"start"});
      return;
    }
    if(Cart.count() > 0){
      location.href="checkout.html";
    }else{
      location.href="menu.html";
    }
  };

  window.goToCart = window.openSiteCart;

  window.showToast = window.showToast || function(message){
    const toast=document.getElementById("sutoToast");
    if(!toast) return;
    toast.textContent=message;
    toast.classList.add("show");
    clearTimeout(window.__sutoToastTimer);
    window.__sutoToastTimer=setTimeout(()=>toast.classList.remove("show"),2300);
  };

  function installImageFallbacks(){
    document.querySelectorAll("img").forEach(img=>{
      if(!img.dataset.fallbackBound){
        img.dataset.fallbackBound="1";
        img.addEventListener("error",function(){
          if(this.dataset.failed) return;
          this.dataset.failed="1";
          const src=(this.src||"").toLowerCase();
          const fallback=src.includes("coffee") ? "assets/images/coffee.svg" :
                         src.includes("pizza") ? "assets/images/pizza.svg" :
                         src.includes("dessert") || src.includes("brownie") ? "assets/images/dessert.svg" :
                         "assets/images/food.svg";
          this.src=fallback;
        });
      }
    });
  }

  function enhanceMenuCards(){
    if(page!=="menu.html") return;
    document.querySelectorAll(".food-card").forEach(card=>{
      if(card.querySelector(".sc-details-link")) return;
      const name=card.dataset.name || "";
      const id=(window.SUTO_MENU_ITEMS||[]).find(x=>x.name.toLowerCase()===name.toLowerCase())?.id;
      if(!id) return;
      const bottom=card.querySelector(".food-bottom");
      if(!bottom) return;
      const link=document.createElement("a");
      link.className="sc-details-link";
      link.href=`item.html?id=${encodeURIComponent(id)}`;
      link.textContent="Details";
      link.style.cssText="font-size:12px;font-weight:700;color:#704b32;text-decoration:underline;margin-right:auto;padding:8px 4px";
      bottom.insertBefore(link,bottom.firstChild);
    });
  }

  function addHomeCarousel(){
    if(page!=="index.html" || document.getElementById("sutoHighlights")) return;
    const items=(window.SUTO_MENU_ITEMS||[]).slice(0,8);
    if(!items.length) return;
    const footer=document.getElementById("siteFooter");
    if(!footer) return;
    const section=document.createElement("section");
    section.id="sutoHighlights";
    section.className="sc-carousel";
    section.innerHTML=`
      <div class="sc-carousel-head">
        <div><h2>Popular picks</h2><p>A few favourites to get you started.</p></div>
        <div class="sc-carousel-controls"><button type="button" data-dir="-1" aria-label="Previous">‹</button><button type="button" data-dir="1" aria-label="Next">›</button></div>
      </div>
      <div class="sc-carousel-track">${items.map(i=>`
        <article class="sc-pick">
          <img src="${i.image}" alt="${i.name}" loading="lazy">
          <div class="sc-pick-body">
            <h3>${i.name}</h3><p>${i.description||"Made fresh at Suto Cafe."}</p>
            <div class="sc-pick-meta"><strong>₹${i.price}</strong><button type="button" data-add="${i.id}">Add +</button></div>
          </div>
        </article>`).join("")}</div>`;
    footer.parentNode.insertBefore(section,footer);
    const track=section.querySelector(".sc-carousel-track");
    section.querySelectorAll("[data-dir]").forEach(btn=>btn.addEventListener("click",()=>{
      track.scrollBy({left:Number(btn.dataset.dir)*320,behavior:"smooth"});
    }));
    section.querySelectorAll("[data-add]").forEach(btn=>btn.addEventListener("click",()=>{
      const item=items.find(x=>x.id===btn.dataset.add); if(!item) return;
      const cart=Cart.get(); const found=cart.find(x=>x.productId===item.id && !x.options);
      if(found) found.quantity=(Number(found.quantity)||0)+1;
      else cart.push({id:Date.now(),productId:item.id,name:item.name,price:item.price,quantity:1,image:item.image,options:{},instructions:""});
      Cart.save(cart); showToast(item.name+" added to cart");
    }));
    installImageFallbacks();
  }

  document.addEventListener("DOMContentLoaded",()=>{
    renderChrome();
    addHomeCarousel();
    enhanceMenuCards();
    installImageFallbacks();

    const observer = new MutationObserver(installImageFallbacks);
    observer.observe(document.body,{subtree:true,childList:true});
    Cart.sync();

    window.addEventListener("storage",()=>Cart.sync());
    window.addEventListener("suto:cart-updated",()=>Cart.sync());

    window.addEventListener("scroll",()=>{
      document.getElementById("sutoBackTop")?.classList.toggle("show",window.scrollY>500);
    },{passive:true});

    document.addEventListener("click",e=>{
      const nav=document.getElementById("siteMobileNav");
      if(nav && nav.classList.contains("open") && !e.target.closest(".site-mobile-nav,.site-menu-toggle")){
        nav.classList.remove("open");
      }
    });
  });
})();
