var DragManager = new function () {

    var dragItem = {};

    var self = this;

    function onMouseDown(e) {
        if (e.which != 1) {
            return;
        }
        

        var item = e.target.closest('.js-card');

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('Text', item.textContent);

        if (!item) {
            return;
        }

        dragItem.item = item;

        dragItem.downX = e.pageX;
        dragItem.downY = e.pageY;

        dragItem.item.addEventListener('dragover', _onDragOver, false);


    };

    function onMouseMove(e) {
        if (!dragItem.item) {
            return;
        }

        if (!dragItem.avatar) {

            var moveX = e.pageX - dragItem.downX;
            var moveY = e.pageY - dragItem.downY;

            if (Math.abs(moveX) < 3 && Math.abs(moveY) < 3) {
                return;
            }

            dragItem.avatar = createAvatar(e);

            if (!dragItem.avatar) {
                dragItem = {};
                return;
            }
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
        avatar.rollback = function () {
            old.parent.insertBefore(avatar, old.nextSibling);
            avatar.style.position = old.position;
            avatar.style.left = old.left;
            avatar.style.top = old.top;
            avatar.style.zIndex = old.zIndex;
        };
        return avatar;
    }

    function startDrag(e) {
        var avatar = dragItem.avatar;

        document.body.appendChild(avatar);
        avatar.style.zIndex = 9999;
        avatar.style.position = 'absolute';
        avatar.style.backgroundColor = '#fff';
        
       

    }

    function finishDrag(e) {

        var dropElem = findDroppable(e);

        dragItem.avatar.rollback();
        if (!dropElem) {
            dragItem.avatar.rollback();
            self.onDragCancel(dragItem);
        } else {
            self.onDragEnd(dragItem, dropElem);
        }

    }

    function findDroppable(event) {

        dragItem.item.hidden = true;
        var elem = null;
        listDrop.forEach( (list) => {
            var container = list.getBoundingClientRect();
            
            if ((event.clientX > container.x) && (event.clientX < container.x+container.width) &&
                (event.clientY > container.y) && (event.clientY < container.y+container.width)) {
                    elem = list;
                }


        });
        // var elem = document.elementFromPoint(event.clientX, event.clientY);

        // console.log('Drop', elem);

        dragItem.item.hidden = false;

        if (elem == null) {
            return null;
        }

        console.log('Drop', elem.closest('.module__list'));
        return elem.closest('.module__list');
    }

   

    document.onmousemove = onMouseMove;
    document.onmouseup = onMouseUp;
    document.ondragstart = onMouseDown;

    this.onDragEnd = function (dragItem, dropElem) {
       
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