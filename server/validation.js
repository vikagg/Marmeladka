export function validateForm(login, password) {
    const isValid = login.length >= 3 && password.length >= 6;
    return { isValid };
}

export async function loginUser(login, password) {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ login, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            localStorage.setItem('currentUser', JSON.stringify(result.user));
        }
        
        return result;
    } catch (error) {
        return { success: false, error: 'Ошибка сети' };
    }
}

export async function registerUser(login, password, name) {
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ login, password, name })
        });
        
        const result = await response.json();
        
        if (result.success) {
            localStorage.setItem('currentUser', JSON.stringify(result.user));
        }
        
        return result;
    } catch (error) {
        return { success: false, error: 'Ошибка сети' };
    }
}