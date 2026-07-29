const upper = {
  a: '✌', b: '👌', c: '👍', d: '👎', e: '☜',
  f: '☞', g: '☝', h: '☟', i: '✋', j: '☺',
  k: '😐', l: '☹', m: '💣', n: '☠', o: '⚐',
  p: '🏱', q: '✈', r: '☼', s: '💧', t: '❄',
  u: '🕆', v: '✞', w: '🕈', x: '✠', y: '✡',
  z: '☪'
}

const lower = {
  a: '♋', b: '♌', c: '♍', d: '♎', e: '♏',
  f: '♐', g: '♑', h: '♒', i: '♓', j: '🙰',
  k: '🙵', l: '●', m: '❍', n: '■', o: '□',
  p: '◻', q: '❑', r: '❒', s: '⬧', t: '⧫',
  u: '◆', v: '❖', w: '⬥', x: '⌧', y: '⍓',
  z: '⌘'
}

function toWingdings(text, style = 'upper') {
  const map = style === 'upper' ? upper : lower
  return text.toLowerCase().split('').map(c => map[c] || c).join('')
}

module.exports = { toWingdings }
