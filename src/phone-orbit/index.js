import { PhoneOrbit } from './PhoneOrbit.js';

export { PhoneOrbit };

function init() {
  const root = document.getElementById('lookout-phone-orbit');
  if (root && !root.dataset.loInit) {
    root.dataset.loInit = '1';
    window.lookoutPhoneOrbit = new PhoneOrbit(root);
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
