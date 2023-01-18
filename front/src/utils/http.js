import axios from 'axios'


const httpCli = axios.create();
// default 설정 key 설정 등등. ..
httpCli.defaults.baseURL = 'http://127.0.0.1:10801';
// httpCli.defaults.withCredentials = true;
httpCli.defaults.timeout = 250000;


export default httpCli;


