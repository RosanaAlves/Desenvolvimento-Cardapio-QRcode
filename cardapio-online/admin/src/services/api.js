const API_BASE = 'http://localhost:8000/api';

class ApiService {
  async get(url) {
    try {
      const response = await fetch(`${API_BASE}${url}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async post(url, data) {
    try {
      const response = await fetch(`${API_BASE}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Métodos específicos para suas rotas
  async getCategories() {
    return this.get('/categorias');
  }

  async getProducts() {
    return this.get('/produtos');
  }

  async getProductsByCategory(categoryId) {
    return this.get(`/categorias/${categoryId}/produtos`);
  }

  async getProduct(id) {
    return this.get(`/produtos/${id}`);
  }

  async createOrder(orderData) {
    return this.post('/pedidos', orderData);
  }

  async getTables() {
    return this.get('/mesas');
  }
}

export default new ApiService();