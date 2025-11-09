const { io } = require('socket.io-client');

const URL = process.env.SOCKET_URL || 'http://103.163.24.150:3001';

function testNamespace(ns, userId) {
  console.log('\n--- Testing namespace', ns, '---');
  const socket = io(`${URL}${ns}`, {
    path: '/socket.io/',
    transports: ['websocket'],
    auth: { userId },
    reconnection: false,
    timeout: 5000,
  });

  socket.on('connect', () => {
    console.log(ns, 'connected, id=', socket.id);
    socket.disconnect();
  });
  socket.on('connect_error', (err) => {
    console.error(ns, 'connect_error:', err && err.message ? err.message : err);
  });
  socket.on('disconnect', (reason) => {
    console.log(ns, 'disconnected, reason=', reason);
  });
}

(async ()=>{
  testNamespace('/auctions', 'test-user-123');
  testNamespace('/notifications', 'test-user-123');
  // allow time for attempts
  setTimeout(()=> process.exit(0), 8000);
})();
