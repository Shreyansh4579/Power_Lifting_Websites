/* Active nav link */
(function setActive(){
  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav a').forEach(a=>{
    const f = (a.getAttribute('href')||'').toLowerCase();
    if((!f && here==='index.html') || f===here){ a.classList.add('active'); }
  });
})();

/* Smooth scroll for #anchors */
document.addEventListener('click', e=>{
  const a = e.target.closest('a[href^="#"]');
  if(!a) return;
  const tgt = document.querySelector(a.getAttribute('href'));
  if(tgt){ e.preventDefault(); tgt.scrollIntoView({behavior:'smooth', block:'start'}); }
});

/* Workout filter */
window.applyWorkoutFilter = function(group){
  const cards = document.querySelectorAll('[data-group]');
  document.querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));
  document.querySelector(`[data-filter="${group}"]`)?.classList.add('active');
  cards.forEach(c=>{
    const show = group==='all' || c.dataset.group.split(',').includes(group);
    c.classList.toggle('hide', !show);
  });
};

/* Enhanced Nutrition search + category filtering */
let sortDir = 1;
let currentCategory = 'all';

window.sortTableBy = function(idx){
  const tbody = document.querySelector('#foods tbody');
  const rows = Array.from(tbody.querySelectorAll('tr:not(.hide)'));
  rows.sort((a,b)=>{
    const A = a.children[idx].dataset.num || a.children[idx].innerText.toLowerCase();
    const B = b.children[idx].dataset.num || b.children[idx].innerText.toLowerCase();
    return (A==B?0:(A>B?1:-1))*sortDir;
  });
  sortDir *= -1;
  rows.forEach(r=>tbody.appendChild(r));
};

window.searchFoods = function(query){
  const searchTerm = query.trim().toLowerCase();
  const searchResults = document.getElementById('searchResults');
  
  if (searchTerm.length < 2) {
    searchResults.innerHTML = '';
    searchResults.style.display = 'none';
    showAllFoods();
    return;
  }

  // Search through all foods
  const allFoods = document.querySelectorAll('#foods tbody tr');
  const matches = [];
  
  allFoods.forEach(row => {
    const foodName = row.children[0].innerText.toLowerCase();
    const category = row.getAttribute('data-category');
    
    if (foodName.includes(searchTerm)) {
      matches.push({
        name: row.children[0].innerText,
        portion: row.children[1].innerText,
        protein: row.children[2].innerText,
        carbs: row.children[3].innerText,
        fat: row.children[4].innerText,
        calories: row.children[5].innerText,
        category: category
      });
    }
  });

  // Display search results
  displaySearchResults(matches, searchResults);
  
  // Hide table rows that don't match
  allFoods.forEach(row => {
    const foodName = row.children[0].innerText.toLowerCase();
    row.classList.toggle('hide', !foodName.includes(searchTerm));
  });
};

function displaySearchResults(matches, container) {
  if (matches.length === 0) {
    container.innerHTML = '<div class="no-results">No foods found. Try a different search term.</div>';
    container.style.display = 'block';
    return;
  }

  const resultsHTML = matches.slice(0, 8).map(food => `
    <div class="search-result-item">
      <div class="food-name">${food.name}</div>
      <div class="food-macros">
        <span class="macro">P: ${food.protein}g</span>
        <span class="macro">C: ${food.carbs}g</span>
        <span class="macro">F: ${food.fat}g</span>
        <span class="macro">${food.calories} cal</span>
      </div>
      <div class="food-portion">${food.portion}</div>
    </div>
  `).join('');

  container.innerHTML = resultsHTML;
  container.style.display = 'block';
}

function showAllFoods() {
  const allFoods = document.querySelectorAll('#foods tbody tr');
  allFoods.forEach(row => {
    if (currentCategory === 'all' || row.getAttribute('data-category') === currentCategory) {
      row.classList.remove('hide');
    }
  });
}

window.filterByCategory = function(category) {
  currentCategory = category;
  
  // Update active button
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // Filter foods
  const allFoods = document.querySelectorAll('#foods tbody tr');
  allFoods.forEach(row => {
    if (category === 'all' || row.getAttribute('data-category') === category) {
      row.classList.remove('hide');
    } else {
      row.classList.add('hide');
    }
  });
  
  // Clear search
  const searchInput = document.getElementById('foodSearch');
  if (searchInput) {
    searchInput.value = '';
    document.getElementById('searchResults').style.display = 'none';
  }
};

