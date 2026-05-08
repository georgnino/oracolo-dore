exports.handler = async (event, context) => {
    // Accetta solo richieste POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: JSON.stringify({ error: "Metodo non consentito" }) };
    }

    try {
        // Estraiamo il prompt dai dati inviati (event.body su Netlify è una stringa)
        const body = JSON.parse(event.body);
        const prompt = body.prompt;

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return { 
                statusCode: 500, 
                body: JSON.stringify({ error: "Chiave API non configurata" }) 
            };
        }

        // Endpoint ufficiale di Gemini 1.5 Flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const aiResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 800,
                }
            })
        });

        if (!aiResponse.ok) {
            return { statusCode: 500, body: JSON.stringify({ error: "Errore nella chiamata a Gemini" }) };
        }

        const data = await aiResponse.json();
        const letturaTesto = data.candidates[0].content.parts[0].text;

        // Su Netlify dobbiamo restituire un oggetto con statusCode e body (stringa)
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lettura: letturaTesto })
        };

    } catch (error) {
        console.error("Errore:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "I fumi dell'incenso offuscano la visione." })
        };
    }
};
