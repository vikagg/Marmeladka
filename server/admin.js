
let productsData = []; // Для товаров
let usersData = [];     // Для пользователей

const productsJsonFilePath = '../server/DB/mockProducts.json'; // Путь к JSON-файлу товаров
const usersJsonFilePath = '../server/DB/mockUsers.json';                      // Путь к JSON-файлу пользователей (обратите внимание на / в начале)

async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    return null; 
  }
}

async function saveData(url, data) {
  try {
    const response = await fetch(url, {
      method: 'PUT', // Или PATCH, в зависимости от вашего серверного API
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data, null, 2), // Преобразуем в JSON с отступами
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log(`Data successfully saved to ${url}.`);
  } catch (error) {
    console.error(`Error saving data to ${url}:`, error);
    alert('Failed to save changes. Check server logs.');
  }
}


async function getProducts() {
  productsData = await fetchData(productsJsonFilePath);
  if (!productsData) {
    productsData = []; // Инициализируем пустым массивом, если загрузка не удалась
  }
  renderProducts();
}

function renderProducts() {
  const tableBody = document.querySelector('#productTable tbody');

  if (!tableBody) {
    console.error('Product table body not found.');
    return;
  }

  if (!productsData || productsData.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5">Товаров нет</td></tr>';
    return;
  }

  tableBody.innerHTML = productsData.map((p, i) =>
    `<tr>
      <td>${i + 1}</td>
      <td><img src="${p.image}" alt="${p.name}" width="50"></td>
      <td>${p.name}</td>
      <td>${p.price} ₽</td>
      <td>
        <button class="edit-btn" data-id="${p.id}">✏️</button>
        <button class="delete-btn" data-id="${p.id}">🗑</button>
      </td>
    </tr>`
  ).join('');

  document.querySelectorAll('.delete-btn').forEach(btn =>
    btn.addEventListener('click', () => deleteProduct(btn.dataset.id))
  );

  document.querySelectorAll('.edit-btn').forEach(btn =>
    btn.addEventListener('click', () => openEditModal(btn.dataset.id))
  );
}

async function addProduct(e) {
  e.preventDefault();
  const name = document.querySelector('#name').value.trim();
  const price = document.querySelector('#price').value.trim();
  const image = document.querySelector('#image').value.trim();

  if (!name || !price || !image) { // Исправлена логическая ошибка (было !)
    alert('Заполните все поля!');
    return;
  }

  const newProduct = {
    id: Date.now(),
    name,
    price: Number(price),
    image
  };

  productsData.push(newProduct);
  renderProducts();
  e.target.reset();

  await saveProductsToJson(); // Сохраняем изменения в JSON
}

async function deleteProduct(id) {
  productsData = productsData.filter(p => String(p.id) !== String(id));
  renderProducts();
  await saveProductsToJson(); // Сохраняем изменения в JSON
}

function openEditModal(id) {
    const product = productsData.find(p => String(p.id) === String(id));

    if (!product) return;

    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-button">&times;</span>
        <h2>Редактировать товар</h2>
        <form id="editProductForm"> <!-- Changed ID to editProductForm for clarity -->
          <label for="editProductName">Название:</label>
          <input type="text" id="editProductName" name="editProductName" value="${product.name}"><br><br>

          <label for="editProductPrice">Цена:</label>
          <input type="number" id="editProductPrice" name="editProductPrice" value="${product.price}"><br><br>

          <label for="editProductImage">Ссылка на фото:</label>
          <input type="text" id="editProductImage" name="editProductImage" value="${product.image}"><br><br>

          <button type="submit">Сохранить</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.close-button').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.querySelector('#editProductForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.querySelector('#editProductName').value.trim();
        const price = document.querySelector('#editProductPrice').value.trim();
        const image = document.querySelector('#editProductImage').value.trim();

        if (name && price && image) {
            product.name = name;
            product.price = Number(price);
            product.image = image;
            renderProducts();
            document.body.removeChild(modal);
            await saveProductsToJson();
        } else {
            alert('Пожалуйста, заполните все поля.');
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

async function saveProductsToJson() {
  await saveData(productsJsonFilePath, productsData);
}

async function getUsers() {
  usersData = await fetchData(usersJsonFilePath);
  if (!usersData) {
    usersData = []; // Инициализируем пустым массивом, если загрузка не удалась
  }
  renderUsers();
}

function renderUsers() {
  const userTableBody = document.querySelector('#userTable tbody');
  if (!userTableBody) {
    console.error('User table body not found.');
    return;
  }

  if (!usersData || usersData.length === 0) {
    userTableBody.innerHTML = '<tr><td colspan="5">Пользователей нет.</td></tr>'; // Изменено colspan
    return;
  }

  userTableBody.innerHTML = usersData
    .map(
      (user, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${user.login}</td>
      <td>${user.name}</td>
      <td>${user.rol}</td>
      <td>
        <button class="edit-user-btn" data-id="${user.id}">✏️</button>
        <button class="delete-user-btn" data-id="${user.id}">🗑</button>
      </td>
    </tr>`
    )
    .join('');

  // Прикрепляем слушатели событий *после* вставки HTML
  document.querySelectorAll('.delete-user-btn').forEach((btn) =>
    btn.addEventListener('click', () => deleteUser(btn.dataset.id))
  );

  document.querySelectorAll('.edit-user-btn').forEach((btn) =>
    btn.addEventListener('click', () => openEditUserModal(btn.dataset.id))
  );
}

async function addUser(event) {
  event.preventDefault();
  const login = document.querySelector('#userLogin').value.trim();
  const password = document.querySelector('#userPassword').value.trim();
  const name = document.querySelector('#userName').value.trim();
  const rol = document.querySelector('#userRol').value.trim();

  if (!login || !password || !name || !rol) {
    alert('Пожалуйста, заполните все поля для пользователя.');
    return;
  }

  const newUser = {
    id: Date.now(), // Генерируем уникальный ID
    login,
    password, // В реальном приложении пароли ХЕШИРУЮТСЯ, а не хранятся в открытом виде!
    name,
    rol,
  };

  usersData.push(newUser);
  renderUsers();

  await saveUsersToJson(); // Сохраняем обновленных пользователей в JSON

  document.querySelector('#userForm').reset(); // Очищаем форму
}

async function deleteUser(id) {
  usersData = usersData.filter((user) => String(user.id) !== String(id));
  renderUsers();
  await saveUsersToJson();
}

function openEditUserModal(id) {
  const user = usersData.find((user) => String(user.id) === String(id));
  if (!user) return;

  const modal = document.createElement('div');
  modal.classList.add('modal');
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-button">&times;</span>
      <h2>Редактировать пользователя</h2>
      <form id="editUserForm">
        <label for="editUserLogin">Логин:</label>
        <input type="text" id="editUserLogin" name="editUserLogin" value="${user.login}"><br><br>

        <label for="editUserName">Имя:</label>
        <input type="text" id="editUserName" name="editUserName" value="${user.name}"><br><br>

        <label for="editUserRol">Роль:</label>
        <input type="text" id="editUserRol" name="editUserRol" value="${user.rol}"><br><br>

        <label for="editUserPassword">Пароль (оставьте пустым, если не меняете):</label>
        <input type="password" id="editUserPassword" name="editUserPassword" value=""><br><br>

        <button type="submit">Сохранить изменения</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.close-button').addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  modal.querySelector('#editUserForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const newLogin = document.querySelector('#editUserLogin').value.trim();
    const newName = document.querySelector('#editUserName').value.trim();
    const newRol = document.querySelector('#editUserRol').value.trim();
    const newPassword = document.querySelector('#editUserPassword').value.trim(); // Получаем новое значение пароля

    if (!newLogin || !newName || !newRol) {
      alert('Пожалуйста, заполните все обязательные поля (Логин, Имя, Роль).');
      return;
    }

    // Обновляем объект пользователя
    user.login = newLogin;
    user.name = newName;
    user.rol = newRol;
    if (newPassword) { // Обновляем пароль, только если поле не пустое
      user.password = newPassword; // Опять же, в реальном приложении здесь было бы хеширование
    }

    renderUsers();
    document.body.removeChild(modal);
    await saveUsersToJson();
  });

  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

async function saveUsersToJson() {
  await saveData(usersJsonFilePath, usersData);
}


document.addEventListener('DOMContentLoaded', async () => {
  // Продукты
  document.querySelector('#productForm').addEventListener('submit', addProduct);
  await getProducts(); // Сначала загружаем товары из JSON
  renderProducts();

  // Пользователи
  document.querySelector('#userForm').addEventListener('submit', addUser);
  await getUsers(); // Загружаем пользователей из JSON
});
