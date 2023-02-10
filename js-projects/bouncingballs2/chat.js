let chats = [];

const anonymous = `<span style="color:darkgray"> (Anonymous) </span>`;

const specials = {
    ":coffee:": `<img src="https://upload.wikimedia.org/wikipedia/commons/4/45/A_small_cup_of_coffee.JPG" class="chatImage"/>`,
    "crowdventure": `<a href="http://crowdventure.me/">crowdventure</a>`,
    ":love:": `<img src="https://www.eharmony.co.uk/dating-advice/wp-content/uploads/2018/04/whatislove-960x640.jpg" class="chatImage"/>`,
    "josh": `<span style="color: red">chad</span>`,
    "ben": `<span style="color: red">chad</span>`,
    "dom": `<span style="color: red">chad</span>`,
    "evan": `<span style="color: red">chad</span>`,
    "soph": `<span style="color: red">chad</span>`,
    "diego": `<span style="color: red">chad</span>`,
    "marissa": `<span style="color: red">chad</span>`,
    "herb": `<span style="color: red">chad</span>`,
    "andrew": `<span style="color: red">chad</span>`,
    ":dylan:": `<img src="https://resizing.flixster.com/Gc8BERNydw7dUYBPSG0-BFNk5SA=/506x652/v2/https://flxt.tmsimg.com/v9/AllPhotos/166890/166890_v9_bb.jpg" class="chatImage"/>`,
    "wally": `<span style="color: blue; text-shadow: 5px 5px white;">thad</span>`,
    "__": `<i>`,
    "**": `<b>`
};

const url = 'https://4r52fybt27.execute-api.us-east-1.amazonaws.com/dev/';
const maxChatLength = 140;
const maxUserLength = 20;

$(document).ready(function() {
    handleButtons();
    receiveChats();
});

let hasNewPage = false;

const receiveChats = () => {
    let keepTrying = true;

    let page = 1;
    let newPage = false;

    const chatBox = document.getElementById('chatBox');

    const checkChats = () => {
        // alert("Checking for chats");
        fetch(url + '?page=' + page)
            .then(response =>
                response.json()
            )
            .then(data => {
                chats = data.chats;
                if (page > data.page) {
                    page = data.page;
                    hasNewPage = false;
                } else if (newPage) {
                    page++;
                    newPage = false;
                    hasNewPage = true;
                }
                drawChat();
            }).catch(() => {
                keepTrying = false;
            });
        if (keepTrying) setTimeout(checkChats, 1000);
        else setTimeout(checkChats, 10000);
    };

    chatBox.onscroll = function() {
        if (chatBox.scrollTop <= 0 && chatBox.scrollHeight > chatBox.offsetHeight) {
            newPage = true;
        }
    }
    setTimeout(() => chatBox.scrollTop = chatBox.scrollHeight - chatBox.offsetHeight, 1000);

    checkChats();
}

let verified = 0;

const diff = (A, B) => {
    if (A.length === 0) return [];
    if (B.length === 0) return A;
    if (A[0].msg === B[0].msg) return diff(A.slice(1), B.slice(1));
    return [A[0], ...diff(A.slice(1), B)];
}

let last = "";

const emoji = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])+$/;

const chatRegex = /^[\w :]+$/;


const replaceSpecials = (message) => {
    const replaceSet = {};
    for (let string of Object.keys(specials)) {
        for (let index of findAll(message, string)) {
            replaceSet[index] = [index, string.length, specials[string]];
        }
    }
    for (let replacement of Object.keys(replaceSet).map(index => replaceSet[index]).sort((a, b) => b[0] - a[0])) {
        message = message.slice(0, replacement[0]) + replacement[2] + message.slice(replacement[0] + replacement[1]);

    }
    return message;
}

const findAll = (message, string, i = 0) => {
    if (string.length > message.length) return [];
    if (message.slice(0, string.length).toLowerCase() === string.toLowerCase()) return [i, ...findAll(message.slice(string.length), string, i + string.length)];
    return findAll(message.slice(1), string, i + 1);
}

const sendChat = (user, message) => {
    if (message.length > 0) {
        if (message.length > maxChatLength) {
            alert("Chats must be less than " + maxChatLength + " characters long!");
            return;
        }
        const newChat = {};
        if (user) newChat.user = user;
        newChat.msg = message.replace(/</g, "&lt;");
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newChat)
        });
        chats.push(newChat);

        drawChat();

        last = document.getElementById('text').value;
        document.getElementById('text').value = '';
        const chatBox = document.getElementById('text');
        setTimeout(() => chatBox.scrollTop = chatBox.scrollHeight - chatBox.offsetHeight, 500);
        receiveChats();
    }
}

let oldHeight = 0;

const drawChat = () => {
    if (chats.length === 0) return;
    const chatBox = document.getElementById('chatBox');

    const isAtBottom = chatBox.scrollTop >= chatBox.scrollHeight - chatBox.offsetHeight;
    chatBox.innerHTML = chats.map(({ user, msg }) => `<div style="padding-left: 1.5em;text-indent:-1.5em; padding-bottom: 0.5em;" class="message">${user || anonymous} > <span style="color:lightgray;">${replaceSpecials(msg)}</span></div>`).join("");

    if (isAtBottom) chatBox.scrollTop = chatBox.scrollHeight - chatBox.offsetHeight;
    else if (hasNewPage) {
        // alert('newpage');

        oldHeight = chatBox.scrollHeight;
        setTimeout(() => {
            chatBox.scrollTop += chatBox.scrollHeight - oldHeight - 100;
        }, 1000);
        hasNewPage = false;
    }
}

