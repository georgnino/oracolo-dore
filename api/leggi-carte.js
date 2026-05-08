exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Metodo non consentito" };

    try {
        const { prompt } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: "Manca la chiave GEMINI_API_KEY su Netlify!" }) };

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        
        // Se Google ci restituisce un errore, lo mostriamo chiaramente
        if (data.error) {
            return { statusCode: 500, body: JSON.stringify({ error: "Errore Google: " + data.error.message }) };
        }

        const testoIA = data.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lettura: testoIA })
        };

    } catch (error) {
        // Mostriamo l'errore tecnico esatto invece del messaggio dell'incenso
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Errore tecnico: " + error.message }) 
        };
    }
};