/* Modal helpers */
const Modal = {
  open(id, title, html){
    const el = document.getElementById(id);
    el.querySelector('.modal-title').innerText = title;
    el.querySelector('.content').innerHTML = html;
    el.classList.add('show');
  },
  close(id){ document.getElementById(id).classList.remove('show'); }
};

window.Modal = Modal;

/* ---------- Start Page Functions ---------- */

// BMI Calculator Functions
window.calcBMI = function() {
  const weight = parseFloat(document.getElementById('bmi-weight')?.value || '');
  const heightCm = parseFloat(document.getElementById('bmi-height')?.value || '');
  const age = parseInt(document.getElementById('bmi-age')?.value || '', 10);
  const sex = document.getElementById('bmi-sex')?.value || 'male';
  const activity = parseFloat(document.getElementById('bmi-activity')?.value || '1.55');
  const output = document.getElementById('bmiResult');

  // Validation
  if (!weight || !heightCm || !age || isNaN(activity)) {
    output.innerHTML = '<div class="alert alert-error">Please fill in all fields with valid values.</div>';
    return;
  }

  if (weight < 20 || weight > 300) {
    output.innerHTML = '<div class="alert alert-error">Weight should be between 20-300 kg.</div>';
    return;
  }

  if (heightCm < 100 || heightCm > 230) {
    output.innerHTML = '<div class="alert alert-error">Height should be between 100-230 cm.</div>';
    return;
  }

  if (age < 12 || age > 90) {
    output.innerHTML = '<div class="alert alert-error">Age should be between 12-90 years.</div>';
    return;
  }

  // Calculations
  const heightM = heightCm / 100;
  const bmi = weight / (heightM * heightM);
  
  let category = 'Normal';
  let categoryColor = '#10b981';
  
  if (bmi < 18.5) {
    category = 'Underweight';
    categoryColor = '#f59e0b';
  } else if (bmi < 25) {
    category = 'Normal';
    categoryColor = '#10b981';
  } else if (bmi < 30) {
    category = 'Overweight';
    categoryColor = '#f59e0b';
  } else {
    category = 'Obese';
    categoryColor = '#ef4444';
  }

  // Mifflin-St Jeor BMR Formula
  let bmr = 10 * weight + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161);
  let tdee = bmr * activity;

  // Calorie recommendations based on BMI category
  let suggestedCalories = tdee;
  let recommendation = '';
  
  if (category === 'Underweight') {
    suggestedCalories = tdee + 300;
    recommendation = 'Consider a slight calorie surplus to gain healthy weight.';
  } else if (category === 'Overweight') {
    suggestedCalories = tdee - 300;
    recommendation = 'A moderate calorie deficit can help with healthy weight loss.';
  } else if (category === 'Obese') {
    suggestedCalories = tdee - 500;
    recommendation = 'A larger calorie deficit may be appropriate. Consult a healthcare provider.';
  } else {
    recommendation = 'Maintain current calories for weight maintenance.';
  }

  // Save to localStorage
  try {
    localStorage.setItem('bmiForm', JSON.stringify({
      weight, height: heightCm, age, sex, activity
    }));
    localStorage.setItem('bmiResults', JSON.stringify({
      bmi, category, bmr, tdee, suggestedCalories, recommendation
    }));
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }

  // Format numbers
  const formatNumber = (num) => Math.round(num).toLocaleString();
  const targetCalories = Math.round(suggestedCalories);
  const perMeal = Math.round(targetCalories / 3);

  // Display results
  output.innerHTML = `
    <div class="card bmi-results">
      <div class="card-content">
        <h3>Your Health Analysis</h3>
        
        <div class="bmi-summary" style="text-align: center; margin: 20px 0; padding: 20px; background: rgba(255,255,255,0.03); border-radius: 12px;">
          <div style="font-size: 48px; font-weight: 900; color: ${categoryColor}; margin-bottom: 8px;">
            ${bmi.toFixed(1)}
          </div>
          <div style="font-size: 18px; color: var(--muted);">BMI Score</div>
          <div style="font-size: 16px; color: ${categoryColor}; font-weight: 600; margin-top: 8px;">
            ${category}
          </div>
        </div>

        <div class="grid grid-2" style="gap: 20px; margin: 20px 0;">
          <div style="text-align: center; padding: 16px; background: rgba(110,231,255,0.05); border-radius: 12px;">
            <div style="font-size: 24px; font-weight: 700; color: var(--brand);">${formatNumber(bmr)}</div>
            <div style="color: var(--muted);">BMR (kcal/day)</div>
          </div>
          <div style="text-align: center; padding: 16px; background: rgba(167,139,250,0.05); border-radius: 12px;">
            <div style="font-size: 24px; font-weight: 700; color: var(--brand-2);">${formatNumber(tdee)}</div>
            <div style="color: var(--muted);">TDEE (kcal/day)</div>
          </div>
        </div>

        <div style="background: rgba(110,231,255,0.1); padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid var(--brand);">
          <h4 style="margin: 0 0 12px 0; color: var(--brand);">Recommended Daily Calories</h4>
          <div style="font-size: 32px; font-weight: 900; color: var(--ink);">${formatNumber(suggestedCalories)} kcal</div>
          <p style="margin: 8px 0 0 0; color: var(--muted);">${recommendation}</p>
        </div>

        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin: 20px 0;">
          <a class="btn" href="nutrition.html?targetCalories=${targetCalories}" style="flex: 1; min-width: 200px; text-align: center;">
            View foods around ${formatNumber(targetCalories)} kcal/day
          </a>
          <a class="btn outline" href="nutrition.html?targetCalories=${perMeal}" style="flex: 1; min-width: 200px; text-align: center;">
            Per meal ~ ${formatNumber(perMeal)} kcal
          </a>
        </div>

        <div style="color: var(--muted); font-size: 14px; text-align: center; margin-top: 20px; padding: 16px; background: rgba(255,255,255,0.02); border-radius: 8px;">
          <strong>Note:</strong> This is a starting point. Adjust 100-300 kcal based on weekly weight changes and energy levels. 
          Always consult with a healthcare professional for personalized advice.
        </div>
      </div>
    </div>
  `;

  // Scroll to results
  output.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Reset BMI form
