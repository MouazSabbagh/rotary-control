
import { element } from '../dom/module.js';

const DEBUG = false;//window.DEBUG === undefined || window.DEBUG;
const assign = Object.assign;

const defaults = {
    min:        0,
    max:        100,
    mouserange: 240,
    value:      0
};


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
        value = value.trim();


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

        data.$rotary.addEventListener("mousedown", mouseDown);

        function mouseDown(e) {
          let startY = e.clientY;
          let startValue = data.value;

          document.addEventListener("mousemove", mouseMove);

          function mouseMove(e) {
            let diff = -1 * (e.clientY - startY);
            node.value = startValue + scale(diff, 0, data.mouserange, 0, data.max - data.min);

            // Highlight the active tick

            //for (let div of wrapperChildrenArr) {
            //  if (parseFloat(div.getAttribute("data-key")) === currentValue) {
            //    div.classList.add("active");
            //  } else {
            //    div.classList.remove("active");
            //  }
            //}
          }

          document.addEventListener("mouseup", mouseUp);
          function mouseUp(e) {
            document.removeEventListener("mousemove", mouseMove);
            document.removeEventListener("mouseup", mouseUp);
          }
        }


        this.shadowRoot.addEventListener('input', (e) => {

        });
    }
});
