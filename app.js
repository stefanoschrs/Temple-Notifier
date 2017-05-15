'use strict'

const fs = require('fs')
const https = require('https')
const childProcess = require('child_process')

const LAST_ID_PARSED_PATH = `${__dirname}/last-id-parsed`
const INTERVAL = process.env.INTERVAL || (1000 * 60 * 5)

function notify (titles) {
  childProcess.exec(`notify-send -i ${__dirname}/favicon.ico "Temple Notifier" "* ${titles.join('\n* ')}"`, (error, stdout, stderr) => {
    error = error || stderr

    if (error) return console.error(error)
  })
}

function update () {
  let latestId = ''
  try {
    latestId = fs.readFileSync(LAST_ID_PARSED_PATH, 'utf8')
  } catch (err) {
    console.error(err)
  }

  const requestOptions = {
    host: 'www.reddit.com',
    path: '/r/netsec/new.json?before=' + latestId,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
    }
  }

  const req = https.get(requestOptions, (res) => {
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    res.on('end', () => {
      try {
        data = JSON.parse(data).data
      } catch (err) {
        return console.error('Unable to parse response', err)
      }

      const reddits = data.children.map((el) => {
        return {
          id: el.data.name,
          title: el.data.title
        }
      })

      if (!reddits.length) return

      fs.writeFileSync(LAST_ID_PARSED_PATH, reddits[0].id)

      notify(reddits.map((r) => r.title))
    })
  })

  req.on('error', (err) => {
    console.error(err)
  })

  req.end()
}

update()
setInterval(update, INTERVAL)
