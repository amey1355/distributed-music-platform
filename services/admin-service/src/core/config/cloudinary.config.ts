import cloudinary from 'cloudinary';
import { config } from './index.js';

export const configureCloudinary = () => {
    cloudinary.v2.config({
        cloud_name: config.cl_name,
        api_key: config.cl_api_key,
        api_secret: config.cl_api_secret
    });
};