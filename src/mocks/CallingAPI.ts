// api.ts
const apiUrl: string = import.meta.env.VITE_REACT_APP_API_URL as string;

console.log(apiUrl);

// Kiểu dữ liệu cho token, endpoint, data
type Token = string;
type Endpoint = string;

// Kiểu phản hồi API (có thể mở rộng tùy dự án)
export interface ApiResponse<T = any> {
    data?: T;
    message?: string;
    [key: string]: any;
}

// Hàm gọi API GET
export const fetchData = async <T = any>(
    endpoint: Endpoint,
    token?: Token
): Promise<T> => {
    try {
        const response = await fetch(`${apiUrl}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        return (await response.json()) as T;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

// Hàm gọi API POST
export const postData = async <T = any>(
    endpoint: Endpoint,
    data: Record<string, any>,
    token?: Token
): Promise<T> => {
    try {
        const response = await fetch(`${apiUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        return (await response.json()) as T;
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
};

// Hàm gọi API PUT
export const putData = async <T = any>(
    endpoint: Endpoint,
    data: Record<string, any>,
    token?: Token
): Promise<T> => {
    try {
        const response = await fetch(`${apiUrl}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        return (await response.json()) as T;
    } catch (error) {
        console.error('Error putting data:', error);
        throw error;
    }
};

// Hàm gọi API PATCH
export const patchData = async (
    endpoint: Endpoint,
    data: Record<string, any>,
    token?: Token
): Promise<void> => {
    try {
        const response = await fetch(`${apiUrl}${endpoint}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error patching data:', error);
        throw error;
    }
};

// Hàm gọi API DELETE
export const deleteData = async <T = any>(
    endpoint: Endpoint,
    token?: Token
): Promise<T> => {
    try {
        const response = await fetch(`${apiUrl}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        return (await response.json()) as T;
    } catch (error) {
        console.error('Error deleting data:', error);
        throw error;
    }
};
