export default async function handler(req, res) {
    // Accetta solo richieste POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metodo non consentito' });
    }

    const { prompt } = req.body;
    
    // La chiave API di Gemini salvata nelle variabili d'ambiente su Vercel
    const apiKey = process.env.GEMINI_API_KEY; 

    if (!apiKey) {
        return res.status(500).json({ error: 'Chiave API non configurata' });
    }

    // Endpoint ufficiale di Gemini 1.5 Flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const aiResponse = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                // Configurazione per rendere l'output creativo ma coerente
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 800,
                }
            })
        });

        if (!aiResponse.ok) {
            const errorData = await aiResponse.text();
            console.error("Errore API Gemini:", errorData);
            throw new Error('Errore nella chiamata a Gemini');
        }

        const data = await aiResponse.json();
        
        // Estrapoliamo il testo dalla struttura di risposta di Gemini
        const letturaTesto = data.candidates[0].content.parts[0].text;

        res.status(200).json({ lettura: letturaTesto });

    } catch (error) {
        console.error("Errore Server:", error);
        res.status(500).json({ error: 'I fumi dell\'incenso offuscano la visione.' });
    }
}