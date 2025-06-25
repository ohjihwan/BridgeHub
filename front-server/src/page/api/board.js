import axios from "axios";

export async function getPosts(page = 1, size = 10) {
  const res = await axios.get(`/api/posts?page=${page}&size=${size}`);
  return res.data;
} 