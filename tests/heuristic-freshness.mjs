import * as utils from '../utils.mjs'

var tests = []

function checkStatus (status) {
  var succeed = status[0]
  var code = status[1]
  var phrase = status[2]
  var body = status[3]
  if (body === undefined) {
    body = utils.httpContent(code)
  }
  var extra = status[4] || ''
  var extraHdr = status[5]
  var expectedType = 'not_cached'
  var desired = 'must not reuse'
  if (succeed === true) {
    expectedType = 'cached'
    desired = 'should reuse'
  }
  var responseHeaders = [
    ['Last-Modified', -24 * 60 * 60],
    ['Date', 0]
  ]
  if (extraHdr) {
    responseHeaders.push(extraHdr)
  }
  tests.push({
    name: `HTTP cache ${desired} a ${code} ${phrase} response with Last-Modified based upon heuristic freshness ${extra}`,
    id: `heuristic-${code}-${expectedType}`,
    required: !succeed,
    requests: [{
      response_status: [code, phrase],
      response_headers: responseHeaders,
      response_body: body,
      setup: true
    }, {
      expected_type: expectedType,
      response_status: [code, phrase],
      response_body: body
    }]
  })
}

[
  [true, 200, 'OK'],
  [false, 201, 'Created'],
  [false, 202, 'Accepted'],
  [true, 203, 'Non-Authoritative Information'],
  [true, 204, 'No Content', ''],
  [false, 403, 'Forbidden'],
  [true, 404, 'Not Found'],
  [true, 405, 'Method Not Allowed'],
  [true, 410, 'Gone'],
  [true, 414, 'URI Too Long'],
  [true, 501, 'Not Implemented'],
  [false, 502, 'Bad Gateway'],
  [false, 503, 'Service Unavailable'],
  [false, 504, 'Gateway Timeout'],
  [false, 599, 'Unknown', undefined, 'when Cache-Control: public is not present'],
  [true, 599, 'Unknown', undefined, 'when Cache-Control: public is present', ['Cache-Control', 'public']]
].forEach(checkStatus)

export default {
  name: 'Heuristic Freshness',
  id: 'heuristic',
  tests: tests
}
