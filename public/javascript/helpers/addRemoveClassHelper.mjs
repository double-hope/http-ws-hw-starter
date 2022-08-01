import {addClass, removeClass} from "./domHelper.mjs";

const addRemoveClass = (add, remove, className) => {
    addClass(add, className);
    removeClass(remove, className);
}

export { addRemoveClass };