const base = 7;

const stringMessage = unescape(encodeURIComponent("Hello! My name is Ben"));

const publicKey = new Uint32Array(base * 31).map(() => Math.floor(Math.random() * (2 ** 32)));

const messageTemplate = new Uint32Array(base);

for (let m = base, n = base - 1; m > 0 && n >= 0; m -= 32, n -= 1) {
    messageTemplate[n] = Math.floor(Math.random() * (2 ** Math.min(m, 32)));
}

// publicKey.map(a => console.log(a.toString(16).padStart(8, '0')));

const decryptedMessage = new Uint32Array(messageTemplate);
for (let c = 0; c < stringMessage.length; c += 4) {
    const chars = Array(4).fill().map((_, a) => stringMessage.charCodeAt(c + a)).map(char => Number.isNaN(char) ? 0 : char);
    decryptedMessage[c / 4] = chars.reduce((sum, char, i) => sum + char * 256 ** (3 - i), 0);
}
decryptedMessage.map(a => console.log(a.toString(16).padStart(8, '0')));
// console.log(decryptedMessage);