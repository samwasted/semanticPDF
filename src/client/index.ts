import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../trpc/index';
//     👆 **type-only** import
 
// Pass AppRouter as generic here. 👇 This lets the `trpc` object know
// what procedures are available on the server and their input/output types.
const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000',
    }),
  ],
});

const user = await trpc.authCallback.query()