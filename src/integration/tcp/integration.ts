/// <reference path="../../tcp/tcp.d.ts" />
/// <reference path='../../arraybuffers/arraybuffers.d.ts' />
/// <reference path='../../freedom/typings/freedom.d.ts' />

// Starts an echo server on a free port and verifies that the server
// is listening on that port. Tests:
//  - a free port is chosen when port zero is requested
//  - server sockets receive connectionsQueue events
//  - client sockets receive onceConnected and dataFromSocketQueue events
//  - sockets supplied to connectionsQueue events can receive data
//  - client sockets can send data
freedom().on('listen', () => {
  var server = new Tcp.Server({
    address: '127.0.0.1',
    port: 0
  });

  server.connectionsQueue.setSyncHandler((tcpConnection:Tcp.Connection) => {
    tcpConnection.dataFromSocketQueue.setSyncHandler((buffer:ArrayBuffer) => {
      tcpConnection.send(buffer);
    });
  });

  server.listen().then((endpoint:Net.Endpoint) => {
    var client = new Tcp.Connection({endpoint: endpoint});
    client.dataFromSocketQueue.setSyncNextHandler((buffer:ArrayBuffer) => {
      var s = ArrayBuffers.arrayBufferToString(buffer);
      if (s == 'ping') {
        freedom().emit('listen');
      }
    });
    client.onceConnected.then((info:Tcp.ConnectionInfo) => {
      client.send(ArrayBuffers.stringToArrayBuffer('ping'));
    });
  });
});

// Starts a server on a free port and makes a connection to that
// port before shutting down the server.
// Tests:
//  - server sockets receive connectionsQueue events
//  - client sockets receive onceConnected events
//  - client sockets receive onceClosed events on server shutdown
//  - sockets supplied to connectionsQueue receive onceClosed events
//    on server shutdown
//  - onceShutdown fulfills
freedom().on('shutdown', () => {
  var server = new Tcp.Server({
    address: '127.0.0.1',
    port: 0
  });

  server.listen().then((endpoint:Net.Endpoint) => {
    var client = new Tcp.Connection({endpoint: endpoint});
    server.connectionsQueue.setSyncHandler((connection:Tcp.Connection) => {
      client.onceConnected.then(() => {
        server.shutdown();
        return Promise.all<any>([connection.onceClosed, client.onceClosed,
            server.onceShutdown()]);
      })
      .then((values:any) => {
        freedom().emit('shutdown');
      });
    });
  });
});

// Starts a server on a free port and makes a connection to that
// port before closing that connection.
// Tests:
//  - server sockets receive connectionsQueue events
//  - client sockets receive onceConnected and onceClosed events
//  - sockets supplied to connectionsQueue receive onceClosed events
freedom().on('onceclosed', () => {
  var server = new Tcp.Server({
    address: '127.0.0.1',
    port: 0
  });

  server.listen().then((endpoint:Net.Endpoint) => {
    var client = new Tcp.Connection({endpoint: endpoint});
    server.connectionsQueue.setSyncHandler((connection:Tcp.Connection) => {
      client.onceConnected.then(() => {
        client.close();
        return Promise.all<any>([connection.onceClosed, client.onceClosed]);
      })
      .then((values:any) => {
        freedom().emit('onceclosed');
      });
    });
  });
});