const handleButtons = () => {
    window.chatOpen = false;
    let timeSinceMove = null;

    const closeButton = document.getElementById('closeChat');

    closeButton.onmouseover = function() {
        closeButton.style.backgroundColor = "#bb000077";
    }
    closeButton.onmouseout = function() {
        closeButton.style.backgroundColor = "#ff000077";
    }
    closeButton.onmousedown = function() {
        closeButton.style.backgroundColor = "#99000077";
    }
    closeButton.onmouseup = function() {
        closeButton.style.backgroundColor = "#bb000077";
        if (closeButton.style.opacity === '1') setChatState(false);
    }

    closeButton.ontouchstart = closeButton.onmousedown;
    closeButton.ontouchend = closeButton.onmouseup;

    const sendButton = document.getElementById('send');

    sendButton.onmouseover = function() {
        sendButton.style.backgroundColor = "#bbbbbb";
    }
    sendButton.onmouseout = function() {
        sendButton.style.backgroundColor = "#ffffff";
    }
    sendButton.onmousedown = function() {
        sendButton.style.backgroundColor = "#999999";
    }
    sendButton.onmouseup = function() {
        sendButton.style.backgroundColor = "#bbbbbb";
        sendChat(undefined, document.getElementById('text').value);
    }


    sendButton.ontouchstart = sendButton.onmousedown;
    sendButton.ontouchend = sendButton.onmouseup;

    window.onkeydown = function(e) {
        if (e.key === 'Enter' && window.chatOpen && document.getElementById('text') == document.activeElement) {
            sendChat(undefined, document.getElementById('text').value);
            sendButton.style.backgroundColor = "#999999";
        }
        if (e.key === 'ArrowLeft' && window.chatOpen && document.getElementById('text').selectionStart === 0) {
            setChatState(false);
        }
        if (e.key === 'ArrowUp' && window.chatOpen) {
            document.getElementById('text').value = last;
            document.getElementById('text').selectionStart = last.length;
        }
        if (e.key === 'ArrowRight' && !window.chatOpen) {
            document.getElementById('text').selectionStart = document.getElementById('text').value.length;
            setChatState(true);
        }
    }

    window.onkeyup = function(e) {
        if (e.key === 'Enter') {
            sendButton.style.backgroundColor = "#ffffff";
        }
    }

    const chatOpenButton = document.getElementById('openChat');

    chatOpenButton.onmouseover = function() {
        chatOpenButton.style.backgroundColor = "#00000066";
    }
    chatOpenButton.onmouseout = function() {
        chatOpenButton.style.backgroundColor = "#00000033";
    }
    chatOpenButton.onmousedown = function() {
        chatOpenButton.style.backgroundColor = "#00000099";
    }
    chatOpenButton.onmouseup = function() {
        chatOpenButton.style.backgroundColor = "#00000033";
        setChatState(!window.chatOpen);
    }


    chatOpenButton.ontouchstart = chatOpenButton.onmousedown;
    chatOpenButton.ontouchend = chatOpenButton.onmouseup;

    const wait = 1000;

    window.onmousedown = function() {
        mouseEvent();
    }

    window.onmousemove = function(e) {
        mouseEvent();

        if (e.x < canvas.width / 4 && e.y < canvas.height / 2 && (!window.chatOpen || !window.phoneScreen)) {
            document.getElementById('controls').style.opacity = "1";
        } else {
            document.getElementById('controls').style.opacity = "0";
        }
    }

    window.onmouseout = function(e) {
        if (!window.chatOpen && !window.phoneScreen && (e.x > window.innerWidth || e.x < 0 || e.y > window.innerHeight || e.y < 0)) chatOpenButton.style.opacity = "0";
    };

    const mouseEvent = () => {
        timeSinceMove = new Date().getTime();
        if (!window.chatOpen || window.phoneScreen) chatOpenButton.style.opacity = "1";
        setTimeout(() => {
            if (new Date().getTime() - timeSinceMove > wait && chatOpenButton.style.backgroundColor === "rgba(0, 0, 0, 0.2)" && !window.chatOpen && !window.phoneScreen) {
                chatOpenButton.style.opacity = "0";
            }
        }, wait);
    }

    const setChatState = (state) => {
        mouseEvent();
        if (state) {
            document.getElementById("closeChat").style.opacity = window.phoneScreen ? "1" : "0";
            chatOpenButton.style.opacity = window.phoneScreen ? "0" : "1";
            chatOpenButton.style.right = window.phoneScreen ? "100%" : "20%";
            chatOpenButton.innerHTML = "&gt;";
            document.getElementById("chat").style.height = canvas.height + "px";
            document.getElementById('chat').style.opacity = "1";
            document.getElementById('chat').style.right = "0%";
            if (!window.phoneScreen) document.getElementById('text').focus();
            else document.getElementById('chatBox').focus();
        } else {
            chatOpenButton.style.right = "0";
            chatOpenButton.innerHTML = "&lt;";
            document.getElementById('chat').style.opacity = "0";
            document.getElementById('chat').style.right = "200%";
            document.getElementById('text').blur();
        }
        window.chatOpen = state;
    }
}