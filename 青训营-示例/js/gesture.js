function enableGesture(element) {
    let contexts = [];
    const mouse_type = Symbol("mouse");
    if (!("ontouchstart" in document)) {
        // PC
        element.addEventListener("mousedown", (event) => {
            let move = (event) => {
                onMove(event, contexts[mouse_type]);
            };
            let end = (event) => {
                onEnd(event, contexts[mouse_type]);
                document.removeEventListener("mousemove", move);
            }
            document.addEventListener("mousemove", move);
            contexts[mouse_type] = {};
            onStart(event, contexts[mouse_type]);
            document.addEventListener("mouseup", end, { once: true });
        });
    }
    element.addEventListener("touchstart", (event) => {
        for (let touch of event.changedTouches) {
            contexts[touch.identifier] = {};
            onStart(touch, contexts[touch.identifier]);
        }
    });
    element.addEventListener("touchmove", (event) => {
        const stop = ()=>{
            event.preventDefault();
        }
        for (let touch of event.changedTouches) {
            touch.stop = stop;
            onMove(touch, contexts[touch.identifier]);
        }
    });
    element.addEventListener("touchend", (event) => {
        for (let touch of event.changedTouches) {
            onEnd(touch, contexts[touch.identifier]);
            delete contexts[touch.identifier];
        }
    });

    let onStart = (point, context) => {
        element.dispatchEvent(Object.assign(new CustomEvent('start'), {
            startX: point.clientX,
            startY: point.clientY,
            clientX: point.clientX,
            ClientY: point.clientY
        }));
        context.startX = point.clientX;
        context.startY = point.clientY;
        context.isTap = true; // 点击
        context.isPan = false; // 滑屏
        context.isPress = false; // 长按
        context.timoutHandler = setTimeout(() => {
            if (context.isPan) return;
            context.isTap = false;
            context.isPress = true;
            element.dispatchEvent(Object.assign(new CustomEvent('pressstart'), {
                clientX: point.clientX,
                ClientY: point.clientY
            }))
        }, 300);
    };
    let onMove = (point, context) => {
        let dx = point.clientX - context.startX;
        let dy = point.clientY - context.startY;
        if (!context.isPan && dx ** 2 + dy ** 2 > 100) {
            clearTimeout(context.timoutHandler);
            context.isTap = false;
            context.isPan = true;
            context.isPress = false;
            element.dispatchEvent(Object.assign(new CustomEvent("panstart"), {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                stop: point.stop
            }));
            if(context.isPress){
                element.dispatchEvent(new CustomEvent('presscancel'))
            }
            return ;
        }
        if (context.isPan) {
            element.dispatchEvent(Object.assign(new CustomEvent("pan"), {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                stop: point.stop
            }));
        }
        element.dispatchEvent(Object.assign(new CustomEvent("move"), {
            clientX: point.clientX,
            clientY: point.clientY
        }))
    };
    let onEnd = (point, context) => {
        clearTimeout(context.timoutHandler);
        if (context.isPan) {
            element.dispatchEvent(Object.assign(new CustomEvent('panend'), {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY
            }))
        }
        if (context.isTap) {
            element.dispatchEvent(Object.assign(new CustomEvent("tap"), {
                clientX: point.clientX,
                clientY: point.clientY
            }));
        }
        if (context.isPress) {
            element.dispatchEvent(Object.assign(new CustomEvent("pressend"), {
                clientX: point.clientX,
                clientY: point.clientY
            }));
        }
        element.dispatchEvent(Object.assign(new CustomEvent("end"), {
            clientX: point.clientX,
            clientY: point.clientY
        }))
    }
}

