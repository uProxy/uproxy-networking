/// <reference path='../../../rtc-to-net/rtc-to-net.d.ts' />
/// <reference path='../../../socks-to-rtc/socks-to-rtc.d.ts' />

/// <reference path='../../../webrtc/peerconnection.d.ts' />
/// <reference path='../../../freedom/coreproviders/uproxylogging.d.ts' />
/// <reference path='../../../freedom/typings/freedom.d.ts' />
/// <reference path='../../../networking-typings/communications.d.ts' />

var log :Freedom_UproxyLogging.Log = freedom['core.log']('simple-socks');

//-----------------------------------------------------------------------------
var localhostEndpoint:Net.Endpoint = { address: '127.0.0.1', port:9999 };

//-----------------------------------------------------------------------------
var rtcNetPcConfig :WebRtc.PeerConnectionConfig = {
    webrtcPcConfig: {
      iceServers: [{url: 'stun:stun.l.google.com:19302'},
                   {url: 'stun:stun1.l.google.com:19302'},
                   {url: 'stun:stun2.l.google.com:19302'},
                   {url: 'stun:stun3.l.google.com:19302'},
                   {url: 'stun:stun4.l.google.com:19302'}]
    },
    webrtcMediaConstraints: {
      optional: [{DtlsSrtpKeyAgreement: true}]
    },
    peerName: 'rtcNet'
  };
var rtcNet = new RtcToNet.RtcToNet(
    rtcNetPcConfig,
    {
      allowNonUnicast: true
    },
    false); // obfuscate

//-----------------------------------------------------------------------------
var socksRtcPcConfig :WebRtc.PeerConnectionConfig = {
    webrtcPcConfig: {
      iceServers: [{url: 'stun:stun.l.google.com:19302'},
                   {url: 'stun:stun1.l.google.com:19302'},
                   {url: 'stun:stun2.l.google.com:19302'},
                   {url: 'stun:stun3.l.google.com:19302'},
                   {url: 'stun:stun4.l.google.com:19302'}]
    },
    webrtcMediaConstraints: {
      optional: [{DtlsSrtpKeyAgreement: true}]
    },
    peerName: 'socksRtc'
  };
var socksRtc = new SocksToRtc.SocksToRtc(
    localhostEndpoint,
    socksRtcPcConfig,
    false); // obfuscate

//-----------------------------------------------------------------------------

var getterBytesReceived :number = 0;
var getterBytesSent :number = 0;
var giverBytesReceived :number = 0;
var giverBytesSent :number = 0;

socksRtc.signalsForPeer.setSyncHandler(rtcNet.handleSignalFromPeer);
rtcNet.signalsForPeer.setSyncHandler(socksRtc.handleSignalFromPeer);

socksRtc.bytesReceivedFromPeer.setSyncHandler((numBytes:number) => {
  getterBytesReceived += numBytes;
  log.debug('Getter received ' + numBytes + ' bytes. (Total received: '
    + getterBytesReceived + ' bytes)');
});

socksRtc.bytesSentToPeer.setSyncHandler((numBytes:number) => {
  getterBytesSent += numBytes;
  log.debug('Getter sent ' + numBytes + ' bytes. (Total sent: '
    + getterBytesSent + ' bytes)');
});

rtcNet.bytesReceivedFromPeer.setSyncHandler((numBytes:number) => {
  giverBytesReceived += numBytes;
  log.debug('Giver received ' + numBytes + ' bytes. (Total received: '
    + giverBytesReceived + ' bytes)');
});

rtcNet.bytesSentToPeer.setSyncHandler((numBytes:number) => {
  giverBytesSent += numBytes;
  log.debug('Giver sent ' + numBytes + ' bytes. (Total sent: '
    + giverBytesSent + ' bytes)');
});

socksRtc.onceReady
  .then((endpoint:Net.Endpoint) => {
    log.info('socksRtc ready. listening to SOCKS5 on: ' + JSON.stringify(endpoint));
    log.info('` curl -x socks5h://localhost:9999 www.google.com `')
  })
  .catch((e) => {
    console.error('socksRtc Error: ' + e +
        '; ' + this.socksRtc.toString());
  });

rtcNet.onceReady.then(() => {
  log.info('rtcNet ready.');
});
