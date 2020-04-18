'use strict';



const listOfAll = document.querySelector('.module__list--all');
const listOfSecected = document.querySelector('.module__list--selected');


//Drug&Drop
var DragManager = new function () {

    var dragItem = {};

    var self = this;
    console.log(self)

    function onMouseDown(e) {
        if (e.which != 1) {
            return;
        }

        var item = e.target.closest('.js-card');

        if (!item) {
            return;
        }

        dragItem.item = item;

        dragItem.downX = e.pageX;
        dragItem.downY = e.pageY;
    };

    function onMouseMove(e) {
        if (!dragItem.item) {
            return;
        }

        if (!dragItem.avatar) {

            var moveX = e.pageX - dragItem.downX;
            var moveY = e.pageY - dragItem.downY;
            console.log(moveX, moveY);

            if (Math.abs(moveX) < 3 && Math.abs(moveY) < 3) {
                return;
            }

            dragItem.avatar = createAvatar(e);

            if (!dragItem.avatar) {
                dragItem = {};
                return;
            }
            console.log('move', dragItem.avatar);
            var coords = getCoords(dragItem.avatar);
            dragItem.shiftX = dragItem.downX - coords.left;
            dragItem.shiftY = dragItem.downY - coords.top;

            startDrag(e); // отобразить начало переноса
        }

        // отобразить перенос объекта при каждом движении мыши
        dragItem.avatar.style.left = e.pageX - dragItem.shiftX + 'px';
        dragItem.avatar.style.top = e.pageY - dragItem.shiftY + 'px';
        return false;
    }

    function onMouseUp(e) {
        if (dragItem.avatar) {
            finishDrag(e);
        }
        dragItem = {};
    }

    function createAvatar() {

        var avatar = dragItem.item;
        var old = {
            parent: avatar.parentNode,
            nextSibling: avatar.nextSibling,
            position: avatar.position || '',
            left: avatar.left || '',
            top: avatar.top || '',
            zIndex: avatar.zIndex || ''
        };
        console.log('Avatar', avatar);
        avatar.rollback = function () {
            old.parent.insertBefore(avatar, old.nextSibling);
            avatar.style.position = old.position;
            avatar.style.left = old.left;
            avatar.style.top = old.top;
            avatar.style.zIndex = old.zIndex;
        };
        console.log('Avatar', avatar);
        return avatar;
    }

    function startDrag(e) {
        var avatar = dragItem.avatar;

        document.body.appendChild(avatar);
        avatar.style.zIndex = 9999;
        avatar.style.position = 'absolute';
    }

    function finishDrag(e) {

        var dropElem = findDroppable(e);


        if (!dropElem) {
            dragItem.avatar.rollback();
            self.onDragCancel(dragItem);
            console.log('я тут');
        } else {
            
            console.log('или тут', self);
            self.onDragEnd(dragItem, dropElem);
        }

    }

    function findDroppable(event) {

        dragItem.item.hidden = true;

        var elem = document.elementFromPoint(event.clientX, event.clientY);

        console.log('Drop', elem);

        dragItem.item.hidden = false;

        if (elem == null) {
            return null;
        }

        console.log('Drop', elem.closest('.module__list'));
        return elem.closest('.module__list');
    }
    document.onmousemove = onMouseMove;
    document.onmouseup = onMouseUp;
    document.onmousedown = onMouseDown;

    this.onDragEnd = function (dragItem, dropElem) {
        document.body.removeChild(dragItem.avatar);
        dragItem.item.style = 'none';
        dropElem.appendChild(dragItem.item);
    };
    this.onDragCancel = function (dragItem) {};

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