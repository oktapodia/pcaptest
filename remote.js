import { spawn } from 'child_process';
import path from 'path';
import pkg from 'cap';
import PacketHandler from './PacketHandler.js';

const { Cap, decoders } = pkg;
const { PROTOCOL } = decoders;

const cap = new Cap();
const packetHandler = new PacketHandler();

const debug = true;
let linkType;
let buffer = Buffer.alloc(65535);
let albionPort = 5056;
let ret = { offset: 0 };

let python = spawn('python', [path.join('scripts/udp_receiver.py'), '-p', '1234']);
python.stdout.on('data', (data) => {
  console.log('datapy', data);
  linkType = 'LINKTYPE_RAW';
  // ret = decoders.Ethernet(data, 0);

  console.log('ethernet', ret)
  ret = decoders.IPV4(data, ret.offset);

  console.log('ip', ret)

  ret = decoders.UDP(data, ret.offset);
  console.log('udp', ret)
  if (ret.info.protocol === PROTOCOL.UDP) {
    packetHandler.packetHandler(data.slice(ret.offset, data.length), albionPort);
  }


  // I do not figure it out, did try with, without ethernet etc...:(
});
python.stderr.on('data', (data) => {
  console.log('toto', data);
});

python.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});

