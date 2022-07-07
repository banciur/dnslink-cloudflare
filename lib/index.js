const got = require('got')

async function getZoneId (api, name) {
  let res

  for (let i = 1; (res = await api(`zones?page=${i}`)) && res.body.result_info.total_pages >= i; i++) {
    for (const zone of res.body.result) {
      if (zone.name === name) {
        return zone.id
      }
    }
  }

  throw new Error(`zone ${name} couldn't be found`)
}

async function getWeb3HostnameId (api, zoneId, name) {
  const res = await api(`zones/${zoneId}/web3/hostnames`)
  for (const hostname of res.body.result) {
    if (hostname.name === name) {
      return hostname.id
    }
  }
  throw new Error(`zone ${name} couldn't be found`)
}

function getClient (apiOpts) {
  const opts = {
    prefixUrl: 'https://api.cloudflare.com/client/v4',
    responseType: 'json'
  }

  if (apiOpts.token) {
    opts.headers = {
      Authorization: `Bearer ${apiOpts.token}`
    }
  } else {
    opts.headers = {
      'X-Auth-Email': apiOpts.email,
      'X-Auth-Key': apiOpts.key
    }
  }

  return got.extend(opts)
}

async function update (apiOpts, { zone, link, web3Hostname }) {
  const api = getClient(apiOpts)
  const zoneId = await getZoneId(api, zone)
  const hostNameId = await getWeb3HostnameId(api, zoneId, web3Hostname)

  await api.patch(`zones/${zoneId}/web3/hostnames/${hostNameId}`, {
    json: {
      dnslink: link
    }
  })
  return link
}

module.exports = update
