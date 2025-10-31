<<<<<<< Updated upstream
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
=======
<<<<<<< Updated upstream
import products  from './DB/mockProducts.js';

export function loadProducts() {
  return products;
=======
export async function getProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка загрузки продуктов:', error);
        return [];
    }
>>>>>>> Stashed changes
>>>>>>> Stashed changes
}

export async function getProductById(id) {
    try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка получения продукта:', error);
        return null;
    }
}

<<<<<<< Updated upstream
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
=======
<<<<<<< Updated upstream
export function renderProductList(container) {
  const list = loadProducts();
  console.log(list)
  container.innerHTML = list.map(renderProductCard).join('');
  container.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', (e) => {
      const productId = card.dataset.id;
      window.location.href = `products.html?id=${productId}`;
>>>>>>> Stashed changes
    });
  } catch (error) {
    console.error('Ошибка при загрузке продуктов:', error);
    container.innerHTML = "Произошла ошибка при загрузке продуктов.";
  }
}


export function getProductById(id) {
  return products.find(p => p.id == id);
}
=======
export async function renderProductList(container) {
    try {
        const products = await getProducts();

        if (!products || !products.length) {
            container.innerHTML = '<p>Товары не найдены</p>';
            return;
        }

        container.innerHTML = products.map((product) => `
            <div class="card" data-id="${product.id}">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p class="price">${product.price} ₽</p>
            </div>
        `).join('');

        container.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                window.location.href = `product.html?id=${id}`;
            });
        });
    } catch (error) {
        console.error('Ошибка рендеринга товаров:', error);
        container.innerHTML = '<p>Ошибка загрузки товаров</p>';
    }
}
>>>>>>> Stashed changes
