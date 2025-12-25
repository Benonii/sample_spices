import { serve } from '@hono/node-server';
import app from '@/app';

const port = 5000;

console.log(`Server running on port ${port}`);
serve({
	fetch: app.fetch,
	port
});
