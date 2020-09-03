export const environment = {
  production: true,
    urlAPI: (localStorage.getItem('intranet') == '1') ? 'http://172.16.1.201/api' : 'http://200.60.83.163/api',
    urlPublic: (localStorage.getItem('intranet') == '1') ? 'http://172.16.1.201/' : 'http://200.60.83.163/',
};
