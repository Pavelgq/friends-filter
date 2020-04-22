'use strict';



const listOfAll = document.querySelector('.module__list--all');
const listOfSelected = document.querySelector('.module__list--selected');
const listDrop = document.querySelectorAll('.module__list');
const refButton = document.querySelector('.ref-button');
const saveButton = document.querySelector('.save-button');

 
const DataModel = new function() {
    
    refButton.onclick = refreshFriends;
    saveButton.onclick = saveFriends;

    const myFriends = JSON.parse(localStorage.myFriends);
    console.log(myFriends);
    const me = JSON.parse(localStorage.me);
    let listFriends = {};
    if (localStorage.listFriends !== '') {
        listFriends = JSON.parse(localStorage.listFriends);
    }

    renderLists();

    function refreshFriends() {
        authorization();

        //проверить изменения и добавить в массив измененных друзей и удалить если их нет.
    }

    function saveFriends() {
        localStorage.listFriends = JSON.stringify(listFriends);
    }

    function renderLists() {
       

        const headerInfo = document.querySelector('.module__title > h2');

        headerInfo.textContent = `Выберите друзей ${me.first_name} ${me.last_name}`;

        const template = document.querySelector('.module__friends').textContent;
        const render = Handlebars.compile(template);
        const htmlFriend = render(myFriends);
        listOfAll.innerHTML = htmlFriend;

        if (listFriends) {
            const htmlListFriends =  render(listFriends);
            listOfSelected.innerHTML = htmlListFriends;
        }
        
    }

}

//API VK 

function authorization() {

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


    (async () => {
        await auth();
        const [me] = await callAPI('users.get', {
            name_case: 'gen',
            v: 5.103
        });

        const friends = await callAPI('friends.get', {
            user_id: me.id,
            fields: 'nickname, photo_50',
            v: 5.103
        });

        
        
        localStorage.myFriends = JSON.stringify(friends);  
        if ((localStorage.listFriends === undefined) || (localStorage.me !== JSON.stringify(me))) {
            localStorage.listFriends = '';
            localStorage.me = JSON.stringify(me);
        }    
        //TODO: Если друзья уже были в массиве, то перебрать их, добавив и или удалив (сохранение порядка...). 
    })();
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

        dragItem.downX = event.pageX;
        dragItem.downY = event.pageY;

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
            this.insertBefore(dragItem.item,target);

        }else if (target.nodeName == 'UL') {
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

        if (listOfAll.className == this.className) {
            changeObject(DataModel.myFriends, dragItem.item);

        }else {
            changeObject(DataModel.listFriends, dragItem.item);
        }

       

        dragItem.item.classList.remove('js-card--empty');

            this.removeEventListener('dragover', onDragOver, false);
            
            this.removeEventListener('dragend', onDragEnd, false);
    }

    function changeObject(obj, item) {
        let nextId = '';
        if (item.nextSibling !== null) {
            nextId = item.nextSibling.dataset.number;

        }else {
            
        }
            
        
    }

    listDrop.forEach((list) => {
        list.addEventListener('dragstart', onDragStart, false);
    });
}

//Добавление и удаление по кнопке на карточке
listDrop.forEach((list) => {
    list.onclick = changeList;
});

/**
 * Функция обработчик события клика. Перехватывает нажатие на span
 * ищет целевую карточку и перемещает ее в противоположное поле
 * @param {Object} event
 */
function changeList(event) {
    if (event.target.nodeName === 'SPAN') {
        let item = event.target.closest('.js-card');

        this.removeChild(item);

        if (listOfAll.className == this.className) {
            listOfSelected.appendChild(item);
        }else {
            listOfAll.appendChild(item);
        }
    }
}
