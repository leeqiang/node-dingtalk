const assert = require('assert')
const DCrypto = require('wechat-cryptor')

/**
 * 回调相关 API
 * @type {User}
 */
module.exports = class CallBack {
  constructor (client, options) {
    assert(options.token, 'options.token required');
    assert(options.aesKey, 'options.aesKey required');
    this.client = client
    this.options = options
    this.cryptor = new DCrypto(options.corpid, options.token, options.aesKey)
  }

  /**
   * 注册回调
   *   - call_back/register_call_back
   * @param {Array} call_back_tag - 事件列表
   * @param {String} token - 加解密需要用到的token
   * @param {String} aes_key - 数据加密密钥
   * @param {String} url - 接收事件回调的url
   * @return {Object} { errcode, errmsg }
   */
  async register (callBackTag, url, opts) {
    const api = 'call_back/register_call_back'
    return this.client.post(api, Object.assign({}, {
      call_back_tag: callBackTag,
      token: opts ? opts.token : this.options.token,
      aes_key: opts ? opts.aesKey : this.options.aesKey,
      url
    }, opts))
  }

  /**
   * 解密请求
   * @param {Object} query 请求的query
   * @param {Object} body 请求的body
   * @returns {Object} 解密数据与成功返回 { decrypted, success }
   */
  async decrypt (query, body) {
    let nonce = query.nonce
    let timeStamp = query.timestamp
    let encrypt = body.encrypt

    return {
      decrypted: this.cryptor.decrypt(encrypt).message,
      success: {
        msg_signature: this.cryptor.getSHA1(timeStamp, nonce, encrypt)[1],
        timeStamp: timeStamp,
        encrypt: this.client.cryptor.encrypt('success'),
        nonce: nonce
      }
    }
  }

  /**
   * 查询事件回调接口
   */
  async get (opts) {
    const api = 'call_back/get_call_back'
    return this.client.get(api, opts)
  }

  /**
   * 更新事件回调接口
   *   - call_back/update_call_back
   * @param {Array} call_back_tag - 事件列表
   * @param {String} token - 加解密需要用到的token
   * @param {String} aes_key - 数据加密密钥
   * @param {String} url - 接收事件回调的url
   * @return {Object} { errcode, errmsg }
   */
  async update (callBackTag, token, aesKey, url, opts) {
    const api = 'call_back/update_call_back'
    return this.client.post(api, Object.assign({}, {
      call_back_tag: callBackTag,
      token,
      aes_key: aesKey,
      url
    }, opts))
  }

  /**
   * 删除事件回调接口
   *   - call_back/delete_call_back
   * @return {Object} { errcode, errmsg }
   */
  async delete () {
    const api = 'call_back/delete_call_back'
    return this.client.get(api)
  }

  /**
   * 获取回调失败的结果
   *   - call_back/get_call_back_failed_result
   * @return {Object} { errcode, errmsg }
   */
  async listFailed (opts) {
    const api = 'call_back/get_call_back_failed_result'
    return this.client.get(api, opts)
  }
}
