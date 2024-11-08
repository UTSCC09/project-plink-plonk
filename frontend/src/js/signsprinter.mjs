export {
  generateProblemText,
  generateProblem
}

const problemBank =[
  {label: "Closed_Fist", name: "Fist"},
  {label: "Open_Palm", name: "Open Palm"},
  {label: "Pointing_Up", name: "Point Up"},
  {label: "Thumb_Down", name: "Thumbs Down"},
  {label: "Thumb_Up", name: "Thumbs Up"},
  {label: "Victory", name: "Peace"},
  {label: "ILoveYou", name: "I Love You"}
]

function generateProblemText(sign) {
  return `Please sign ${sign}.`;
}

function generateProblem() {
  return problemBank[getRandomInt(0, problemBank.length)];
}

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}