window.resetBMI = function() {
  const fields = ['bmi-weight', 'bmi-height', 'bmi-age'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  
  // Reset sex and activity to defaults
  const sexSelect = document.getElementById('bmi-sex');
  const activitySelect = document.getElementById('bmi-activity');
  if (sexSelect) sexSelect.value = 'male';
  if (activitySelect) activitySelect.value = '1.55';
  
  const output = document.getElementById('bmiResult');
  if (output) output.innerHTML = '';
  
  try {
    localStorage.removeItem('bmiResults');
  } catch (e) {
    console.warn('Could not clear localStorage:', e);
  }
};

// Load saved BMI form data
window.loadBMIForm = function() {
  try {
    const saved = JSON.parse(localStorage.getItem('bmiForm') || '{}');
    if (saved.weight) document.getElementById('bmi-weight').value = saved.weight;
    if (saved.height) document.getElementById('bmi-height').value = saved.height;
    if (saved.age) document.getElementById('bmi-age').value = saved.age;
    if (saved.sex) document.getElementById('bmi-sex').value = saved.sex;
    if (saved.activity) document.getElementById('bmi-activity').value = saved.activity;
  } catch (e) {
    console.warn('Could not load saved form data:', e);
  }
};

// Load and display saved BMI results
window.loadBMIResults = function() {
  try {
    const saved = JSON.parse(localStorage.getItem('bmiResults') || 'null');
    if (saved) {
      const output = document.getElementById('bmiResult');
      if (output) {
        // Re-render the saved results
        window.calcBMI();
      }
    }
  } catch (e) {
    console.warn('Could not load saved results:', e);
  }
};

// Enhanced form validation
window.validateStartForm = function() {
  const level = document.getElementById('level')?.value;
  const days = document.getElementById('days')?.value;
  const equip = document.getElementById('equip')?.value;
  const goal = document.getElementById('goal')?.value;
  
  if (!level || !days || !equip || !goal) {
    alert('Please fill in all fields before proceeding.');
    return false;
  }
  
  return true;
};

function roundLoad(value, unit = 'lb') {
  const increment = unit === 'kg' ? 2.5 : 5;
  return Math.round(value / increment) * increment;
}

function formatLoad(value, unit = 'lb') {
  const rounded = roundLoad(value, unit);
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)} ${unit === 'kg' ? 'kg' : 'lbs'}`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}

function convertToUnit(value, fromUnit, toUnit) {
  if (!value || !fromUnit || fromUnit === toUnit) return value;
  if (fromUnit === 'kg' && toUnit === 'lb') return value * 2.2046226218;
  if (fromUnit === 'lb' && toUnit === 'kg') return value / 2.2046226218;
  return value;
}

function getAccessoryBlock(weakpoint, equipment) {
  const accessories = {
    squat: ['Paused Squat 3x4', 'Leg Press 3x10', 'Split Squat 3x8/side'],
    bench: ['Close-Grip Bench 3x6', 'DB Press 3x10', 'Triceps Pushdown 3x12'],
    deadlift: ['Block Pull 3x4', 'Romanian Deadlift 3x8', 'Barbell Row 4x8'],
    technique: ['Tempo Squat 3x5', 'Paused Bench 3x5', 'Deadlift Singles 6x1 @ RPE 6']
  };

  if (equipment === 'home') {
    return {
      squat: ['Paused Squat 3x4', 'Bulgarian Split Squat 3x8/side', 'Plank 3x45 sec'],
      bench: ['Close-Grip Bench 3x6', 'Push-Up 3xAMRAP', 'DB Row 3x10'],
      deadlift: ['Romanian Deadlift 3x8', 'Barbell Row 4x8', 'Back Extension 3x12'],
      technique: ['Tempo Squat 3x5', 'Paused Bench 3x5', 'Deadlift Singles 6x1 @ RPE 6']
    }[weakpoint];
  }

  return accessories[weakpoint];
}

function buildProgram(data) {
  const trainingMaxes = {
    squat: roundLoad(data.squatMax * 0.9, data.unit),
    bench: roundLoad(data.benchMax * 0.9, data.unit),
    deadlift: roundLoad(data.deadliftMax * 0.9, data.unit)
  };

  const intensity = data.goal === 'peak' ? 0.78 : data.goal === 'volume' ? 0.68 : 0.72;
  const benchIntensity = data.goal === 'volume' ? intensity + 0.02 : intensity;
  const repScheme = data.goal === 'peak' ? '4x3' : data.goal === 'volume' ? '4x8' : '5x5';
  const accessoryBlock = getAccessoryBlock(data.weakpoint, data.equip);

  const sessions = [
    {
      name: 'Day 1 - Squat Focus',
      lifts: [
        `Squat ${repScheme} @ ${formatLoad(trainingMaxes.squat * intensity, data.unit)}`,
        `Bench Technique 3x6 @ ${formatLoad(trainingMaxes.bench * 0.62, data.unit)}`,
        accessoryBlock[0]
      ]
    },
    {
      name: 'Day 2 - Bench Focus',
      lifts: [
        `Bench Press ${repScheme} @ ${formatLoad(trainingMaxes.bench * benchIntensity, data.unit)}`,
        `Deadlift Speed 5x2 @ ${formatLoad(trainingMaxes.deadlift * 0.6, data.unit)}`,
        accessoryBlock[1]
      ]
    },
    {
      name: 'Day 3 - Deadlift Focus',
      lifts: [
        `Deadlift ${data.goal === 'peak' ? '5x2' : '4x5'} @ ${formatLoad(trainingMaxes.deadlift * intensity, data.unit)}`,
        `Squat Volume 3x6 @ ${formatLoad(trainingMaxes.squat * 0.62, data.unit)}`,
        accessoryBlock[2]
      ]
    }
  ];

  if (data.days >= 4) {
    sessions.push({
      name: 'Day 4 - Upper Volume',
      lifts: [
        `Bench Press 4x6 @ ${formatLoad(trainingMaxes.bench * 0.65, data.unit)}`,
        'Overhead Press 3x8',
        'Rows 4x10'
      ]
    });
  }

  if (data.days >= 5) {
    sessions.push({
      name: 'Day 5 - Weak Point Builder',
      lifts: [
        accessoryBlock[0],
        accessoryBlock[1],
        'Core Work 4 rounds'
      ]
    });
  }

  if (data.days >= 6) {
    sessions.push({
      name: 'Day 6 - Recovery Technique',
      lifts: [
        `Squat Technique 6x2 @ ${formatLoad(trainingMaxes.squat * 0.55, data.unit)}`,
        `Bench Technique 6x3 @ ${formatLoad(trainingMaxes.bench * 0.55, data.unit)}`,
        'Mobility + Core 20 min'
      ]
    });
  }

  return {
    createdAt: new Date().toISOString(),
    ...data,
    trainingMaxes,
    sessions,
    progression: data.goal === 'peak'
      ? `Add ${data.unit === 'kg' ? '1-2.5 kg' : '2.5-5 lbs'} weekly while bar speed stays sharp. Reduce accessories in week 4.`
      : data.goal === 'volume'
        ? `Add reps first, then add ${data.unit === 'kg' ? '2.5 kg' : '5 lbs'} when all sets feel like RPE 8 or lower.`
        : `Add ${data.unit === 'kg' ? '2.5 kg' : '5 lbs'} to squat/deadlift and ${data.unit === 'kg' ? '1-2.5 kg' : '2.5-5 lbs'} to bench each week when all sets are completed.`
  };
}

function renderProgramResult(program) {
  const output = document.getElementById('programResult');
  if (!output) return;

  output.classList.add('show');
  output.innerHTML = `
    <div class="generated-program">
      <h3>Your Week 1 Program</h3>
      <p>Saved to your dashboard. Use these loads as starting points and adjust by feel if technique breaks down.</p>
      <div class="program-summary">
        <div class="summary-tile"><strong>${program.days}</strong><span>days/week</span></div>
        <div class="summary-tile"><strong>${program.bodyWeight}</strong><span>body weight ${program.bodyWeightUnit === 'kg' ? 'kg' : 'lbs'}</span></div>
        <div class="summary-tile"><strong>${program.level}</strong><span>level</span></div>
        <div class="summary-tile"><strong>${program.goal}</strong><span>goal</span></div>
        <div class="summary-tile"><strong>${program.weakpoint}</strong><span>focus</span></div>
      </div>
      <div class="training-week">
        ${program.sessions.map(session => `
          <div class="training-day">
            <h4>${escapeHTML(session.name)}</h4>
            <ul>${session.lifts.map(lift => `<li>${escapeHTML(lift)}</li>`).join('')}</ul>
          </div>
        `).join('')}
      </div>
      <p class="mt-2"><strong>Progression:</strong> ${escapeHTML(program.progression)}</p>
      <div class="mt-2" style="display:flex;gap:10px;flex-wrap:wrap">
        <a class="btn" href="progress.html">View Dashboard</a>
        <a class="btn outline" href="program.html">Compare Programs</a>
      </div>
    </div>
  `;
  output.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

window.generateProgram = function(event) {
  event.preventDefault();
  const data = {
    level: document.getElementById('level')?.value || 'beginner',
    days: parseInt(document.getElementById('days')?.value || '3', 10),
    bodyWeight: parseFloat(document.getElementById('bodyWeight')?.value || '0'),
    bodyWeightUnit: document.getElementById('bodyWeightUnit')?.value || 'kg',
    equip: document.getElementById('equip')?.value || 'commercial',
    goal: document.getElementById('goal')?.value || 'balanced',
    weakpoint: document.getElementById('weakpoint')?.value || 'technique',
    squatMax: parseFloat(document.getElementById('squatMax')?.value || '0'),
    squatMaxUnit: document.getElementById('squatMaxUnit')?.value || 'kg',
    benchMax: parseFloat(document.getElementById('benchMax')?.value || '0'),
    benchMaxUnit: document.getElementById('benchMaxUnit')?.value || 'kg',
    deadliftMax: parseFloat(document.getElementById('deadliftMax')?.value || '0'),
    deadliftMaxUnit: document.getElementById('deadliftMaxUnit')?.value || 'kg'
  };

  if (!data.bodyWeight || !data.squatMax || !data.benchMax || !data.deadliftMax) {
    alert('Please enter your body weight, squat, bench, and deadlift maxes.');
    return;
  }

  data.unit = data.squatMaxUnit || data.benchMaxUnit || data.deadliftMaxUnit || 'kg';
  data.squatMax = convertToUnit(data.squatMax, data.squatMaxUnit, data.unit);
  data.benchMax = convertToUnit(data.benchMax, data.benchMaxUnit, data.unit);
  data.deadliftMax = convertToUnit(data.deadliftMax, data.deadliftMaxUnit, data.unit);

  const program = buildProgram(data);
  localStorage.setItem('generatedProgram', JSON.stringify(program));
  renderProgramResult(program);
};

window.renderGeneratedProgramDashboard = function() {
  const panel = document.getElementById('programDashboard');
  if (!panel) return;

  const saved = localStorage.getItem('generatedProgram');
  if (!saved) {
    panel.innerHTML = `
      <div class="dashboard-empty">
        <p>No generated program yet.</p>
        <a class="btn" href="start.html">Generate Program</a>
      </div>
    `;
    return;
  }

  let program;
  try {
    program = JSON.parse(saved);
  } catch (error) {
    localStorage.removeItem('generatedProgram');
    panel.innerHTML = `
      <div class="dashboard-empty">
        <p>Your saved program could not be loaded.</p>
        <a class="btn" href="start.html">Generate Program</a>
      </div>
    `;
    return;
  }

  panel.innerHTML = `
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <h3>${escapeHTML(program.level)} ${escapeHTML(program.goal)} plan</h3>
        <p>Focus: ${escapeHTML(program.weakpoint)} &middot; ${program.days} days/week</p>
        <div class="dashboard-metrics">
          <div class="dashboard-metric"><strong>${formatLoad(program.trainingMaxes.squat, program.unit)}</strong><span>Squat TM</span></div>
          <div class="dashboard-metric"><strong>${formatLoad(program.trainingMaxes.bench, program.unit)}</strong><span>Bench TM</span></div>
          <div class="dashboard-metric"><strong>${formatLoad(program.trainingMaxes.deadlift, program.unit)}</strong><span>Deadlift TM</span></div>
        </div>
        <p class="mt-2">Body weight: ${escapeHTML(program.bodyWeight)} ${program.bodyWeightUnit === 'kg' ? 'kg' : 'lbs'}</p>
        <p class="mt-2">${escapeHTML(program.progression)}</p>
        <a class="btn mt-2" href="start.html">Regenerate Plan</a>
      </div>
      <div class="dashboard-card">
        <h4>This Week</h4>
        ${program.sessions.map(session => `
          <div class="dashboard-day">
            <strong>${escapeHTML(session.name)}</strong>
            <ul>${session.lifts.map(lift => `<li>${escapeHTML(lift)}</li>`).join('')}</ul>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

window.submitContact = function(event) {
  event.preventDefault();
  const form = event.target;
  const status = document.getElementById('contactStatus');
  const data = new FormData(form);
  const name = data.get('name') || '';
  const email = data.get('email') || '';
  const message = data.get('message') || '';
  const subject = encodeURIComponent(`Powerlifting Hub inquiry from ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);

  if (status) {
    status.textContent = 'Opening your email app with this message ready to send.';
    status.classList.add('show');
  }

  window.location.href = `mailto:shrey4579@gmail.com?subject=${subject}&body=${body}`;
};

