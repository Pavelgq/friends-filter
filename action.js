'use strict';



const listOfAll = document.querySelector('.list-of-all');
const listOfSecected = document.querySelector('.list-of-selected');

//API VK 

VK.init({
    apiId: 7414392
});

function auth() {
    
    return new Promise((resolve, reject) => {
        VK.Auth.login(data => {
            if (data.session) {
                resolve();
            } else {
                reject(new Error('Авторизация не удалась'));
            }
        }, 2 | 4);
    });

}

// auth().then(() => {
//     VK.api('users.get', {fields: 'photo_50', name_case: 'gen'}, (response)=> console.log('Успех', response));
// });

function callAPI(method, params) {
    return new Promise((resolve, reject) => {
        VK.api(method, params, (data) => {
            if (data.error) {

                reject(data.error);
            } else {
                resolve(data.response);
            }
        });
    });
}

(async () => {
    await auth();
    const [me] = await callAPI('users.get', {
        name_case: 'gen',
        v: 5.103
    });

    const headerInfo = document.querySelector('.window-title > h2');

    headerInfo.textContent = `Выберите друзей ${me.first_name} ${me.last_name}`;

    const friends = await callAPI('friends.get', {
        user_id: me.id,
        fields: 'nickname, photo_50',
        v: 5.103
    });
   
    const template = document.querySelector('#user-template').textContent;
    const render = Handlebars.compile(template);
    const htmlFriend = render(friends);
    listOfAll.innerHTML = htmlFriend;
    console.log(htmlFriend);
})();





// const template = document.querySelector('#user-template').textContent;

//     const render = Handlebars.compile(template);

//     const htmlFriend = render(friends);

//     listOfAll.innerHTML = htmlFriend;