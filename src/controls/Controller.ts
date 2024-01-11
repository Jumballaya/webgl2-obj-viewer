import { vec2 } from "gl-matrix";

type ControllerMouseMoveEvent = {
    previousPosition: vec2;
    currentPosition: vec2;
    event: MouseEvent; 
}

type ControllerMouseClickEvent = {
    mousePosition: vec2;
    event: MouseEvent;
}

type ControllerMouseWheelEvent = {
    dy: number;
    event: WheelEvent;
}

type ControllerKeyDownEvent = {
    key: string;
    event: KeyboardEvent;
}

type ControllerKeyUpEvent = {
    key: string;
    event: KeyboardEvent;
}

type ControllerPointerLockChangeEvent = {
  canvas: HTMLCanvasElement;
  event: Event;
}

type ControllerEvents = {
    mousemove?: (e: ControllerMouseMoveEvent) => void;
    click?: (e: ControllerMouseClickEvent) => void;
    wheel?: (e: ControllerMouseWheelEvent) => void;
    keydown?: (e: ControllerKeyDownEvent) => void;
    keyup?: (e: ControllerKeyUpEvent) => void;
    pointerlockchange?: (e: ControllerPointerLockChangeEvent) => void;
}


export class Controller {

  private canvas?: HTMLCanvasElement;

  private handlers: ControllerEvents = {
    mousemove: undefined,
    click: undefined,
    wheel: undefined,
    keydown: undefined,
    keyup: undefined,
    pointerlockchange: undefined,
  };

  private keys: Record<string, boolean> = {};

  public addEventListener<T extends keyof ControllerEvents>(event: T, handler: ControllerEvents[T]) {
    this.handlers[event] = handler;
  }

  public requestPointerLock() {
    this.canvas?.addEventListener('click', () => {
      this.canvas?.requestPointerLock();
    });
  }

  public requestFullscreen() {
    this.canvas?.requestPointerLock();
  }

  public registerForCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    let prevMouse: vec2 | null = null;
    canvas.addEventListener("mousemove", (evt) => {
      evt.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const curMouse: vec2 = [evt.clientX - rect.left, evt.clientY - rect.top];
      if (!prevMouse) {
        prevMouse = [evt.clientX - rect.left, evt.clientY - rect.top];
      } else if (this.handlers.mousemove) {
        this.handlers.mousemove({
          previousPosition: prevMouse,
          currentPosition: curMouse,
          event: evt
        });
      }
      prevMouse = curMouse;
    });
  
    canvas.addEventListener("mousedown", (evt) => {
      const rect = canvas.getBoundingClientRect();
      const curMouse: vec2 = [evt.clientX - rect.left, evt.clientY - rect.top];
      if (this.handlers.click) {
          this.handlers.click({ mousePosition: curMouse, event: evt });
      }
    });
  
    canvas.addEventListener("wheel", (evt) => {
      evt.preventDefault();
      if (this.handlers.wheel) {
          this.handlers.wheel({ dy: -evt.deltaY, event: evt });
      }
    });
  
    canvas.oncontextmenu = function (evt: Event) {
      evt.preventDefault();
    };

    document.addEventListener('keydown', e => {
      this.keys[e.key] = true;
      if (this.handlers.keydown) {
          this.handlers.keydown({ key: e.key, event: e });
      }
    });

    document.addEventListener('keyup', e => {
      this.keys[e.key] = false;
      if (this.handlers.keyup) {
          this.handlers.keyup({ key: e.key, event: e });
      }
    });
  
    document.addEventListener('pointerlockchange', (e: Event) => {
      if (this.handlers.pointerlockchange && this.canvas) {
        this.handlers.pointerlockchange({ canvas: this.canvas, event: e});
      }
    })
  }

  public keyIsPressed(key: string): boolean {
    return !!this.keys[key];
  }
  
}

