import { NextResponse } from 'next/server'
import os from 'os'

export async function GET() {
  const nets = os.networkInterfaces()
  let localIp = '127.0.0.1'

  for (const name of Object.keys(nets)) {
    const list = nets[name] || []
    for (const net of list) {
      if (
        net.family === 'IPv4' &&
        !net.internal &&
        !name.toLowerCase().includes('vethernet') &&
        !name.toLowerCase().includes('loopback')
      ) {
        localIp = net.address
        break
      }
    }
    if (localIp !== '127.0.0.1') break
  }

  return NextResponse.json({ ip: localIp })
}
