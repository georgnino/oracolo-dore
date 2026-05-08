exports.handler = async (event) => {
    // 1. Accetta solo richieste POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Metodo non consentito" };
    }

    try {
        const { prompt } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return { statusCode: 500, body: JSON.stringify({ error: "Chiave API mancante" }) };
        }

        // 2. Chiamata diretta a Google (senza librerie esterne)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        
        // 3. Estraiamo il responso
        const testoIA = data.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lettura: testoIA })
        };

    } catch (error) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "L'Oracolo è temporaneamente silente." }) 
        };
    }
};
