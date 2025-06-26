document.getElementById('predictBtn').addEventListener('click', predictDelay);

async function predictDelay() {
  const formData = {
    Distance_km: parseFloat(document.getElementById('distance').value),
    Delivery_Speed: parseFloat(document.getElementById('speed').value),
    Agent_Rating: parseFloat(document.getElementById('rating').value),
    Agent_Efficiency: parseFloat(document.getElementById('efficiency').value),
    Traffic_Level: parseInt(document.getElementById('traffic').value),
    Weather_Impact: parseInt(document.getElementById('weather').value),
    Weekday: parseInt(document.getElementById('weekday').value),
    Time_of_Day: document.getElementById('time').value
  };

  document.getElementById('loadingIndicator').style.display = 'flex';
  document.getElementById('resultContainer').style.display = 'none';

  try {
    const response = await fetch('https://nodelay.onrender.com/predict_delay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) throw new Error('Network response was not ok');
    const result = await response.json();

    const resultCard = document.getElementById('delayValue');
    resultCard.innerHTML = result.delay_expected
      ? `<span class="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-lg font-semibold">
          ⚠️ Delay Expected — ${Math.round(result.probability_of_delay * 100)}% chance
         </span>`
      : `<span class="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-lg font-semibold">
          ✅ On Time — ${Math.round(result.probability_of_delay * 100)}% safe
         </span>`;

    document.getElementById('resultContainer').style.display = 'block';

  } catch (error) {
    console.error('Error:', error);
    document.getElementById('delayValue').textContent = 'Error';
    document.getElementById('resultContainer').style.display = 'block';
  } finally {
    document.getElementById('loadingIndicator').style.display = 'none';
  }
}
