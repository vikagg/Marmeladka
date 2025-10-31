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

async function getProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error('Ошибка:', error);
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
    const products = await getProducts();
    const updatedProducts = products.filter(p => String(p.id) !== String(id));
    
    try {
      await fetch('/api/products/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProducts)
      });
      renderProducts();
    } catch (error) {
      alert('Ошибка при удалении товара');
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
    product.name = name;
    product.description = description;
    product.price = Number(price);
    product.image = image;
    
    try {
      await fetch('/api/products/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(products)
      });
      renderProducts();
    } catch (error) {
      alert('Ошибка при редактировании товара');
    }
  }
}

document.querySelector('#productForm').addEventListener('submit', addProduct);
setupImageUpload();
renderProducts();