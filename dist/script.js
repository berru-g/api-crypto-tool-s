// Récupérer les données depuis l'API CoinGecko
async function fetchData() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=cyberconnect');
    const data = await response.json();
    return data[0]; // La première entrée correspond à CyberConnect
  } catch (error) {
    console.error(error);
  }
}

async function updateInfo() {
  const coinData = await fetchData();

  const rankElement = document.getElementById('rank');
  const marketCapElement = document.getElementById('market-cap');
  const marketDominanceElement = document.getElementById('market-dominance');
  const allTimeHighElement = document.getElementById('all-time-high');
  const allTimeLowElement = document.getElementById('all-time-low');
  const whitePaperLink = document.getElementById('white-paper');
  const blockExplorerLink = document.getElementById('block-explorer');

  rankElement.textContent = coinData.market_cap_rank;
  marketCapElement.textContent = `$${formatNumber(coinData.market_cap)}`;
  marketDominanceElement.textContent = `${coinData.market_cap_percentage.toFixed(2)}%`;
  allTimeHighElement.textContent = `$${formatNumber(coinData.ath)}`;
  allTimeLowElement.textContent = `$${formatNumber(coinData.atl)}`;
  
  whitePaperLink.href = coinData.links.whitepaper[0];
  blockExplorerLink.href = coinData.links.blockchain_site[0];
}

// Fonction pour formater les nombres avec des décimales
function formatNumber(number) {
  return new Intl.NumberFormat().format(number);
}

// Mettre à jour les informations de prix et de variation
async function updateInfo() {
  const coinData = await fetchData();

  const livePriceElement = document.getElementById('live-price');
  const priceChangeElement = document.getElementById('price-change');

  livePriceElement.textContent = `$${formatNumber(coinData.current_price)}`;
  const priceChange = coinData.price_change_percentage_24h;
  priceChangeElement.textContent = `${priceChange.toFixed(2)}%`;
// color change
if (priceChange > 0) {
  priceChangeElement.style.color = 'lightgreen';
  livePriceElement.style.color = 'lightgreen';
  document.querySelector('.header').style.backgroundColor = 'lightgreen'; 
  document.querySelector('.cta-button').style.backgroundColor = 'lightgreen';
} else if (priceChange < 0) {
  priceChangeElement.style.color = 'lightcoral';
  livePriceElement.style.color = 'lightcoral';
  document.querySelector('.header').style.backgroundColor = 'lightcoral';
  document.querySelector('.cta-button').style.backgroundColor = 'lightcoral';
} else {
  priceChangeElement.style.color = '#007bff';
  document.querySelector('.header').style.backgroundColor = '#f0f0f0'; 
  document.querySelector('.cta-button').style.backgroundColor = '#f0f0f0';
}

}

// Appel initial pour mettre à jour les informations
updateInfo();


// Obtenir les données historiques de prix depuis CoinGecko
async function fetchHistoricalData() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/cyberconnect/market_chart?vs_currency=usd&days=7');
    const data = await response.json();
    return data.prices;
  } catch (error) {
    console.error(error);
  }
}

// Créer le graphique
async function createChart() {
  const historicalData = await fetchHistoricalData();

  const chartCanvas = document.getElementById('price-chart');
  const ctx = chartCanvas.getContext('2d');

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: historicalData.map(entry => new Date(entry[0]).toLocaleDateString()),
      datasets: [{
        label: 'Prix en EUR',
        data: historicalData.map(entry => entry[1]),
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        borderColor: 'rgba(0, 123, 255, 1)',
        borderWidth: 1,
        fill: 'start',
        lineTension: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// Appel pour créer le graphique
createChart();

//tool % chance up & down--------------------------

// Calculer la moyenne mobile sur une période donnée
function calculateMovingAverage(data, period) {
  if (data.length < period) {
    return null; // Impossible de calculer la moyenne mobile avec si peu de données
  }

  const prices = data.slice(-period); // Sélectionner les derniers "period" prix
  const sum = prices.reduce((acc, price) => acc + price[1], 0);
  return sum / period;
}

// Appel pour calculer la moyenne mobile
async function calculateAndDisplayMovingAverage() {
  const historicalData = await fetchHistoricalData();
  const movingAveragePeriod = 7; // Vous pouvez ajuster la période selon vos préférences

  const movingAverage = calculateMovingAverage(historicalData, movingAveragePeriod);
/*
  if (movingAverage !== null) {
    const movingAverageElement = document.getElementById('moving-average');
    movingAverageElement.textContent = `$${formatNumber(movingAverage.toFixed(2))}`;
  }
  */
  if (movingAverage !== null) {
  const movingAverageElement = document.getElementById('moving-average-data');
  displayDataInDiv(`Moyenne mobile : $${formatNumber(movingAverage.toFixed(2))}`, 'moving-average-data');
}
}

// Appel pour calculer et afficher la moyenne mobile
calculateAndDisplayMovingAverage();

// Fonction pour calculer le RSI
function calculateRSI(data, period) {
  if (data.length < period + 1) {
    return null; // Impossible de calculer le RSI avec si peu de données
  }

  // Calcul des gains et des pertes sur la période
  const changes = [];
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i][1] - data[i - 1][1]);
  }

  const gains = changes.filter(change => change > 0);
  const losses = changes.filter(change => change < 0);

  if (gains.length === 0) {
    return 0; // RSI est à 0 si tous les changements sont des pertes
  }

  if (losses.length === 0) {
    return 100; // RSI est à 100 si tous les changements sont des gains
  }

  const avgGain = gains.reduce((acc, gain) => acc + gain, 0) / period;
  const avgLoss = Math.abs(losses.reduce((acc, loss) => acc + loss, 0)) / period;

  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Appel pour calculer et afficher le RSI
calculateAndDisplayRSI();

// Fonction pour afficher les données dans une div
function displayDataInDiv(data, elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = data;
  }
}

