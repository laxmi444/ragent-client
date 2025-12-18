// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Basic API client funcstion with authentication support

export const apiClient = {
    get: async (endpoint: string, token?: string | null) => {
        const headers: HeadersInit = {}; // we need to attach the token to the request headers
    
        if(token){
            headers["Authorization"] = `Bearer ${token}`
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`,{ // // if we do not add ${endpoint}, it will work only for one API.
            headers,
        });

        if(!response.ok) {
            throw new Error(`API Error: ${response.status}`)
        }

        return response.json();
    },

    post: async (endpoint: string, data: any, token?: string | null) => {
        const headers: HeadersInit = {  // we need to attach the token to the request headers
            "Content-Type": "application/json"
        }; 
    
        if(token){
            headers["Authorization"] = `Bearer ${token}`
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`,{ // // if we do not add ${endpoint}, it will work only for one API.
            method: "POST",
            headers,
            body: JSON.stringify(data),
        });

        if(!response.ok) {
            throw new Error(`API Error: ${response.status}`)
        }

        return response.json();
    },
    delete: async (endpoint: string, token?: string | null) => {
        const headers: HeadersInit = {}; // we need to attach the token to the request headers
    
        if(token){
            headers["Authorization"] = `Bearer ${token}`
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`,{ // // if we do not add ${endpoint}, it will work only for one API.
            headers,
            method: "DELETE",
        });

        if(!response.ok) {
            throw new Error(`API Error: ${response.status}`)
        }

        return response.json();
    },
};