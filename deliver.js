(function(){
  // Simple delivery estimator: base time 20min + 3min per km
  // base fee 15000 VND + 2000 VND per km
  function formatVND(v){ return new Intl.NumberFormat('vi-VN', {style:'currency', currency:'VND'}).format(v); }
  function estimate(distanceKm){
    const dist = Math.max(0, Number(distanceKm) || 0);
    const minutes = Math.round(20 + dist * 3);
    const base = 15000;
    const perKm = 2000;
    const fee = Math.round(base + perKm * dist);
    return {minutes, fee};
  }
  function updateUI(){
    const input = document.getElementById('delivery-distance');
    const outTime = document.querySelector('.est-time');
    const outFee = document.querySelector('.est-fee');
    if(!input || !outTime || !outFee) return;
    const val = parseFloat(input.value || 0);
    const e = estimate(val);
    outTime.textContent = e.minutes + ' phút';
    outFee.textContent = formatVND(e.fee);
  }
  document.addEventListener('DOMContentLoaded', function(){
    const input = document.getElementById('delivery-distance');
    if(!input) return;
    input.addEventListener('input', updateUI);
    // try to prefill with a default value
    input.value = input.value || '';
    updateUI();
    // if main form submitted, forward to cart order handler
    const mainForm = document.querySelector('.order-box form');
    if(mainForm){
      mainForm.addEventListener('submit', function(e){
        e.preventDefault();
        const cartForm = document.getElementById('cart-order-form');
        if(cartForm){
          // copy values
          ['name','phone','address','payment','note'].forEach(k=>{
            const mainEl = mainForm.querySelector('#'+k) || mainForm.querySelector('[name="'+k+'"]');
            const cartEl = cartForm.querySelector('[name="'+k+'"]');
            if(cartEl && mainEl) cartEl.value = mainEl.value;
          });
          cartForm.dispatchEvent(new Event('submit', {cancelable:true, bubbles:true}));
        } else {
          // fallback: save order directly
          const order = { cart: JSON.parse(localStorage.getItem('kan_cart')||'[]'), info: {
            name: mainForm.querySelector('#name')?.value || '',
            phone: mainForm.querySelector('#phone')?.value || '',
            address: mainForm.querySelector('#address')?.value || '',
            payment: mainForm.querySelector('#payment')?.value || '',
            note: mainForm.querySelector('#note')?.value || ''
          }, createdAt: Date.now() };
          try{ localStorage.setItem('kan_order_pending', JSON.stringify(order)); }catch(e){}
          window.location.href = 'order.html';
        }
      });
    }
  });
})();
