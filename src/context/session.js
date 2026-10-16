// Simulasi sesi penghuni yang sedang login (belum ada backend)
export const KAMAR_PENGHUNI = '101';

const PWD_KEY = 'password_penghuni';
export const DEFAULT_PASSWORD = 'penghuni123';

export const getPassword = () => localStorage.getItem(PWD_KEY) || DEFAULT_PASSWORD;
export const setPassword = (pwd) => localStorage.setItem(PWD_KEY, pwd);

