const API_URL = 'http://localhost:7100';

export const login = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        // 토큰 저장
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        return data;
    } catch (error) {
        throw error;
    }
};

export const register = async (email, password, name) => {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, name }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        // 토큰 저장
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        return data;
    } catch (error) {
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

export const getAccessToken = () => {
    return localStorage.getItem('accessToken');
};

export const getRefreshToken = () => {
    return localStorage.getItem('refreshToken');
};

export const refreshAccessToken = async () => {
    try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
            throw new Error('리프레시 토큰이 없습니다.');
        }

        const response = await fetch(`${API_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        // 새로운 토큰 저장
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        return data;
    } catch (error) {
        logout();
        throw error;
    }
};

export const getCurrentUser = async () => {
    try {
        const accessToken = getAccessToken();
        if (!accessToken) {
            throw new Error('인증 토큰이 없습니다.');
        }

        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        throw error;
    }
}; 