/* Navigation Toggle */
window.toggleNav = function() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const isOpen = nav.classList.toggle('active');
  toggle?.setAttribute('aria-expanded', String(isOpen));
};

/* Enhanced Homepage Features */
window.initializeHomepage = function() {
  // Animate stats on scroll
  const stats = document.querySelectorAll('.stat-number');
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const finalValue = target.textContent;
        const numericValue = parseInt(finalValue.replace(/\D/g, ''));
        
        if (numericValue) {
          animateNumber(target, 0, numericValue, finalValue);
        }
        statsObserver.unobserve(target);
      }
    });
  }, observerOptions);

  stats.forEach(stat => statsObserver.observe(stat));

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Parallax effect for hero section
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroOverlay = document.querySelector('.hero-overlay');
    if (heroOverlay) {
      heroOverlay.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
  });
};

// Animate number counting
function animateNumber(element, start, end, finalText) {
  const duration = 2000;
  const startTime = performance.now();
  
  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const current = Math.floor(start + (end - start) * easeOutQuart(progress));
    element.textContent = current + finalText.replace(/\d+/g, '');
    
    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    } else {
      element.textContent = finalText;
    }
  }
  
  requestAnimationFrame(updateNumber);
}

// Easing function
function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

// Enhanced form validation with better UX
window.enhancedFormValidation = function() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      // Add focus effects
      input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
      });
      
      input.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
        validateField(this);
      });
      
      // Real-time validation
      input.addEventListener('input', function() {
        if (this.classList.contains('error')) {
          validateField(this);
        }
      });
    });
    
    // Enhanced form submission
    form.addEventListener('submit', function(e) {
      const isValid = validateForm(this);
      if (!isValid) {
        e.preventDefault();
        showFormErrors(this);
      }
    });
  });
};

