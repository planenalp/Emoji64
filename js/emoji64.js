(function() {
  var fcp = String.fromCodePoint
  var MAGIC = 128464
  var emojiList = []
  var emojiMap = new Map()
  var reverseEmojiMap = new Map()

  // 加载emoji列表
  async function loadEmojiList() {
    try {
      const response = await fetch('assets/emoji.json')
      emojiList = await response.json()
      // 重新构建映射
      emojiMap.clear()
      reverseEmojiMap.clear()
      emojiList.forEach((emoji, index) => {
        emojiMap.set(index, emoji)
        reverseEmojiMap.set(emoji, index)
      })
    } catch (error) {
      console.error('Failed to load emoji list:', error)
      // 如果加载失败，使用默认的MAGIC偏移方式
      emojiMap = null
      reverseEmojiMap = null
    }
  }

  // 生成nonce
  function generateNonce() {
    const nonce = []
    emojiList.forEach((emoji, index) => {
      if (index < 256) { // 只使用前256个emoji作为映射
        nonce.push(emoji)
      }
    })
    return nonce.join('')
  }

  // 解析nonce
  function parseNonce(nonce) {
    const map = new Map()
    let index = 0
    for (let i = 0; i < nonce.length; i += 2) {
      const emoji = nonce.slice(i, i + 2)
      map.set(index++, emoji)
    }
    return map
  }

  async function encode(txt) {
    await loadEmojiList()
    const b64 = btoa(encodeURIComponent(txt))
    let result = ''
    
    if (emojiMap) {
      // 使用动态emoji映射
      for (let i = 0; i < b64.length; i++) {
        const charCode = b64.charCodeAt(i)
        result += emojiMap.get(charCode) || fcp(charCode + MAGIC)
      }
    } else {
      // 回退到原始编码方式
      result = b64.split('')
        .map(c => fcp(c.charCodeAt(0) + MAGIC))
        .join('')
    }

    // 添加nonce
    const nonce = generateNonce()
    return result + nonce
  }

  async function decode(emoji) {
    await loadEmojiList()
    
    // 提取nonce
    const nonceLength = emojiList.length * 2 // 每个emoji占2个字符
    const nonce = emoji.slice(-nonceLength)
    const encodedText = emoji.slice(0, -nonceLength)
    
    let b64 = ''
    if (reverseEmojiMap) {
      // 使用动态emoji映射
      const map = parseNonce(nonce)
      for (let i = 0; i < encodedText.length; i += 2) {
        const currentEmoji = encodedText.slice(i, i + 2)
        const charCode = map.get(reverseEmojiMap.get(currentEmoji)) || 
                        (currentEmoji.codePointAt(0) - MAGIC)
        b64 += fcp(charCode)
      }
    } else {
      // 回退到原始解码方式
      let i = 0
      while (i < encodedText.length) {
        const cp = encodedText.codePointAt(i)
        b64 += fcp(cp - MAGIC)
        i += 2
      }
    }

    return decodeURIComponent(atob(b64))
  }

  async function auto(str) {
    await loadEmojiList()
    return str.codePointAt(0) >= MAGIC ? decode(str) : encode(str)
  }

  var e64 = { encode, decode, auto }
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = e64
  } else if (window) {
    window['emoji64'] = e64
  }
}())
