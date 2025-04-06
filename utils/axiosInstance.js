import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://8080-idx-campus-pulse-1743834528776.cluster-6dx7corvpngoivimwvvljgokdw.cloudworkstations.dev/api",
  timeout: 10000,
});

export default axiosInstance;