// Validate individual field
function validateField(field) {
  const value = field.value.trim();
  const fieldType = field.type;
  let isValid = true;
  let errorMessage = '';
  
  // Required field validation
  if (field.hasAttribute('required') && !value) {
    isValid = false;
    errorMessage = 'This field is required';
  }
  
  // Email validation
  if (fieldType === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }
  }
  
  // Number validation
  if (fieldType === 'number' && value) {
    const num = parseFloat(value);
    const min = parseFloat(field.min);
    const max = parseFloat(field.max);
    
    if (isNaN(num)) {
      isValid = false;
      errorMessage = 'Please enter a valid number';
    } else if (min && num < min) {
      isValid = false;
      errorMessage = `Value must be at least ${min}`;
    } else if (max && num > max) {
      isValid = false;
      errorMessage = `Value must be no more than ${max}`;
    }
  }
  
  // Update field state
  if (isValid) {
    field.classList.remove('error');
    field.classList.add('valid');
    removeFieldError(field);
  } else {
    field.classList.remove('valid');
    field.classList.add('error');
    showFieldError(field, errorMessage);
  }
  
  return isValid;
}

// Validate entire form
function validateForm(form) {
  const inputs = form.querySelectorAll('input, select, textarea');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!validateField(input)) {
      isValid = false;
    }
  });
  
  return isValid;
}

