export class Validator {
  static isValidRoomId(roomId) {
    if (!roomId || typeof roomId !== 'string') {
      return false
    }
    
    // 방 ID는 3-50자, 영문자, 숫자, 하이픈, 언더스코어만 허용
    const roomIdRegex = /^[a-zA-Z0-9_-]{3,50}$/
    return roomIdRegex.test(roomId)
  }

  static isValidPeerId(peerId) {
    if (!peerId || typeof peerId !== 'string') {
      return false
    }
    
    // 피어 ID는 1-30자, 영문자, 숫자, 하이픈, 언더스코어만 허용
    const peerIdRegex = /^[a-zA-Z0-9_-]{1,30}$/
    return peerIdRegex.test(peerId)
  }

  static isValidRtpParameters(rtpParameters) {
    if (!rtpParameters || typeof rtpParameters !== 'object') {
      return false
    }
    
    // 기본적인 RTP 파라미터 구조 검증
    return (
      rtpParameters.codecs &&
      Array.isArray(rtpParameters.codecs) &&
      rtpParameters.headerExtensions &&
      Array.isArray(rtpParameters.headerExtensions)
    )
  }

  static isValidMediaKind(kind) {
    return kind === 'audio' || kind === 'video'
  }

  static isValidSocketId(socketId) {
    if (!socketId || typeof socketId !== 'string') {
      return false
    }
    
    // Socket.IO ID 형식 검증 (일반적으로 20자 영문자+숫자)
    const socketIdRegex = /^[a-zA-Z0-9_-]{10,30}$/
    return socketIdRegex.test(socketId)
  }

  static sanitizeRoomId(roomId) {
    if (!roomId) return null
    
    // 특수문자 제거하고 소문자로 변환
    return roomId
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '')
      .substring(0, 50)
  }

  static sanitizePeerId(peerId) {
    if (!peerId) return null
    
    // 특수문자 제거
    return peerId
      .toString()
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .substring(0, 30)
  }

  static validateJoinRoomData(data) {
    const errors = []
    
    if (!this.isValidRoomId(data.roomId)) {
      errors.push('Invalid room ID format')
    }
    
    if (!this.isValidPeerId(data.peerId)) {
      errors.push('Invalid peer ID format')
    }
    
    if (data.rtpCapabilities && typeof data.rtpCapabilities !== 'object') {
      errors.push('Invalid RTP capabilities format')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  static validateProduceData(data) {
    const errors = []
    
    if (!this.isValidMediaKind(data.kind)) {
      errors.push('Invalid media kind (must be audio or video)')
    }
    
    if (!this.isValidRtpParameters(data.rtpParameters)) {
      errors.push('Invalid RTP parameters')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  static validateConsumeData(data) {
    const errors = []
    
    if (!data.producerId || typeof data.producerId !== 'string') {
      errors.push('Invalid producer ID')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}
