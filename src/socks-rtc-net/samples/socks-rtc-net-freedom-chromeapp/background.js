var script = document.createElement('script');
script.setAttribute('data-manifest', 'freedom.json');
script.textContent = '{ "debug": false }';
script.src = 'lib/freedom/freedom-for-chrome-for-uproxy.js';
document.head.appendChild(script);
