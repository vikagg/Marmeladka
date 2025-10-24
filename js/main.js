import { validateForm } from '../server/validation.js';
import { loginUser } from '../server/auth.js'; 
import { renderProductList } from '../server/products.js';

// Для login.html

   if (document.querySelector('.mars-once')) {
       const form = document.querySelector('form');
       const loginInput = form.querySelector('input[type="text"]');
       const passwordInput = form.querySelector('input[type="password"]');
       const submitBtn = form.querySelector('button');

       form.addEventListener('submit', async (e) => { // Делаем функцию обработчика асинхронной
           e.preventDefault();
           const { isValid, loginError, passwordError } = validateForm(loginInput.value, passwordInput.value);
           if (!isValid) {
               alert(`${loginError}`);
               return;
           }

           try {
               const result = await loginUser(loginInput.value, passwordInput.value); // Используем await
               if (result.success) {
                   // Проверка на роль
                   if (result.user && result.user.rol == "admin") {
                       alert('Вход как администратор!');
                       window.location.href = 'admin.html';
                   } else {
                       alert('Вход успешен!');
                       window.location.href = 'index.html';
                   }
               } else {
                   alert(result.error);
               }
           } catch (error) {
               console.error("Ошибка при входе:", error);
               alert("Произошла ошибка при входе. Попробуйте позже."); // Дружелюбное сообщение об ошибке
           }
       });
   }

  // Для регистрации (добавьте кнопку или переключатель)
  // Аналогично, но с registerUser


// Для index.html
if (document.querySelector('.cards')) {
  const container = document.querySelector('.cards');
  renderProductList(container);
}

// Для products.html
if (document.querySelector('.product-page')) {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (productId) {
    const jsonFilePath = '../server/DB/mockProducts.json'; //  Например: 'data/products.json' или '/api/products'

    fetch(jsonFilePath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(products => {  // `products` теперь содержит данные из JSON
        const product = products.find(p => p.id == productId);

        if (product) {
          // Заполняем информацию о товаре
          document.querySelector('.product-page img').src = product.image;
          document.querySelector('.product-info h1').textContent = product.name;
          document.querySelector('.product-info p').textContent = product.description;
          document.querySelector('.product-info .price').textContent = `${product.price} ₽`; // Исправлено: используем template literals

        } else {
          console.error('Товар не найден!');
        }
      })
      .catch(error => {
        console.error('Ошибка при загрузке данных из JSON:', error);
      });

  } else {
    console.error('ID товара не указан в URL!');
  }
}
 // 1)  надо из пути взять  ID
   // 2)  по  ID  взять мармеладку (getProductById)
    // 3) найти все необходимые элементы и засунуть в них значения из мармеладки


    //  для  reg.html
    let nextId = 3;
const submitButton = document.getElementById("Button");

if (submitButton) {
    submitButton.addEventListener("click", convertToJson);
}

async function convertToJson(event) {
    event.preventDefault(); // Предотвращаем перезагрузку страницы

    let form = document.getElementById("mars-onc");
    let formData = {
        "id": nextId++, // Увеличиваем id для следующей записи
        "rol": "pol'zovatel'"
    };

    for (let i = 0; i < form.elements.length; i++) {
        let element = form.elements[i];
        if (element.type !== "submit" && element.placeholder) {
            formData[element.placeholder] = element.value;
        }
    }

    try {
        //  Чтение существующего JSON файла
        const response = await fetch('../server/db/mockUsers.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const existingData = await response.json();

        //  добавление данных
        existingData.push(formData); // Добавление новых данных формы в массив

        //  Преобразование обратно в JSON
        const jsonData = JSON.stringify(existingData, null, 2);

        //  Запуск загрузки (Это часть "сохранения" - пользователь должен вручную заменить файл)
        download('mockUsers.json', jsonData);

        form.reset(); // Очищаем форму после успешной отправки

    } catch (error) {
        console.error('Error:', error);
        alert('Error processing data.');
    }
}


function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}
// Для admin.html

