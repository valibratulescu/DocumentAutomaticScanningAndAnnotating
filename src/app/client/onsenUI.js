import ons from 'onsenui';
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';

document.addEventListener('init', function(event) {
  var page = event.target;
  if (page.matches('#helloworld-page')) {
    page.querySelector('ons-toolbar .center').innerHTML = 'My app';
    page.querySelector('ons-button').onclick = function() {
      ons.notification.alert('Hello world!');
    };
  }
});