export function loadProducts() {
 
  return fetch('../server/DB/mockProducts.json')
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(jsonData => {
      console.log(jsonData);
      return jsonData; // Вернуть загруженные данные
  })
  .catch(error => {
      console.error('Ошибка:', error);
  });
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

export async function renderProductList(container) {
  try {
    const products = await loadProducts(); // Ожидаем завершения загрузки продуктов
    console.log(products);

    // Проверяем, что продукты загрузились и являются массивом
    if (!Array.isArray(products) || products.length === 0) {
      container.innerHTML = "Нет доступных продуктов.";
      return; // Выходим из функции, если ничего не загружено
    }

    // Заполняем контейнер элементами
    container.innerHTML = products.map(renderProductCard).join('');
    
    // Добавляем обработчики событий к карточкам продуктов
    container.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', (e) => {
        const productId = card.dataset.id;
        window.location.href = `products.html?id=${productId}`;
      });
    });
  } catch (error) {
    console.error('Ошибка при загрузке продуктов:', error);
    container.innerHTML = "Произошла ошибка при загрузке продуктов.";
  }
}


export function getProductById(id) {
  return products.find(p => p.id == id);
}
