(function(){
  function makePlaceholder(text, w=400, h=280){
    const label = (text||'No image').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const bg = '#f3e9e1';
    const fg = '#b24b08';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>
      <rect width='100%' height='100%' fill='${bg}' />
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='${fg}' font-family='Kanit, Noto Sans, Arial' font-size='20'>${label}</text>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function replaceBroken(img){
    if(img.dataset._placeholderApplied) return;
    img.dataset._placeholderApplied = '1';
    const alt = img.getAttribute('alt') || img.dataset.alt || 'Hình ảnh';
    const w = img.width || 400;
    const h = img.height || 280;
    img.src = makePlaceholder(alt, w, h);
    img.classList.add('img-placeholder');
  }

  function watchImages(){
    document.querySelectorAll('img').forEach(img=>{
      // skip if local data already placeholder
      if(!img.src) { replaceBroken(img); return; }
      // attach error handler
      img.addEventListener('error', ()=> replaceBroken(img));
      // if image 404 already (naturalWidth===0) and not yet loaded
      if(img.complete && img.naturalWidth===0) replaceBroken(img);
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', watchImages);
  else watchImages();
})();
