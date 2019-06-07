

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
