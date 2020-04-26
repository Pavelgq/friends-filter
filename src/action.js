'use strict';

const listOfAll = document.querySelector('.module__list--all');
const listOfSelected = document.querySelector('.module__list--selected');
const listDrop = document.querySelectorAll('.module__list');
const refButton = document.querySelector('.ref-button');
const saveButton = document.querySelector('.save-button');
const filterAll = document.querySelector('.filter__fueld--all');
const filterSelected = document.querySelector('.filter__fueld--selected');

let myFriends,
    me = [];
let myFriendsId = [];


/**
 * Функция обновляет друзей сравнивая новые данные с сервера
 * с теми данными, что уже есть. Не меняет порядок и положение карточек
 */
function refreshFriends() {

    authorization(false).then(() => {
        let refFriends = JSON.parse(localStorage.myFriends);
        let refFriendsId = [];

        refFriends.items.forEach(function (item) {
            refFriendsId.push(item.id);
        });

        for (let i = 0; i < myFriends.items.length; i++) {
            let index = refFriendsId.indexOf(myFriends.items[i].id);
            if (index === -1) {
                myFriends.items.splice(i, 1);
            } else {
                refFriends.items.splice(index, 1);
                refFriendsId.splice(index, 1);
            }
        }

        for (let i = 0; i < refFriends.items.length; i++) {
            myFriends.items.splice(myFriends.length - 1, 0, refFriends.items[i]);
        }

        myFriends.items.forEach(function (item) {
            myFriendsId.push(item.id);
        });

        localStorage.myFriends = JSON.stringify(myFriends);

    });
}

/**
 * Функция сохраняет изменения
 * Выбранных друзей и измененный порядок
 */
function saveFriends() {
    let newSave = [];
    let selected = listOfSelected.children;
    let all = listOfAll.children;


    for (let i = 0; i < all.length; i++) {
        let id = all[i].dataset.number;
        let index = myFriendsId.indexOf(+id);
        myFriends.items[index]['selectNumber'] = -1;
        newSave.push(myFriends.items[index]);
    }
    for (let i = 0; i < selected.length; i++) {
        let id = selected[i].dataset.number;
        let index = myFriendsId.indexOf(+id);
        myFriends.items[index]['selectNumber'] = i;
        newSave.push(myFriends.items[index]);
    }
    myFriends.items = newSave;

    myFriends.items.forEach(function (item) {
        myFriendsId.push(item.id);
    });

    localStorage.myFriends = JSON.stringify(myFriends);

    alert('Данные сохранены');
}

/**
 * Функция преобразует данные в html-карточки и добавляет в колонку
 */
function renderLists() {
    if (localStorage.myFriends !== undefined) {
        myFriends = JSON.parse(localStorage.myFriends);
        me = JSON.parse(localStorage.me);
    } else {
        authorization(true);
        return 0;
    }

    myFriends.items.forEach(function (item) {
        myFriendsId.push(item.id);
    });
    const headerInfo = document.querySelector('.module__title > h2');

    headerInfo.textContent = `Выберите друзей ${me.first_name} ${me.last_name}`;

    const template = document.querySelector('.module__friends').textContent;
    const render = Handlebars.compile(template);

    let myFriendsSelect = {
        items: []
    };

    let myFriendsAll = {
        items: []
    };

    for (let i = 0; i < myFriends.items.length; i++) {
        if (myFriends.items[i].selectNumber !== -1 && myFriends.items[i].hasOwnProperty('selectNumber')) {
            myFriendsSelect.items[myFriends.items[i].selectNumber] = myFriends.items[i];

        } else {
            myFriendsAll.items.push(myFriends.items[i]);
        }
    }


    const htmlFriend = render(myFriendsAll);
    const htmlSecected = render(myFriendsSelect);
    listOfAll.innerHTML = htmlFriend;
    listOfSelected.innerHTML = htmlSecected;
}

renderLists();
refButton.onclick = refreshFriends;
saveButton.onclick = saveFriends;


//API VK 

