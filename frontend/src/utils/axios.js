import axios from 'axios';

// 1. 创建一个 Axios 实例
const apiClient = axios.create({
  // 未来你的 FastAPI 跑在 8000 端口，这里设置基础 URL
  // 如果环境变量里有配置就用环境变量，没有就默认用本地的 8000 端口
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api', 
  timeout: 10000, // 请求超时时间设置为 10 秒
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. 请求拦截器 (Request Interceptor)
// 就像发快递前，自动给你贴上寄件人标签（Token）
apiClient.interceptors.request.use(
  (config) => {
    // 假设未来你把用户的 token 存在 localStorage 里
    const token = localStorage.getItem('dfs_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. 响应拦截器 (Response Interceptor)
// 就像收快递时，自动帮你拆开外包装，或者如果快递丢了（报错）统一弹窗提示
apiClient.interceptors.response.use(
  (response) => {
    // 直接返回数据部分，这样你在页面里就不需要每次都写 res.data 了
    return response.data;
  },
  (error) => {
    // 如果后端返回 401 (未授权)，说明 token 过期了，可以直接踢回登录页
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized! Redirecting to login...');
      // TODO: 未来在这里加入清除本地 token 和跳转登录页的逻辑
      localStorage.removeItem('dfs_token');
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default apiClient;