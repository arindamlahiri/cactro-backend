import fastify, { FastifyRequest } from 'fastify';
import fastifyEnv from '@fastify/env';
import { z } from 'zod';
import { cache } from './schema';
import { and, eq } from 'drizzle-orm';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { neon, NeonQueryFunction } from '@neondatabase/serverless';

let db: NeonHttpDatabase<Record<string, never>> & {
	$client: NeonQueryFunction<false, false>;
};

const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const host = 'RENDER' in process.env ? `0.0.0.0` : `localhost`;

const app = fastify({
	logger: true
});

const envSchema = {
	type: 'object',
	required: ['DATABASE_URL'],
	properties: {
		DATABASE_URL: {
			type: 'string'
		}
	}
};

app.get('/health-check', async () => {
	return 'All good';
});

// Key and value can be number or string. They are stored as string in the database.
const keySchema = z
	.union([z.string().min(1).max(999), z.number().min(1)])
	.pipe(z.coerce.string());
const valueSchema = z
	.union([z.string().min(1).max(1900), z.number().min(1)])
	.pipe(z.coerce.string());

app.post(
	'/cache',
	async (
		req: FastifyRequest<{ Body: { key: string; value: string } }>,
		reply
	) => {
		const { key, value } = req.body;

		const schema = z.object({
			key: keySchema,
			value: valueSchema
		});

		const validationResult = schema.safeParse({ key, value });

		if (!validationResult.success) {
			return reply.status(400).send(validationResult.error);
		}

		const cacheData = { key, value, isDeleted: false };

		await db.insert(cache).values(cacheData).onConflictDoUpdate({
			target: cache.key,
			set: cacheData
		});

		return reply.status(201).send('Created');
	}
);

app.get(
	'/cache/:key',
	async (req: FastifyRequest<{ Params: { key: string } }>, reply) => {
		const { key } = req.params;

		const validationResult = keySchema.safeParse(key);

		if (!validationResult.success) {
			return reply.status(400).send(validationResult.error);
		}

		const [cacheObj] = await db
			.select({ key: cache.key, value: cache.value })
			.from(cache)
			.where(and(eq(cache.key, key), eq(cache.isDeleted, false)));

		if (!cacheObj) {
			return reply.status(404).send('Not found');
		}

		const parsedValue = isNaN(Number(cacheObj.value))
			? cacheObj.value
			: Number(cacheObj.value);

		const response = {
			key: cacheObj.key,
			value: parsedValue
		};

		return reply.status(200).send(response);
	}
);

app.delete(
	'/cache/:key',
	async (req: FastifyRequest<{ Params: { key: string } }>, reply) => {
		const { key } = req.params;

		const validationResult = keySchema.safeParse(key);

		if (!validationResult.success) {
			return reply.status(400).send(validationResult.error);
		}

		await db
			.update(cache)
			.set({ isDeleted: true })
			.where(and(eq(cache.key, key), eq(cache.isDeleted, false)));

		return reply.status(200).send('Deleted');
	}
);

(async () => {
	app.register(fastifyEnv, {
		dotenv: true,
		schema: envSchema
	});
	await app.after();

	const sql = neon(process.env.DATABASE_URL!);
	db = drizzle({ client: sql });
	app.listen({ host, port }, (err, address) => {
		if (err) {
			console.error(err);
			process.exit(1);
		}
		console.log(`Server listening at ${address}`);
	});
})();