/**
 * Функция авторизации и получения данных из VK API 
 * flag если нужно отрендерить после получения данных
 * @param {boolean} flag
 */
async function authorization(flag) {

    VK.init({
        apiId: 7416612
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


    await auth();

    const [meInfo] = await callAPI('users.get', {
        name_case: 'gen',
        v: 5.103
    });
    const friends = await callAPI('friends.get', {
        user_id: meInfo.id,
        fields: 'nickname, photo_50',
        v: 5.103
    });

    localStorage.me = JSON.stringify(meInfo);
    localStorage.myFriends = JSON.stringify(friends);

    if (flag) {
        renderLists();
    }

}

//Drug&Drop
const DragManager = new function () {

    var dragItem = {};

    var self = this;

    /**
     * Функция находит переносимый элемент и запускает обработчики событий для контейнеров
     * куда требуется этот элемент добавить 
     * @param {Object} event
     */
    function onDragStart(event) {

        if (event.which != 1) {
            return;
        }

        let item = event.target.closest('.js-card');

        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('Text', item.textContent); //???

        dragItem.item = item;

        dragItem.avatar = item.cloneNode(true);

        listDrop.forEach((list) => {
            list.ondragover = onDragOver;
            list.ondragend = onDragEnd;
        });

        setTimeout(function () {
            dragItem.item.innerHTML = '';
            dragItem.item.classList.add('js-card--empty');
        }, 0);
    }

    /**
     * Функция определяет место вставки drag элемента между соседями 
     * @param {Object} event
     */
    function onDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        var target = event.target;
        if (target && target !== dragItem.item && target.nodeName == 'LI') {
            this.insertBefore(dragItem.item, target);

        } else if (target.nodeName == 'UL') {
            this.appendChild(dragItem.item);
        }
    }

    /**
     * Функция добавляет drag елементу содержимое для отображения его в месте drop'а
     * @param {Object} event
     */
    function onDragEnd(event) {
        event.preventDefault();

        dragItem.item.innerHTML = dragItem.avatar.innerHTML;
        dragItem.item.classList.remove('js-card--empty');

        this.removeEventListener('dragover', onDragOver, false);
        this.removeEventListener('dragend', onDragEnd, false);
    }

    function contains(arr, elem) {
        return arr.findIndex((i) => i.id === elem) != -1;
    }


    listDrop.forEach((list) => {
        list.addEventListener('dragstart', onDragStart, false);
    });
}

//Добавление и удаление по кнопке на карточке
listDrop.forEach((list) => {
    list.onclick = changeList;
});

filterAll.oninput = searchFriends;
filterSelected.oninput = searchFriends;


/**
 * Функция обработчик события клика. Перехватывает нажатие на span
 * ищет целевую карточку и перемещает ее в противоположное поле
 * @param {Object} event
 */
function changeList(event) {
    if (event.target.nodeName === 'BUTTON') {
        let item = event.target.closest('.js-card');

        this.removeChild(item);

        if (listOfAll.className == this.className) {
            listOfSelected.appendChild(item);
        } else {
            listOfAll.appendChild(item);
        }
    }
}

/**
 * Функция обработчик события ввода в текстовое поле
 * Скрывает друзей, чье имя или фамилия не содердит указанный в поле текст
 */
function searchFriends() {
    let items = '';
    for (let i = 0; i < this.classList.length; i++) {
        if (isMatching(this.classList[i], 'filter__fueld--all')) {
            items = listOfAll.children;
            break;
        }
    }

    if (items === '') {
        items = listOfSelected.children;
    }

    for (let i = 0; i < items.length; i++) {
        let itemName = items[i].querySelector('.item__name').textContent;
        if (!isMatching(itemName, this.value)) {
            items[i].style.display = 'none';
        } else {
            items[i].style.display = 'flex';
        }
    }

}

/**
 * Функция ищет подстроку в строке и не чувствительна к регистру
 * @param {string} full
 * @param {string} chunk
 */
function isMatching(full, chunk) {
    return full.toLowerCase().includes(chunk.toLowerCase());

}