'use strict';



const listOfAll = document.querySelector('.module__list--all');

const listDrop = document.querySelectorAll('.module__list');


//Drug&Drop
const DragManager = new function () {

    var dragItem = {};

    var self = this;

    /**
     * Функция начала переноса элемента
     * @param {Object} event
     */
    function onDragStart(event) {
       
        if (event.which != 1) {
            return
        }

        let item = event.target.closest('.js-card');

        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('Text', item.textContent); //???

        dragItem.item = item;

        dragItem.downX = event.pageX;
        dragItem.downY = event.pageY;

        dragItem.avatar = item.cloneNode(true);

        console.log('  ', event)

        listDrop.forEach((list) => {
            list.ondragenter = onDragEnter;
            list.ondragleave = onDragLeave;
            list.ondragover = onDragOver;
            list.ondragend = onDragEnd;
            list.ondrop = onDrop;
        });


        setTimeout(function () {
            
            // Если выполнить данное действие без setTimeout, то
            // перетаскиваемый объект, будет иметь этот класс.
            dragItem.item.innerHTML = '';
            console.log(dragItem);
            dragItem.item.classList.add('js-card--empty');

        }, 0);
    }

    /**
     * Функция вызывается, когда
     * @param {Object} event
     */
    function onDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        var target = event.target;
        if (target && target !== dragItem.item && target.nodeName == 'LI') {
            // Сортируем
            this.insertBefore(dragItem.item,target);

        }else if (target.nodeName == 'UL') {
            this.appendChild(dragItem.item);
        }
    }

    /**
     * 
     * @param {Object} event 
     */
    function onDragEnter(e) {
        console.log('enter');
    }

    /**
     * 
     * @param {Object} event 
     */
    function onDragLeave(event) {
        console.log('leave');
    }


    /**
     * Функция вызывается, когда
     * @param {Object} event
     */
    function onDragEnd(event) {
        event.preventDefault();

        dragItem.item.innerHTML = dragItem.avatar.innerHTML;
        dragItem.item.classList.remove('js-card--empty');

        listDrop.forEach((list) => {
            list.removeEventListener('dragover', onDragOver, false);
            
            list.removeEventListener('dragend', onDragEnd, false);
        });

        console.log(dragItem.item);
    }
   
    /**
     * 
     */
    function onDrop(event) {
        console.log(event);
        // event.target.appendChild(dragItem.item);
    }

    listDrop.forEach((list) => {
        list.addEventListener('dragstart', onDragStart, false);
    });
    

}

function getCoords(elem) { // кроме IE8-
    var box = elem.getBoundingClientRect();

    return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset
    };

}
//API VK 

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


if (localStorage.myFriend === undefined) {


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

        if (localStorage.myFriend === undefined) {
            localStorage.myFriend = htmlFriend;
        }


    })();
} else {
    listOfAll.innerHTML = localStorage.myFriend;

};