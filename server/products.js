import products  from './DB/mockProducts.js';

export function loadProducts() {
  return products;
}

export function renderProductCard(product) {
  return `
    <div class="card" data-id="${product.id}">
      <img src="${product.image}" alt="${product.name}">
      <h2>${product.name}</h2>
      <p class="price">${product.price} ₽</p>
      <button class="bt">Добавить в корзину</button>
    </div>
  `;
}

export function renderProductList(container) {
  const list = loadProducts();
  console.log(list)
  container.innerHTML = list.map(renderProductCard).join('');
  container.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', (e) => {
      const productId = card.dataset.id;
      window.location.href = `products.html?id=${productId}`;
    });
  });
}

export function getProductById(id) {
  return products.find(p => p.id == id);
}
