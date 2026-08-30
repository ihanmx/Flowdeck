// import { INestApplicationContext } from '@nestjs/common';
// import { IoAdapter } from '@nestjs/platform-socket.io';
// import { createAdapter } from '@socket.io/redis-adapter';
// import { createClient } from 'redis';
// import { ServerOptions } from 'socket.io';

// //IoAdapter is the default WebSocket adapter
// export class RadisIoAdapter extends IoAdapter {
//   private adapterConstructor: ReturnType<typeof createAdapter> | null = null;

//   //The base IoAdapter needs a reference to your Nest app to work. So our constructor takes app and passes it straight up to the parent with super(app)
//   constructor(app: INestApplicationContext) {
//     super(app);
//   }

//   async connectToRadis():Promise<void>{

//   }
// }
