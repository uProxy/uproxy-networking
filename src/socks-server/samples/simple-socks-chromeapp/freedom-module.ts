/// <reference path='../../../socks-to-rtc/socks-to-rtc.ts' />
/// <reference path='../../../rtc-to-net/rtc-to-net.ts' />

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
    true); // obfuscate

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
    true); // obfuscate

//-----------------------------------------------------------------------------
socksRtc.signalsForPeer.setSyncHandler(rtcNet.handleSignalFromPeer);
rtcNet.signalsForPeer.setSyncHandler(socksRtc.handleSignalFromPeer);

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
