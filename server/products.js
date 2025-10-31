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