// Show field error
function showFieldError(field, message) {
  removeFieldError(field);
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 4px;
    display: block;
  `;
  
  field.parentElement.appendChild(errorDiv);
}

// Remove field error
function removeFieldError(field) {
  const existingError = field.parentElement.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }
}

// Show form errors summary
function showFormErrors(form) {
  const errors = form.querySelectorAll('.error');
  if (errors.length > 0) {
    const errorMessage = `Please fix ${errors.length} error${errors.length > 1 ? 's' : ''} before submitting.`;
    
    // Create or update error summary
    let errorSummary = form.querySelector('.form-error-summary');
    if (!errorSummary) {
      errorSummary = document.createElement('div');
      errorSummary.className = 'form-error-summary';
      errorSummary.style.cssText = `
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #fca5a5;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 20px;
        font-weight: 500;
      `;
      form.insertBefore(errorSummary, form.firstChild);
    }
    
    errorSummary.textContent = errorMessage;
    
    // Scroll to first error
    errors[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Initialize enhanced features when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize homepage features
  if (typeof window.initializeHomepage === 'function') {
    window.initializeHomepage();
  }
  
  // Initialize enhanced form validation
  if (typeof window.enhancedFormValidation === 'function') {
    window.enhancedFormValidation();
  }

  if (typeof window.renderGeneratedProgramDashboard === 'function') {
    window.renderGeneratedProgramDashboard();
  }
  
  // Close mobile nav when clicking outside
  document.addEventListener('click', function(e) {
    const nav = document.querySelector('.nav');
    const navToggle = document.querySelector('.nav-toggle');
    
    if (nav.classList.contains('active') && 
        !nav.contains(e.target) && 
        !navToggle.contains(e.target)) {
      nav.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
  
  // Close mobile nav when clicking on a link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      const nav = document.querySelector('.nav');
      const navToggle = document.querySelector('.nav-toggle');
      nav.classList.remove('active');
      navToggle?.setAttribute('aria-expanded', 'false');
    });
  });
});

