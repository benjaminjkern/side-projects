export const canvas = document.getElementById("canvas");
export const ctx = canvas.getContext("2d");
canvas.width = Math.floor(window.innerWidth / 50) * 50;
canvas.height = Math.floor(window.innerHeight / 50) * 50;

export const windowDimensions = [canvas.width, canvas.height];

export const DT = 0.1;
