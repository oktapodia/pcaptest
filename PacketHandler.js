import BinaryReader from './libs/BinaryReader.js';

class PacketHandler {
  constructor(events, debug) {
    this.events = events;
    this.debug = debug;

    this.commandHeaderLength = 12;
    this.photonHeaderLength = 12;

    this.commandType = {
      Disconnect: 4,
      SendReliable: 6,
      SendUnreliable: 7,
      SendFragment: 8,
    };

    this.messageType = {
      OperationRequest: 2,
      OperationResponse: 3,
      Event: 4,
    };

    // this.Deserializer = new Protocol16.Deserializer();
    // this._pendingSegments = {};
  }

  packetHandler(buf) {
    if(buf.length < this.photonHeaderLength) {
      return;
    }

    let p = new BinaryReader(buf);

    const peerId        = p.ReadInt16();
    const flags         = p.ReadUInt8();
    const commandCount  = p.ReadUInt8();
    const timestamp     = p.ReadUInt32();
    const challenge     = p.ReadUInt32();

    const isEncrypted = flags == 1;
    const isCrcEnabled = flags == 204;

    // console.log(peerId, flags, `commandcount: ${commandCount}`, timestamp, challenge, isEncrypted)

    if(isEncrypted) {
      if(this.debug === true) {
        console.log(`Encrypted packages are not supported`);
      }

      return;
    }

    for(let commandIdx = 0; commandIdx < commandCount; commandIdx++) {
      this.handleCommand(p);
    }
  }

  handleCommand(p) {
    const commandType       = p.ReadUInt8();
    const channelId         = p.ReadUInt8();
    const commandFlags      = p.ReadUInt8();
    const unkBytes          = p.ReadUInt8();
    let commandLength       = p.ReadUInt32();
    const sequenceNumber    = p.ReadUInt32();

    commandLength -= this.commandHeaderLength;

    console.log('command', commandType, channelId, commandFlags, unkBytes, commandLength, sequenceNumber)

    if(commandType == this.commandType.Disconnect) {
      return;
    }

    else if(commandType == this.commandType.SendReliable || commandType == this.commandType.SendUnreliable) {
      if(commandType == this.commandType.SendUnreliable) {
        p.position += 4;
        commandLength -= 4;
      }
      console.log('sendreliable')

      // this.handleSendReliable(p, commandLength);
      return;
    }

    else if(commandType == this.commandType.SendFragment) {
      console.log('sendfragment')
      // this.handleSendFragment(p, commandLength);
      return;
    }

    p.position += commandLength;

    return;
  }
}

export default PacketHandler;
