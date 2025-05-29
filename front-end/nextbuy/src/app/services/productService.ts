import axios from 'axios';

const API_URL = 'http://localhost:4001';


export async function getAllProducts() {
  const res = await axios.get(`${API_URL}/products`);
  return res.data;
}


export async function getProductById(id: string) {
  const res = await axios.get(`${API_URL}/products/${id}`)
  return res.data;
}