function $(qs) { return document.querySelector(qs) }
function random() { return String.fromCodePoint(Math.floor(Math.random() * 64) + 128512) }
function randomize() { $('h1').innerText = random() + ' Emoji64 ' + random() }

window.addEventListener('DOMContentLoaded', randomize)
$('h1').addEventListener('click', randomize)

$('#encode').addEventListener('input', async function (event) {
  var value = event.target.value
  if (value) {
    try {
      $('#decode').value = await window.emoji64.auto(value)
      $('#copy').innerText = 'Copy'
      $('#clear').classList.remove('hidden')
      $('#copy').classList.remove('hidden')
    } catch (error) {
      console.error('Encoding error:', error)
      $('#decode').value = 'Error: ' + error.message
    }
  } else {
    $('#decode').value = ''
    $('#clear').classList.add('hidden')
    $('#copy').classList.add('hidden')
  }
})

$('#clear').addEventListener('click', function () {
  $('#encode').value = ''
  $('#decode').value = ''
  $('#clear').classList.add('hidden')
  $('#copy').classList.add('hidden')
  $('#encode').focus()
})

$('#copy').addEventListener('click', function () {
  navigator.clipboard.writeText($('#decode').value)
  $('#copy').innerText = 'Copied'
  $('#decode').select()
})
