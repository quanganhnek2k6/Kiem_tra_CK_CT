// Inject a hamburger toggle and make nav collapsible on small screens
(function(){
  function makeToggle(){
    const header = document.querySelector('header') || document.body;
    if(!header) return;
    if(document.querySelector('.nav-toggle')) return; // already
    const btn = document.createElement('button');
    btn.className = 'nav-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label','Mở menu');
    btn.innerHTML = '☰';
    // place before cart if exists, else append to header
    const cart = header.querySelector('.cart-root');
    if(cart) header.insertBefore(btn, cart);
    else header.appendChild(btn);

    const nav = document.querySelector('nav');
    btn.addEventListener('click', ()=>{
      if(!nav) return;
      const isOpen = nav.classList.toggle('responsive');
      btn.setAttribute('aria-label', isOpen ? 'Đóng menu' : 'Mở menu');
    });

    // close when clicking a nav link
    document.addEventListener('click', (e)=>{
      if(!nav) return;
      if(e.target.closest('nav') || e.target===btn) return;
      nav.classList.remove('responsive');
      btn.setAttribute('aria-label','Mở menu');
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', makeToggle);
  else makeToggle();
})();
