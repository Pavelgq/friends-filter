'use strict';



const listOfAll = document.querySelector('.module__list--all');
const listOfSecected = document.querySelector('.module__list--selected');


//Drug&Drop

// listOfAll.addEventListener('mousedown', (e) => {
//     dragAndDrop(e.target);
    

// });


const dragAndDrop = () => {
    const item = document.querySelector(".js-card");
    const dropPlace = document.querySelectorAll('.module__list');

    const dragStart = function () {
        setTimeout(() => {
            item.classList.add('visually-hidden');
        }, 0);
    };

    const dragEnd = function () {
        setTimeout(() => {
            item.classList.remove('visually-hidden');
        }, 0);
    };

    item.addEventListener('dragstart', dragStart);
    item.addEventListener('dragend', dragEnd);
}





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
/**
 * Вызов VK API
 * @param {string} method
 * @param {Object} params   
 */
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

    const headerInfo = document.querySelector('.module__title > h2');

    headerInfo.textContent = `Выберите друзей ${me.first_name} ${me.last_name}`;

    const friends = await callAPI('friends.get', {
        user_id: me.id,
        fields: 'nickname, photo_50',
        v: 5.103
    });
   
    const template = document.querySelector('.module__friends').textContent;
    const render = Handlebars.compile(template);
    const htmlFriend = render(friends);
    listOfAll.innerHTML = htmlFriend;
    
    
    console.log(htmlFriend);
})();

if (document.querySelector('.js-card') !== 'undefined') {
    dragAndDrop();
}





