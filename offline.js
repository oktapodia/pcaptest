import path from 'path';
import { createOfflineSession, decode } from 'pcap';
import PacketHandler from './PacketHandler.js';

const session = createOfflineSession(path.resolve('pcapexportedwithudpreceiverpy.pcap'), { filter: 'udp and port 5056' });
const packetHandler = new PacketHandler()

session.on('session', function (session) {
  console.log("Start of session between " + session.src_name + " and " + session.dst_name);
  session.on('end', function (session) {
    console.log("End of TCP session between " + session.src_name + " and " + session.dst_name);
  });
});
session.on('packet', (rawPacket) => {
  const packet = decode(rawPacket);
  // packet.
  console.log('packet', packet)

  const data = packet.payload.payload?.data

  console.log('packethandler', packetHandler.packetHandler(data))
})
