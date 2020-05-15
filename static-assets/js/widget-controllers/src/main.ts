import * as ES6Promise from "es6-promise";
ES6Promise.polyfill();
import getLayout from "./widgetFactory";
import yall from 'yall-js';

import { Application } from "stimulus";

export const ApplicationObj = Application.start();
const widgetLoadEvents: { [key: string]: (() => void)[] } = {};

declare global {
  interface Window {
    loadWidget: any;
  }
}

window.loadWidget = async (widget: string, layout: string) => {
  let widgetModule = await getLayout(widget, layout);
  if (widgetModule) {
    widgetModule.default();
    PopAlleventsByControllerName(`${widget}--${layout}`);
  }
};

export function onWidgetLoad(controllerName: string, eventHandler: () => void) {
  if (widgetLoadEvents[controllerName] == undefined) {
    widgetLoadEvents[controllerName] = [eventHandler];
  } else {
    widgetLoadEvents[controllerName].push(eventHandler);
  }
}

function PopAlleventsByControllerName(CtrlName: string) {
  let events = widgetLoadEvents[CtrlName] || [];
  while (events.length != 0) {
    let event = events.pop();
    event!();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  yall({ observeChanges: true });
});