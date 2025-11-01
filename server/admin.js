
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser || currentUser.role !== 'admin') {
  alert('Доступ запрещён!');
  window.location.href = 'index.html';
}

class SupabaseUploader {
    constructor() {
        this.supabaseUrl = 'https://vbjrfcgxzwjsgyadxlql.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZianJmY2d4endqc2d5YWR4bHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMzQ1MjksImV4cCI6MjA3MzkxMDUyOX0.M4vNHAfj5XQlKCModUpCGVfpJ1TYB0EcDaMOt0ODF8k';
        this.bucketName = 'Marmeladka';
        this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
    }

    generateFileName(file) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = file.name.split('.').pop();
        return `service_${timestamp}_${randomString}.${extension}`;
    }

    async uploadFile(file) {
        try {
            const fileName = this.generateFileName(file);

            const { data, error } = await this.supabase.storage
                .from(this.bucketName)
                .upload(fileName, file);

            if (error) {
                throw new Error(`Ошибка загрузки: ${error.message}`);
            }

            const { data: publicUrlData } = this.supabase.storage
                .from(this.bucketName)
                .getPublicUrl(fileName);

            return {
                success: true,
                url: publicUrlData.publicUrl,
                fileName: fileName
            };

        } catch (error) {
            console.error('Ошибка загрузки на Supabase:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

const uploader = new SupabaseUploader();

// --- PRODUCT MANAGEMENT ---
async function getProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error('Ошибка получения продуктов:', error);
        return [];
    }
}

async function renderProducts() {
  const products = await getProducts();
  const tableBody = document.querySelector('#productTable tbody');

  if (!products || !products.length) {
    tableBody.innerHTML = '<tr><td colspan="6">Товаров нет</td></tr>';
    return;
  }

  tableBody.innerHTML = products.map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><img src="${p.image}" alt="${p.name}" width="50"></td>
      <td>${p.name}</td>
      <td>${p.description}</td>
      <td>${p.price} ₽</td>
      <td>
        <button class="edit-btn action-btn" data-id="${p.id}">✏️</button>
        <button class="delete-btn action-btn" data-id="${p.id}">🗑️</button>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.delete-btn').forEach(btn =>
    btn.addEventListener('click', () => deleteProduct(btn.dataset.id))
  );

  document.querySelectorAll('.edit-btn').forEach(btn =>
    btn.addEventListener('click', () => editProduct(btn.dataset.id))
  );
}

function setupImageUpload() {
  const fileInput = document.getElementById('imageUpload');
  const uploadBtn = document.getElementById('uploadBtn');
  const imageInput = document.getElementById('image');
  const uploadStatus = document.getElementById('uploadStatus');

  uploadBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      uploadStatus.textContent = 'Ошибка: выберите изображение';
      uploadStatus.className = 'upload-status error';
      return;
    }

    try {
      uploadStatus.textContent = 'Загрузка...';
      uploadStatus.className = 'upload-status';

      const result = await uploader.uploadFile(file);

      if (result.success) {
        imageInput.value = result.url;
        uploadStatus.textContent = 'Успешно загружено!';
        uploadStatus.className = 'upload-status success';
      } else {
        uploadStatus.textContent = result.error;
        uploadStatus.className = 'upload-status error';
      }
    } catch (error) {
      uploadStatus.textContent = 'Ошибка загрузки';
      uploadStatus.className = 'upload-status error';
    }
  });
}

async function addProduct(e) {
  e.preventDefault();
  const name = document.querySelector('#name').value.trim();
  const price = document.querySelector('#price').value.trim();
  const description = document.querySelector('#description').value.trim();
  const image = document.querySelector('#image').value.trim();

  if (!name || !price || !description || !image) {
    alert('Заполните все поля!');
    return;
  }

  const newProduct = {
    name,
    price: Number(price),
    description,
    image
  };

  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProduct)
    });

    if (response.ok) {
      renderProducts();
      e.target.reset();
      const uploadStatus = document.getElementById('uploadStatus');
      uploadStatus.textContent = '';
      uploadStatus.className = 'upload-status';
    } else {
      alert('Ошибка при добавлении товара');
    }
  } catch (error) {
    alert('Ошибка сети');
  }
}

async function deleteProduct(id) {
  if (confirm('Удалить этот товар?')) {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        renderProducts();
      } else {
        alert('Ошибка при удалении товара');
      }
    } catch (error) {
      alert('Ошибка сети');
    }
  }
}

async function editProduct(id) {
  const products = await getProducts();
  const product = products.find(p => String(p.id) === String(id));

  if (!product) return;

  const name = prompt('Новое название:', product.name);
  const description = prompt('Новое описание:', product.description);
  const price = prompt('Новая цена:', product.price);
  const image = prompt('Новая ссылка на фото:', product.image);

  if (name && description && price && image) {
    const updatedProduct = {
      name,
      description,
      price: Number(price),
      image
    };

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct)
      });

      if (response.ok) {
        renderProducts();
      } else {
        alert('Ошибка при редактировании товара');
      }
    } catch (error) {
      alert('Ошибка сети');
    }
  }
}

