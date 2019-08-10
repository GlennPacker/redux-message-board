import { generate as id } from 'shortid';

const waitTime = 500;

export const get = (url, cb) => {
    setTimeout(() => {
        cb(id());
    }, waitTime)
}