import { validateForm } from '../server/validation.js';
import { loginUser, registerUser, getCurrentUser, logoutUser } from '../server/auth.js';
import { renderProductList } from '../server/products.js';
import products from '../server/DB/mockProducts.js';

// Для login.html
if (document.querySelector('.mars-once')) {
  alert('Вход успешен!');
  const form = document.querySelector('form');
  const loginInput = form.querySelector('input[type="text"]');
  const passwordInput = form.querySelector('input[type="password"]');
  const submitBtn = form.querySelector('button');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { isValid, loginError, passwordError } = validateForm(loginInput.value, passwordInput.value);
    if (!isValid) {
      alert(`${loginError}`);
      return;
    }
    const result = loginUser(loginInput.value, passwordInput.value);
    if (result.success) {
      alert('Вход успешен!');
      window.location.href = 'index.html';
    } else {
      alert(result.error);
    }
  });

  // Для регистрации (добавьте кнопку или переключатель)
  // Аналогично, но с registerUser
}

// Для index.html
if (document.querySelector('.cards')) {
  const container = document.querySelector('.cards');
  renderProductList(container);
}

// Для mar.html
if (document.querySelector('.product-page')) {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (productId) {
      const product = products.find(p => p.id == productId);

      if (product) {
          // Заполняем информацию о товаре
          document.querySelector('.product-page img').src = product.image;
          document.querySelector('.product-info h1').textContent = product.name;
          document.querySelector('.product-info p').textContent = product.description;
          document.querySelector('.product-info .price').textContent = `${product.price} ₽`;
      } else {
          console.error('Товар не найден!');
      }
  } else {
      console.error('ID товара не указан в URL!');
  }
}
 // 1)  надо из пути взять  ID
   // 2)  по  ID  взять мармеладку (getProductById)
    // 3) найти все необходимые элементы и засунуть в них значения из мармеладки
