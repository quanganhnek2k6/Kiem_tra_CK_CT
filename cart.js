// Simple site-wide cart using localStorage
(function(){
  const KEY = 'kan_cart';
    const STORAGE_KEY = 'kan_cart';
    function loadCart(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }catch(e){return []} }
    function saveCart(cart){ localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }
    function formatVND(v){ return new Intl.NumberFormat('vi-VN', {style:'currency', currency:'VND'}).format(v); }
    function findItem(cart,id){ return cart.find(i=>i.id===id); }
    function addItem(item){
      const cart = loadCart();
      const existing = findItem(cart,item.id);
      if(existing){ existing.qty += item.qty; }
      else{ cart.push(item); }
      saveCart(cart);
      renderCart();
    }
    function removeItem(id){ let cart = loadCart(); cart = cart.filter(i=>i.id!==id); saveCart(cart); renderCart(); }
    function clearCart(){ localStorage.removeItem(STORAGE_KEY); renderCart(); }
    window.addToCart = function(id,name,price,qty=1){ addItem({id:String(id), name, price: Number(price), qty: Number(qty)}); }

    /* parse price strings like "120.000 VNĐ" -> 120000 */
    function parsePriceText(txt){ if(!txt) return 0; const digits = txt.replace(/[^0-9]/g,''); return digits ? Number(digits) : 0; }

    /* UI */
    function renderCart(){
      const root = document.querySelector('.cart-root');
      if(!root) return;
      const panel = root.querySelector('.cart-items');
      const countEl = root.querySelector('.cart-count');
      const totalEl = root.querySelector('.cart-total-value');
      const cart = loadCart();
      panel.innerHTML = '';
      let total = 0;
      cart.forEach(it=>{
        const row = document.createElement('div'); row.className='cart-row';
        row.innerHTML = `<div class="cart-row-name">${it.name} x${it.qty}</div><div class="cart-row-price">${formatVND(it.price*it.qty)}</div><button class="cart-remove" data-id="${it.id}">✕</button>`;
        panel.appendChild(row);
        total += it.price*it.qty;
      });
      countEl.textContent = cart.reduce((s,i)=>s+i.qty,0);
      totalEl.textContent = formatVND(total);
    }

    function openCartPanel(){ const panel = document.getElementById('cart-panel'); if(panel) panel.classList.remove('hidden'); }

    document.addEventListener('click', function(e){
      if(e.target.matches('.cart-toggle')){ document.getElementById('cart-panel').classList.toggle('hidden'); }
      if(e.target.matches('.cart-close')) document.getElementById('cart-panel').classList.add('hidden');
      if(e.target.matches('.cart-clear')) clearCart();
      if(e.target.matches('.cart-remove')){ removeItem(e.target.dataset.id); }
      if(e.target.matches('.add-to-order')){
        e.preventDefault();
        const el = e.target;
        const closest = el.closest('.menu-item');
        const name = el.dataset.item || (closest && (closest.querySelector('h4')?.textContent || closest.querySelector('h3')?.textContent)) || 'Món';
        const price = Number(el.dataset.price) || parsePriceText(el.dataset.priceText) || (closest && parsePriceText(closest.querySelector('.price')?.textContent)) || 0;
        addItem({id:name, name, price, qty:1});
        openCartPanel();
      }
    });

    /* Auto-inject "Thêm vào giỏ" buttons for menu items and wire them up */
    function injectAddButtons(){
      document.querySelectorAll('.menu-item').forEach(item=>{
        const summary = item.querySelector('summary') || item;
        const priceEl = item.querySelector('.price');
        const nameEl = item.querySelector('h4') || item.querySelector('h3');
        const name = nameEl ? nameEl.textContent.trim() : 'Món';
        const priceVal = parsePriceText(priceEl?.textContent || '') || 0;
        let btn = item.querySelector('.add-to-order');
        if(!btn){
          btn = document.createElement('button');
          btn.className = 'add-to-order';
          btn.type = 'button';
          btn.textContent = 'Thêm vào giỏ';
          btn.style.marginTop = '8px';
          summary.appendChild(btn);
        }
        btn.dataset.item = name;
        if(!btn.dataset.price) btn.dataset.price = priceVal;
      });
    }

    document.addEventListener('DOMContentLoaded', function(){ renderCart(); injectAddButtons(); });

    /* Inject or move delivery form into cart panel */
    function injectCartDeliveryForm(){
      const panelInner = document.querySelector('.cart-panel-inner');
      if(!panelInner) return;
      if(panelInner.querySelector('.order-box') || panelInner.querySelector('#cart-order-form')) return; // already added

      const footer = panelInner.querySelector('.cart-footer');
      // if there's an existing aside.order-box on the page, move it into the panel
      const mainAside = document.querySelector('.order-box');
      if(mainAside){
        // move the aside into panel
        panelInner.insertBefore(mainAside, footer);
        // remove original placement by hiding (it's now moved)
        mainAside.style.display = 'block';
        // attach submit handler to the moved form
        const movedForm = mainAside.querySelector('form');
        if(movedForm){
          movedForm.addEventListener('submit', function(e){
            e.preventDefault();
            const order = {
              cart: loadCart(),
              info: {
                name: movedForm.querySelector('#name')?.value || movedForm.querySelector('[name="name"]')?.value || '',
                phone: movedForm.querySelector('#phone')?.value || movedForm.querySelector('[name="phone"]')?.value || '',
                address: movedForm.querySelector('#address')?.value || movedForm.querySelector('[name="address"]')?.value || '',
                payment: movedForm.querySelector('#payment')?.value || movedForm.querySelector('[name="payment"]')?.value || '',
                note: movedForm.querySelector('#note')?.value || movedForm.querySelector('[name="note"]')?.value || '',
              },
              createdAt: Date.now()
            };
            try{ localStorage.setItem('kan_order_pending', JSON.stringify(order)); }catch(e){}
            window.location.href = 'order.html';
          });
        }
        return;
      }

      // fallback: inject a small inline cart-order-form when no .order-box exists
      const formHtml = `
        <form id="cart-order-form" class="cart-order-form">
          <h4>Thông tin giao hàng</h4>
          <label for="cart-name">Họ và tên</label>
          <input id="cart-name" name="name" type="text" required />
          <label for="cart-phone">Số điện thoại</label>
          <input id="cart-phone" name="phone" type="tel" required />
          <label for="cart-address">Địa chỉ</label>
          <input id="cart-address" name="address" type="text" required />
          <label for="cart-payment">Phương thức</label>
          <select id="cart-payment" name="payment">
            <option>Tiền mặt</option>
            <option>Chuyển khoản</option>
            <option>Ví điện tử</option>
          </select>
          <label for="cart-note">Ghi chú</label>
          <textarea id="cart-note" name="note" rows="2"></textarea>
          <button type="submit" class="cart-submit">Xác nhận đặt món</button>
        </form>
      `;
      const wrapper = document.createElement('div');
      wrapper.innerHTML = formHtml;
      panelInner.insertBefore(wrapper, footer);
      const cartForm = document.getElementById('cart-order-form');
      cartForm.addEventListener('submit', function(e){
        e.preventDefault();
        const order = {
          cart: loadCart(),
          info: {
            name: cartForm.querySelector('[name="name"]').value,
            phone: cartForm.querySelector('[name="phone"]').value,
            address: cartForm.querySelector('[name="address"]').value,
            payment: cartForm.querySelector('[name="payment"]').value,
            note: cartForm.querySelector('[name="note"]').value,
          },
          createdAt: Date.now()
        };
        try{ localStorage.setItem('kan_order_pending', JSON.stringify(order)); }catch(e){}
        window.location.href = 'order.html';
      });
    }

    document.addEventListener('DOMContentLoaded', function(){ injectCartDeliveryForm(); });