// Dans la fonction calculateAndDisplayRSI, mettez à jour la ligne où vous affichez le RSI comme ceci :
async function calculateAndDisplayRSI() {
  const historicalData = await fetchHistoricalData();
  const rsiPeriod = 14; // Vous pouvez ajuster la période du RSI selon vos préférences

  const rsi = calculateRSI(historicalData, rsiPeriod);

  if (rsi !== null) {
    const rsiElement = document.getElementById('rsi-data');
    displayDataInDiv(`RSI : ${rsi.toFixed(2)}`, 'rsi-data');
  }
}

// Appel pour calculer et afficher le RSI
calculateAndDisplayRSI();

// Fonction pour calculer l'indicateur Stochastique
function calculateStochastic(data, period) {
  if (data.length < period + 1) {
    return null; // Impossible de calculer le stochastique avec si peu de données
  }

  // Étape 1 : Calcul des valeurs minimales et maximales sur la période
  let minLow = Number.MAX_VALUE;
  let maxHigh = Number.MIN_VALUE;

  for (let i = data.length - period; i < data.length; i++) {
    const high = data[i][2]; // Remplacez l'indice 2 par l'indice approprié dans vos données (prix le plus élevé)
    const low = data[i][3];  // Remplacez l'indice 3 par l'indice approprié dans vos données (prix le plus bas)

    if (high > maxHigh) {
      maxHigh = high;
    }

    if (low < minLow) {
      minLow = low;
    }
  }

  // Étape 2 : Calcul de la valeur stochastique
  const currentClose = data[data.length - 1][1]; // Remplacez l'indice 1 par l'indice approprié dans vos données (prix de clôture)
  const stochasticValue = ((currentClose - minLow) / (maxHigh - minLow)) * 100;

  return stochasticValue;
}

// Fonction pour identifier les niveaux de Support et Résistance
function identifySupportResistance(data) {
  // Implémentez l'identification des niveaux de Support et Résistance ici
  // Renvoyez les niveaux identifiés
}

// Appel pour calculer et afficher l'indicateur Stochastique
async function calculateAndDisplayStochastic() {
  const historicalData = await fetchHistoricalData();
  const stochasticPeriod = 14; // Vous pouvez ajuster la période du Stochastique selon vos préférences

  const stochasticValue = calculateStochastic(historicalData, stochasticPeriod);

  if (stochasticValue !== null) {
    const stochasticElement = document.getElementById('stochastic-data');
    displayDataInDiv(`Stochastique : ${stochasticValue.toFixed(2)}`, 'stochastic-data');
  }
}

// Appel pour identifier et afficher les niveaux de Support et Résistance
async function identifyAndDisplaySupportResistance() {
  const historicalData = await fetchHistoricalData();
  const supportResistanceLevels = identifySupportResistance(historicalData);

  if (supportResistanceLevels !== null) {
    const supportResistanceElement = document.getElementById('support-resistance-data');
    displayDataInDiv(`Support et Résistance : ${supportResistanceLevels}`, 'support-resistance-data');
  }
}

// Appel pour calculer et afficher l'indicateur Stochastique et les niveaux de Support et Résistance
calculateAndDisplayStochastic();
identifyAndDisplaySupportResistance();