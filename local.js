import network from 'network';
import pkg  from 'cap';
const { Cap, decoders } = pkg;
const { PROTOCOL } = decoders;

import PacketHandler from './PacketHandler.js';

const cap = new Cap();
const packetHandler = new PacketHandler();

const debug = true;
let linkType;
let buffer = Buffer.alloc(65535);
let albionPort = 5056;

function onPacket(nbytes, trunc) {
  console.log('onPacket', nbytes, trunc)
  if (linkType !== 'ETHERNET') {
    return;
  }

  let ret = decoders.Ethernet(buffer);

  console.log('onPacket ethernet', ret)
  if (ret.info.type !== PROTOCOL.ETHERNET.IPV4) {
    if (debug) {
      console.log('Unsupported Ethertype: ' + PROTOCOL.ETHERNET[ret.info.type]);
    }

    return;
  }

  ret = decoders.IPV4(buffer, ret.offset);
  console.log('onPacket ipv4', ret)

  if (ret.info.protocol !== PROTOCOL.IP.UDP) {
    if (this.debug) {
      console.log('Unsupported IPv4 protocol: ' + PROTOCOL.IP[ret.info.protocol]);
    }

    return;
  }

  ret = decoders.UDP(buffer, ret.offset);
  console.log('onPacket udp', ret)

  if (ret.info.srcport != albionPort && ret.info.dstport != albionPort) {
    return;
  }

  console.log('packettohandle', buffer.subarray(ret.offset));

  packetHandler.packetHandler(buffer.subarray(ret.offset));
}


network.get_active_interface((err, obj) => {
  if (err) {
    throw new Error("Can't find the active network interface (disconnected?)");
  }

  console.log(obj.ip_address)

  const device = Cap.findDevice(obj.ip_address);
  const filter = 'udp and port 5056';
  const bufSize = 10 * 1024 * 1024;

  linkType = cap.open(device, filter, bufSize, buffer);
  console.log(linkType)
  cap.setMinBytes && cap.setMinBytes(0);
  cap.on('packet', onPacket);
})
