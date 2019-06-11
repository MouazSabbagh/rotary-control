
import { create, element } from '../dom/module.js';

const DEBUG = false;//window.DEBUG === undefined || window.DEBUG;
const assign = Object.assign;

const defaults = {
    min:        0,
    max:        100,
    mouserange: 320,
    value:      0
};

const regexFindSpace = /\s+/g;


// Helper functions

function scale(value, min1, max1, min2, max2) {
    let position1;
    let position2;
    let range1 = max1 - min1;
    let range2 = max2 - min2;
    position1 = value - min1;
    // to have the scale position1/range1 =position2/range2
    position2 = (range2 * position1) / range1;
    return position2 + min2;
}

function renderRotary(data) {
    if (!data.$rotary) { return; }
    const currentDegrr = scale(data.value, data.min, data.max, -135, 135);
    data.$rotary.style.transform = `rotate(${currentDegrr}deg)`;
    data.$inputs.forEach((input) => input.checked = parseFloat(input.value) === data.value);
}

function getTouchByIdentifier(touches, identifier) {
    let n = touches.length;
    while (n--) {
        if (touches[n].identifier === identifier) {
            return touches[n];
        }
    }
}

function move(node, touch, startY, startValue, data) {
    let diff = -1 * (touch.clientY - startY);
    node.value = startValue + scale(diff, 0, data.mouserange, 0, data.max - data.min);
}

function ticksStringToNodes(ticksString, data, radius) {
    return ticksString
    .split(regexFindSpace)
    .map(tick => parseFloat(tick))
    .map((float) => {
        const angle = scale(float, data.min, data.max, -135, 135);
        const input = create('input', { class: 'masked', type: 'radio', name: 'tick', value: float, id: 'tick-' + float });
        const label = create('label', { class: 'tick-label', for: 'tick-' + float, html: float,
            style:
                'left: ' + (radius * Math.sin(angle * (Math.PI / 180))) + "px; "
                + 'top: ' + (-radius * Math.cos(angle * (Math.PI / 180))) + "px;"
        });

        return [input, label];
    })
    .reduce((array, data) => {
        array.push.apply(array, data);
        return array;
    }, []);
}

function ticksPosition() {
  divArr.forEach(div => {
    let data = parseFloat(div.getAttribute("data-key"));

    const currentDegrr = scale(data, min, max, -135, 135);

    div.style.left = 120 * Math.sin(currentDegrr * (Math.PI / 180)) + "px";
    div.style.top = -1 * 120 * Math.cos(currentDegrr * (Math.PI / 180)) + "px";
  });
};

function appendReducer(root, node) {
    root.appendChild(node);
    return root;
}


// Define custom element

element('rotary-control', '#rotary-control-template', {

    // Attributes

    min:       function(value) { this.min = parseFloat(value); },

    max:       function(value) { this.max = parseFloat(value); },

    value:     function(value) { this.value = value; },

    //prefix:    function(value) { this.data.prefix = value; },

    //transform: function(value) { this.data.transform = value; },

    //unit:      function(value) { this.data.unit = value; },

    mouserange: function(value) { this.mouserange = value; },

    ticks: function(value) {
        const radius = this.clientWidth / 2;
        const distance = radius + 15;
        value = value.trim();
        const tickNodes = ticksStringToNodes(value, this.data, distance);
        tickNodes.reduce(appendReducer, this.shadowRoot);

        // Filter out the labels
        this.data.$inputs = tickNodes.filter((node) => node.value !== undefined);
    }
}, {

    // Properties

    type: {
        value: 'number',
        enumerable: true
    },

    min: {
        get: function() {
            return this.data.min;
        },

        set: function(min) {
            const data = this.data;

            if (data.value < min) {
                data.value = min;
            }

            data.min = min;
            renderRotary(data);
        },

        enumerable: true
    },

    max: {
        get: function() {
            return this.data.max;
        },

        set: function(max) {
            const data = this.data;

            if (data.value > max) {
                data.value = max;
            }

            data.max = max;
            renderRotary(data);
        },

        enumerable: true
    },

    value: {
        get: function() {
            return this.data.value;
        },

        set: function(value) {
            value = parseFloat(value);

            const data = this.data;

            if (value < data.min) {
                value = data.min;
            }
            else if (value > data.max) {
                value = data.max;
            }

            data.value = value;
            renderRotary(data);
        },

        enumerable: true
    }
}, {

    // Lifecycle

    setup: function(shadow) {
        this.data = assign({}, defaults);
    },

    connect: function() {
        if (DEBUG) { console.log('<rotary-control> added to document', this.value, this.data); }

        const node = this;
        const dot  = this.shadowRoot.querySelector(".dot");
        const data = this.data;

        data.$rotary = this.shadowRoot.querySelector("#rotary-knob");

        function mouseDown(e) {
          let startY = e.clientY;
          let startValue = data.value;

          function mouseMove(e) {
              move(node, e, startY, startValue, data);
          }

          function mouseUp(e) {
            document.removeEventListener("mousemove", mouseMove);
            document.removeEventListener("mouseup", mouseUp);
          }

          document.addEventListener("mousemove", mouseMove);
          document.addEventListener("mouseup", mouseUp);
        }

        data.$rotary.addEventListener("mousedown", mouseDown);

        function onTouchStart(e) {
          e.preventDefault();

          // Get the last touch in the list, which we assume is the touch that
          // just caused this touchstart event
          const touch = e.touches[e.touches.length - 1];

          // If this is a second touch on the same target, do nothing
          let n = e.touches.length - 1;
          while (n--) {
            if (e.touches[n].target === touch.target) {
              return;
            }
          }

          const identifier = e.touches[e.touches.length - 1].identifier;

          let startY = e.touches[0].clientY;
          let startValue = data.value;

          function touchMove(e) {
            const touch = getTouchByIdentifier(e.changedTouches, identifier);

            // If this touchmove event belongs to a different touch than the
            // one we started with, ignore
            if (!touch) { return; }

            move(node, touch, startY, startValue, data);
          }

          function touchEnd(e) {
            const touch = getTouchByIdentifier(e.changedTouches, identifier);

            if (!touch) { return; }

            document.removeEventListener("touchmove", touchMove);
            document.removeEventListener("touchend", touchEnd);
          }

          document.addEventListener("touchmove", touchMove);
          document.addEventListener("touchend", touchEnd);
        }

        data.$rotary.addEventListener("touchstart", onTouchStart);

        this.shadowRoot.addEventListener('change', (e) => this.value = e.target.value);
    }
});
