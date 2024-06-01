const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3001;

const COMPANIES = ["AKZ", "ELP", "SNP", "HYN", "420"];
const BASE_API_URL = 'http://20.244.56.144/test';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE3MjI0NzU3LCJpYXQiOjE3MTcyMjQ0NTcsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjYyNzViMGQ3LTZmODYtNGFhYy05MTJlLWRjOGNmMjU1Njc3OSIsInN1YiI6IjIxSVQzMDAxQHJnaXB0LmFjLmluIn0sImNvbXBhbnlOYW1lIjoiQWJoaXJhaiIsImNsaWVudElEIjoiNjI3NWIwZDctNmY4Ni00YWFjLTkxMmUtZGM4Y2YyNTU2Nzc5IiwiY2xpZW50U2VjcmV0IjoiaE5ySXlqZUFVbWpLVVlEayIsIm93bmVyTmFtZSI6IkFiaGlyYWprYXIiLCJvd25lckVtYWlsIjoiMjFJVDMwMDFAcmdpcHQuYWMuaW4iLCJyb2xsTm8iOiIxIn0.4Nh3h3ZJeJrSHXEd78tn8-umzAdMzhz0XrkF-xIkcmY';

app.use(express.json());

app.get('/categories/:category/products', async (req, res) => {
  const { category } = req.params;
  const { n = 10, page = 1, sort = 'price', order = 'asc' } = req.query;

  try {
    const allProducts = [];
    for (const company of COMPANIES) {
      const response = await axios.get(`${BASE_API_URL}/companies/${company}/categories/${category}/products`, {
        headers: {
          Authorization: `${TOKEN}`
        },
        params: {
          top: 10,
          minPrice: 1,
          maxPrice: 10000
        }
      });
      const products = response.data.map((product, index) => ({
        ...product,
        id: `${product.productName}-${index}-${company}`,
        company,
      }));
      allProducts.push(...products);
    }

    // Sorting logic
    const sortedProducts = allProducts.sort((a, b) => {
      if (order === 'asc') {
        return a[sort] - b[sort];
      }
      return b[sort] - a[sort];
    });

    // Pagination logic
    const startIndex = (page - 1) * n;
    const endIndex = startIndex + parseInt(n);
    const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

    res.json(paginatedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Server error');
  }
});

app.get('/categories/:category/products/:productId', async (req, res) => {
  const { category, productId } = req.params;

  try {
    const allProducts = [];
    for (const company of COMPANIES) {
      const response = await axios.get(`${BASE_API_URL}/companies/${company}/categories/${category}/products`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`
        },
        params: {
          top: 10,
          minPrice: 1,
          maxPrice: 10000
        }
      });
      const products = response.data.map((product, index) => ({
        ...product,
        id: `${product.productName}-${index}-${company}`,
        company,
      }));
      allProducts.push(...products);
    }

    const product = allProducts.find(prod => prod.id === productId);

    if (product) {
      res.json(product);
    } else {
      res.status(404).send('Product not found');
    }
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
