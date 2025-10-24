   let users = []; // Инициализируем users пустым массивом

   async function initializeAuth() {
       try {
           const response = await fetch('../server/DB/mockUsers.json');
           if (!response.ok) {
               throw new Error(`HTTP error! status: ${response.status}`);
           }
           users = await response.json(); // Загружаем данные и сохраняем в users
           console.log('Users загружены:', users); // Для отладки
       } catch (error) {
           console.error('Ошибка при загрузке данных о пользователях:', error);
           // Обработка ошибки загрузки (например, вывод сообщения пользователю)
       }
   }

   export async function loginUser(login, password) {
       // Убедимся, что users загружены перед использованием
       if (!users) {
           console.error('Данные о пользователях еще не загружены!');
           return { success: false, error: 'Не удалось загрузить данные пользователей' };
       }

       const user = users.find(u => u.login === login && u.password === password);
       if (user) {
           localStorage.setItem('currentUser', JSON.stringify(user));
           return { success: true, user };
       }
       return { success: false, error: 'Неверный логин или пароль' };
   }

   export async function registerUser(login, password, name) {
       // Убедимся, что users загружены перед использованием
       if (!users) {
           console.error('Данные о пользователях еще не загружены!');
           return { success: false, error: 'Не удалось загрузить данные пользователей' };
       }

       if (users.find(u => u.login === login)) {
           return { success: false, error: 'Пользователь с таким логином уже существует' };
       }
       const newUser = { id: users.length + 1, login, password, name };
       users.push(newUser); // В реальной системе нужно сохранять в БД
       localStorage.setItem('currentUser', JSON.stringify(newUser));
       return { success: true, user: newUser };
   }

   export function logoutUser() {
       localStorage.removeItem('currentUser');
   }

   export function getCurrentUser() {
       const user = localStorage.getItem('currentUser');
       return user ? JSON.parse(user) : null;
   }

   // Инициализируем загрузку данных при загрузке модуля
   initializeAuth();
