const container = document.querySelector(".container");
const rotary = document.querySelector(".rotary_control");
const dot = document.querySelector(".dot");
const ticks = rotary.getAttribute("ticks").trim();

const wrapper = document.querySelector(".wrapper");

const mouseRange = 200;

let min = parseFloat(rotary.getAttribute("min")) || 0;
let max = parseFloat(rotary.getAttribute("max")) || 100;
let currentValue = min;

rotary.addEventListener("mousedown", mouseDown);
function mouseDown(e) {
  let startY = e.clientY;
  let startValue = currentValue;

  document.addEventListener("mousemove", mouseMove);
  function mouseMove(e) {
    let diff = -1 * (e.clientY - startY);
    currentValue = startValue + scale(diff, 0, mouseRange, 0, max - min);

    if (currentValue > max) {
      currentValue = max;
    }
    if (currentValue < min) {
      currentValue = min;
    }
    console.log(currentValue);

    const currentDegrr = scale(currentValue, min, max, -135, 135);

    rotary.style.transform = `rotate(${currentDegrr}deg)`;

    for (let div of wrapperChildrenArr) {
      if (parseFloat(div.getAttribute("data-key")) === currentValue) {
        div.classList.add("active");
      } else {
        div.classList.remove("active");
      }
    }
  }

  document.addEventListener("mouseup", mouseUp);
  function mouseUp(e) {
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mouseup", mouseUp);
  }
}

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

strAtrrToNode = (ticksAtrr, div) => {
  let regexFindSpace = /\s+/g;
  //   trim(); method to move the space from the start and the end of the string

  let ticksArr = ticksAtrr.split(regexFindSpace).map(tick => parseFloat(tick));

  let html = ticksArr
    .map(tick => {
      return `
      
    <div class = "range" data-key=${tick}>${tick}</div>
    
      `;
    })
    .join("");
  div.innerHTML = html;
  return div;
};

ticksPosition = div => {
  const divArr = Array.from(div.children);
  divArr.forEach(div => {
    let data = parseFloat(div.getAttribute("data-key"));

    const currentDegrr = scale(data, min, max, -135, 135);

    div.style.left = 120 * Math.sin(currentDegrr * (Math.PI / 180)) + "px";
    div.style.top = -1 * 120 * Math.cos(currentDegrr * (Math.PI / 180)) + "px";
  });
};
ticksPosition(strAtrrToNode(ticks, wrapper));

// function on click thirsday

const wrapperChildrenArr = Array.from(wrapper.children);

wrapperChildrenArr.forEach(div => {
  div.addEventListener("click", function onClick(e) {
    let data = parseFloat(div.getAttribute("data-key"));
    currentValue = data;

    const currentDegrr = scale(currentValue, min, max, -135, 135);
    rotary.style.transform = `rotate(${currentDegrr}deg)`;
    for (let div of wrapperChildrenArr) {
      if (div.classList.contains("active")) {
        div.classList.remove("active");
      }
    }
    e.target.classList.add("active");
  });
});

// wrapperChildrenArr.forEach(div => {
//   div.addEventListener("touchstart", function onTouch(e) {
//     let data = parseFloat(div.getAttribute("data-key"));
//     const currentDegrr = scale(data, min, max, -135, 135);

//     console.log(e);
//   });
// });
rotary.addEventListener("touchstart", onTouchStart);

function getTouchByIdentifier(touches, identifier) {
  let n = touches.length;
  while (n--) {
    if (touches[n].identifier === identifier) {
      return touches[n];
    }
  }
}

function onTouchStart(e) {
  e.preventDefault();

  const touch = e.touches[e.touches.length - 1];
  let n = e.touches.length - 1;
  while (n--) {
    if (e.touches[n].target === touch.target) {
      return;
    }
  }

  const identifier = e.touches[e.touches.length - 1].identifier;
  console.log(identifier);

  let startY = e.touches[0].clientY;
  let startValue = currentValue;

  document.addEventListener("touchmove", touchMove);
  function touchMove(e) {
    const touch = getTouchByIdentifier(e.changedTouches, identifier);

    if (!touch) {
      return;
    }

    console.log(touch);

    let diff = -1 * (touch.clientY - startY);
    currentValue = startValue + scale(diff, 0, mouseRange, 0, max - min);

    if (currentValue > max) {
      currentValue = max;
    }
    if (currentValue < min) {
      currentValue = min;
    }

    const currentDegrr = scale(currentValue, min, max, -135, 135);

    rotary.style.transform = `rotate(${currentDegrr}deg)`;

    for (let div of wrapperChildrenArr) {
      if (parseFloat(div.getAttribute("data-key")) === currentValue) {
        div.classList.add("active");
      } else {
        div.classList.remove("active");
      }
    }
  }

  document.addEventListener("touchend", touchEnd);
  function touchEnd(e) {
    const touch = getTouchByIdentifier(e.changedTouches, identifier);

    if (!touch) {
      return;
    }

    document.removeEventListener("touchmove", touchMove);
    document.removeEventListener("touchend", touchEnd);
  }
}
