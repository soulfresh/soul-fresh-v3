
export function makeElement(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.firstChild;
}
