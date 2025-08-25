export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", // Allow all origins (or replace with your domain)
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
    if (request.method !== 'POST') {
      return new Response("Use POST with JSON body: { query: '...'}", { status: 405, headers: corsHeaders });
    }
    // Step 1: Load the rag_index.json from R2 bucket named "ASSETS"
    const object = await env.ASSETS.get(env.rag_json);
    if (!object) {
      return new Response("❌ RAG index not found in R2", { status: 404, headers: corsHeaders });
    }
    const ragData = JSON.parse(await object.text());
    // Step 2: Parse input (optional – for now we use a fixed query)
    const { query } = await request.json();
    // Step 3: Embed the query using Cloudflare's embedding model
    const embeddingResponse=await env.AI.run('@cf/baai/bge-small-en-v1.5', {
      text: [query]  // must be an array of strings!
    });
    const queryEmbedding = embeddingResponse.data[0];
    // Step 4: Run simple cosine similarity to find top matches
    function cosineSim(a, b) {
      let dot = 0.0;
      let normA = 0.0;
      let normB = 0.0;
      for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
      }
      return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    const topMatches = ragData
      .map(item => ({
        text: item.text,
        score: cosineSim(
          queryEmbedding,
          item.embedding.map(Number) // ensure numbers
        )
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    const context = topMatches.map(m => m.text).join("\n---\n");
    // Step 5: Create a system prompt using the matched RAG data
    let chat = {
      messages: [
        {
          role: 'system',
          content: `Answer on the basis of context : \n\n${context}\n\n`
        },
        { role: 'user', content: query }
      ]
    };
    //
    const response = await env.AI.run('@cf/mistral/mistral-7b-instruct-v0.2-lora', chat);
    //const response = await env.AI.run('@cf/baai/bge-small-en-v1.5', chat);
    const newHeaders = new Headers(response.headers);
    for (const [key, value] of Object.entries(corsHeaders)) {
      newHeaders.set(key, value);
    }
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: newHeaders,
    });
  }
};