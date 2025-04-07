(function() {
  var fcp = String.fromCodePoint
  var emojiList = []
  var currentMapping = new Map()
  
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

  // 生成随机映射
  function generateMapping() {
    currentMapping.clear()
    const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    const shuffledEmojis = [...emojiList].sort(() => Math.random() - 0.5)
    
    for (let i = 0; i < base64Chars.length; i++) {
      currentMapping.set(base64Chars[i], shuffledEmojis[i])
    }
  }

  // 获取随机 emoji 作为 nonce
  function getRandomNonce() {
    return emojiList[Math.floor(Math.random() * emojiList.length)]
  }

  function encode(txt) {
    if (emojiList.length === 0) {
      loadEmojiList().then(() => {
        generateMapping()
      })
    }
    
    if (currentMapping.size === 0) {
      generateMapping()
    }

    const base64 = btoa(encodeURIComponent(txt))
    const result = base64.split('').map(c => currentMapping.get(c)).join('')
    return result + getRandomNonce()
  }

  function decode(emoji) {
    if (emojiList.length === 0) {
      loadEmojiList().then(() => {
        generateMapping()
      })
    }
    
    if (currentMapping.size === 0) {
      generateMapping()
    }

    // 移除最后一个字符（nonce）
    emoji = emoji.slice(0, -2)
    
    // 创建反向映射
    const reverseMapping = new Map()
    for (const [key, value] of currentMapping) {
      reverseMapping.set(value, key)
    }

    const base64 = emoji.split('').map(e => reverseMapping.get(e)).join('')
    return decodeURIComponent(atob(base64))
  }

  function auto(str) {
    // 检查是否已经是 emoji 编码（通过检查是否包含 emoji 列表中的字符）
    const isEncoded = emojiList.some(e => str.includes(e))
    return isEncoded ? decode(str) : encode(str)
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