document.querySelector('#productForm').addEventListener('submit', addProduct);
setupImageUpload();
renderProducts();


// --- USER MANAGEMENT ---

async function getUsers() {
    try {
        const response = await fetch('/api/users');
        if (!response.ok) {
            console.error('Ошибка при получении пользователей:', response.status, response.statusText);
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка при получении пользователей (сеть или парсинг JSON):', error);
        return [];
    }
}

async function renderUsers() {
    const users = await getUsers();
    const tableBody = document.querySelector('#userTable tbody');

    if (!tableBody) {
        console.warn('Не найден элемент tbody с id "userTable tbody". Проверьте HTML структуру.');
        return;
    }

    if (!users || users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">Пользователей нет</td></tr>';
        return;
    }

    tableBody.innerHTML = users.map((user, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${user.username}</td>
            <td>${user.password}</td>
            <td>${user.name}</td>
            <td>${user.role}</td>
            <td>
                <button class="edit-user-btn action-btn" data-id="${user.id}">✏️</button>
                <button class="delete-user-btn action-btn" data-id="${user.id}">🗑️</button>
            </td>
        </tr>
    `).join('');

    // Добавляем слушатели событий для кнопок редактирования
    document.querySelectorAll('.edit-user-btn').forEach(btn =>
        btn.addEventListener('click', () => editUser(btn.dataset.id))
    );

    // Добавляем слушатели событий для кнопок удаления
    document.querySelectorAll('.delete-user-btn').forEach(btn =>
        btn.addEventListener('click', () => deleteUser(btn.dataset.id))
    );
}

async function editUser(id) {
    const users = await getUsers();
    const user = users.find(u => String(u.id) === String(id));

    if (!user) {
        alert('Пользователь с таким ID не найден.');
        return;
    }

    const username = prompt('Введите новый логин:', user.username);
    if (username === null) return;

    const name = prompt('Введите новое имя:', user.name);
    if (name === null) return;

    const role = prompt('Введите новую роль (admin или user):', user.role);
    if (role === null) return;

    const password = prompt('Введите новый пароль (оставьте пустым, чтобы не менять):', '');
    if (password === null) return;

    // Валидация введенных данных
    if (username.trim() && name.trim() && (role.trim() === 'admin' || role.trim() === 'user')) {
        const updatedUser = {
            username: username.trim(),
            name: name.trim(),
            role: role.trim()
        };

        // Добавляем пароль только если он был введен
        if (password.trim() !== '') {
            updatedUser.password = password.trim();
        }

        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedUser)
            });

            const result = await response.json();

            if (response.ok) {
                alert('Пользователь успешно обновлен!');
                renderUsers();
            } else {
                alert(`Ошибка при редактировании пользователя: ${result.error}`);
            }
        } catch (error) {
            alert('Ошибка сети при редактировании пользователя');
            console.error('Ошибка сети при редактировании пользователя:', error);
        }
    } else {
        alert('Неверные данные. Логин и имя не должны быть пустыми, а роль должна быть "admin" или "user".');
    }
}

async function deleteUser(id) {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
        return;
    }

    try {
        const response = await fetch(`/api/users/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            alert('Пользователь успешно удален!');
            renderUsers();
        } else {
            alert(`Ошибка при удалении пользователя: ${result.error}`);
        }
    } catch (error) {
        alert('Ошибка сети при удалении пользователя');
        console.error('Ошибка сети при удалении пользователя:', error);
    }
}

async function addUser(e) {
    e.preventDefault();

    const usernameInput = document.querySelector('#userLogin');
    const nameInput = document.querySelector('#userName');
    const roleInput = document.querySelector('#userRole');
    const passwordInput = document.querySelector('#userPassword');

    if (!usernameInput || !nameInput || !roleInput || !passwordInput) {
        console.error('Один или несколько элементов формы не найдены в HTML!');
        alert('Ошибка в настройке формы. Пожалуйста, проверьте HTML.');
        return;
    }

    const username = usernameInput.value.trim();
    const name = nameInput.value.trim();
    const role = roleInput.value;
    const password = passwordInput.value.trim();

    if (!username || !name || !role || !password) {
        alert('Пожалуйста, заполните все поля для добавления пользователя!');
        return;
    }

    if (role !== 'admin' && role !== 'user') {
        alert('Роль может быть только "admin" или "user"');
        return;
    }

    const newUser = {
        username: username,
        password: password,
        name: name,
        role: role
    };

    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Пользователь успешно добавлен!');
            renderUsers();
            e.target.reset();
        } else {
            alert(`Ошибка при добавлении пользователя: ${result.error}`);
        }
    } catch (error) {
        alert('Ошибка сети при добавлении пользователя');
        console.error('Ошибка сети при добавлении пользователя:', error);
    }
}

// --- Инициализация при загрузке страницы ---
document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', addUser);
    } else {
        console.warn('Не найдена форма с id "userForm". Убедитесь, что она существует в HTML.');
    }

    renderUsers();
});