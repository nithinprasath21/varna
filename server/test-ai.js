const axios = require('axios');

async function test() {
    try {
        console.log("Sending request...");
        const res = await axios.post('http://localhost:5000/ai/generate-description', {
            title: "Handmade Pot",
            category: "Pottery"
        });
        console.log("Response:", res.data);
    } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
        console.error("Status:", err.response ? err.response.status : "Unknown");
    }
}

test();
