const swipe = new Audio('sounds/swipe.mp3');
const flush = new Audio('sounds/flush.mp3');
const pristine = new Audio('sounds/pristine.mp3');
const swiftly = new Audio('sounds/swiftly.mp3');

export const playSwipe = () => {
    swipe.play();
}

export const playPristine = () => {
    pristine.play();
}

export const playFlush = () => {
    flush.play();
}

export const playSwiftly = () => {
    swiftly.play();
}