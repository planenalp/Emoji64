(function() {
  var fcp = String.fromCodePoint
  
  // 加载 emoji 列表
  function loadEmojiList() {
    if (typeof fetch !== 'undefined') {
      return fetch('assets/emoji.json')
        .then(response => response.json())
    } else if (typeof require !== 'undefined') {
      return Promise.resolve(require('../assets/emoji.json'))
    }
  }

  // 生成随机映射
  function generateMapping(emojiList) {
    const mapping = new Map()
    const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    const shuffledEmojis = [...emojiList].sort(() => Math.random() - 0.5)
    
    for (let i = 0; i < base64Chars.length; i++) {
      mapping.set(base64Chars[i], shuffledEmojis[i])
    }
    
    return mapping
  }

  async function encode(txt) {
    // 每次编码都重新加载 emoji 列表
    const emojiList = await loadEmojiList()
    const mapping = generateMapping(emojiList)
    
    const base64 = btoa(encodeURIComponent(txt))
    const result = base64.split('').map(c => mapping.get(c)).join('')
    
    // 将映射信息编码为 base64
    const mappingInfo = Array.from(mapping.entries())
      .map(([key, value]) => `${key}:${value}`)
      .join(',')
    const mappingBase64 = btoa(mappingInfo)
    
    // 将映射信息转换为 emoji 并添加到结果末尾
    const mappingEmoji = mappingBase64.split('').map(c => 
      emojiList[Math.floor(Math.random() * emojiList.length)]
    ).join('')
    
    return result + mappingEmoji
  }

  async function decode(emoji) {
    // 每次解码都重新加载 emoji 列表
    const emojiList = await loadEmojiList()
    
    // 提取映射信息（最后一部分）
    const mappingLength = Math.floor(emoji.length / 2)  // 假设每个 emoji 占 2 个字符
    const encodedContent = emoji.slice(0, -mappingLength)
    const mappingEmoji = emoji.slice(-mappingLength)
    
    // 从 emoji 中提取映射信息
    const mappingInfo = mappingEmoji.split('').map(e => 
      emojiList[Math.floor(Math.random() * emojiList.length)]
    ).join('')
    
    // 重建映射
    const mapping = new Map()
    mappingInfo.split(',').forEach(pair => {
      const [key, value] = pair.split(':')
      mapping.set(key, value)
    })
    
    // 创建反向映射
    const reverseMapping = new Map()
    for (const [key, value] of mapping) {
      reverseMapping.set(value, key)
    }
    
    const base64 = encodedContent.split('').map(e => reverseMapping.get(e)).join('')
    return decodeURIComponent(atob(base64))
  }

  async function auto(str) {
    // 检查是否已经是 emoji 编码（通过检查是否包含 emoji 列表中的字符）
    const emojiList = await loadEmojiList()
    const isEncoded = emojiList.some(e => str.includes(e))
    return isEncoded ? decode(str) : encode(str)
  }

  var e64 = { encode, decode, auto }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = e64
  } else if (window) {
    window['emoji64'] = e64
  }
}())
