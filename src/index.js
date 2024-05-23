import { Ai } from './vendor/@cloudflare/ai.js';

export default {
	async fetch(request, env) {
		const ai = new Ai(env.AI);
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST, PATCH, GET, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': '*',
			'Access-Control-Max-Age': '86400',
		};
		const h = new Headers();
		for (const key in corsHeaders) {
			h.set(key, corsHeaders[key]);
		}
		if (new URL(request.url).pathname === '/convert' && request.method === 'POST') {
			//    console.log("convert");
			const { lang, message, target } = await request.json();
			let simple = {
				text: message || 'good day Linguaverse AI',
				source_lang: target || 'english', // defaults to english
				target_lang: lang || 'french',
			};
			let response = await ai.run('@cf/meta/m2m100-1.2b', simple);
			return Response.json(
				{ inputs: simple, response },
				{
					status: 201,
					headers: h,
				}
			);
		}
		if (new URL(request.url).pathname === '/chat' && request.method === 'POST') {
			// console.log("chat");
			const { lang, message } = await request.json();
			let chat = {
				messages: [
					{
						role: 'system',
						content:
							'you are a polygot professional called Lingua AI, respond to users in their language helping them effectively learn and understand the language they want to learn, if user message is unclear try to translate it instead.',
					},
					{ role: 'user', content: `language to learn = '${lang || 'french'}', user message = '${message || 'hello'}'` },
				],
			};
			const response = await ai.run('@cf/meta/llama-2-7b-chat-int8', chat);
			return Response.json(
				{ inputs: chat, response },
				{
					status: 201,
					headers: h,
				}
			);
		}
		return new Response('Linguaverse AI: not found!', { status: 200, headers: h });
	},
};
