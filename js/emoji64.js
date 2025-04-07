(function() {
  // 工具函数
  const fcp = String.fromCodePoint;
  const MAGIC = 128464;
  const NONCE_LENGTH = 4; // nonce 使用4个emoji

  // 缓存emoji列表
  let emojiList = null;
  let emojiMap = null;
  let reverseEmojiMap = null;

  // 加载emoji列表
  async function loadEmojiList() {
    if (emojiList) return emojiList;
    
    try {
      const response = await fetch('assets/emoji.json');
      emojiList = await response.json();
      
      // 创建映射
      emojiMap = new Map();
      reverseEmojiMap = new Map();
      
      emojiList.forEach((emoji, index) => {
        emojiMap.set(index, emoji);
        reverseEmojiMap.set(emoji, index);
      });
      
      return emojiList;
    } catch (error) {
      console.error('Failed to load emoji list:', error);
      // 如果加载失败，使用一个基本的emoji列表作为后备
      emojiList = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂'];
      emojiMap = new Map();
      reverseEmojiMap = new Map();
      emojiList.forEach((emoji, index) => {
        emojiMap.set(index, emoji);
        reverseEmojiMap.set(emoji, index);
      });
      return emojiList;
    }
  }

  // 生成nonce
  function generateNonce() {
    if (!emojiList || emojiList.length === 0) {
      // 如果emojiList未加载，使用基本的emoji
      return '😀😃😄😁';
    }
    const nonce = [];
    for (let i = 0; i < NONCE_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * emojiList.length);
      nonce.push(emojiList[randomIndex]);
    }
    return nonce.join('');
  }

  // 从nonce中提取映射信息
  function extractNonce(encoded) {
    if (!encoded || encoded.length < NONCE_LENGTH * 2) {
      return { data: encoded, nonce: '' };
    }
    const nonce = encoded.slice(-NONCE_LENGTH * 2); // 每个emoji占用2个字符
    const data = encoded.slice(0, -NONCE_LENGTH * 2);
    return { data, nonce };
  }

  // 编码函数
  async function encode(txt) {
    if (!txt) return '';
    await loadEmojiList();
    
    // 将文本转换为UTF-8字节数组
    const encoder = new TextEncoder();
    const bytes = encoder.encode(txt);
    
    // 转换为base64
    const base64 = btoa(String.fromCharCode.apply(null, bytes));
    
    // 转换为emoji序列
    const emojiSequence = base64
      .split('')
      .map(c => fcp(c.charCodeAt(0) + MAGIC))
      .join('');
    
    // 添加nonce
    const nonce = generateNonce();
    return emojiSequence + nonce;
  }

  // 解码函数
  async function decode(emoji) {
    if (!emoji) return '';
    await loadEmojiList();
    
    // 分离数据和nonce
    const { data, nonce } = extractNonce(emoji);
    
    // 转换回base64
    let base64 = '';
    for (let i = 0; i < data.length; i += 2) {
      const cp = data.codePointAt(i);
      base64 += fcp(cp - MAGIC);
    }
    
    // 转换回UTF-8字节数组
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    // 解码为文本
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  }

  // 自动检测函数
  async function auto(str) {
    if (!str) return '';
    await loadEmojiList();
    return str.codePointAt(0) >= MAGIC ? decode(str) : encode(str);
  }

  // 导出接口
  const e64 = { encode, decode, auto };
  
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = e64;
  } else if (typeof window !== 'undefined') {
    window.emoji64 = e64;
  }
})();
