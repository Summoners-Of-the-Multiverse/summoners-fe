import axios from 'axios';
import { getBaseUrl } from '../../common/utils';

let instance = axios.create({
    baseURL: getBaseUrl()
});

export default instance;