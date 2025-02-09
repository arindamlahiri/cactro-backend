import fastify from 'fastify';

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const host = 'RENDER' in process.env ? `0.0.0.0` : `localhost`;

const app = fastify({
	logger: true
});

app.get('/ping', async (request, reply) => {
	return 'pong\n';
});

app.listen({ host, port }, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`Server listening at ${address}`);
});
