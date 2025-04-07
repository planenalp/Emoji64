(function() {
  var fcp = String.fromCodePoint
  var emojiList = []
  var nonceEmoji = ''
  
  // 加载 emoji 列表
  function loadEmojiList() {
    if (typeof fetch !== 'undefined') {
      return fetch('assets/emoji.json')
        .then(response => response.json())
        .then(data => {
          emojiList = data
          return data
        })
    } else if (typeof require !== 'undefined') {
      emojiList = require('../assets/emoji.json')
      return Promise.resolve(emojiList)
    }
  }

  // 获取随机 emoji
  function getRandomEmoji() {
    if (emojiList.length === 0) {
      loadEmojiList()
    }
    return emojiList[Math.floor(Math.random() * emojiList.length)]
  }

  // 生成随机 nonce
  function generateNonce() {
    return getRandomEmoji()
  }

  function encode(txt) {
    var result = btoa(encodeURIComponent(txt))
      .split('')
      .map(c => fcp(c.charCodeAt(0) + 128464))
      .join('')
    return result + generateNonce()
  }

  function decode(emoji) {
    // 移除最后一个字符（nonce）
    emoji = emoji.slice(0, -2)
    var b64 = '', cp, i = 0
    while (cp = emoji.codePointAt(i)) {
      b64 += fcp(cp - 128464)
      i += 2
    }
    return decodeURIComponent(atob(b64))
  }

  function auto(str) {
    return str.codePointAt(0) >= 128464 ? decode(str) : encode(str)
  }

  var e64 = { encode, decode, auto }
  
  // 预加载 emoji 列表
  loadEmojiList()

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = e64
  } else if (window) {
    window['emoji64'] = e64
  }
}())
