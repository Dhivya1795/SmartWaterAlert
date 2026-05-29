let totalWater = 0;

let goal = 3000;

let reminderInterval;

let missedLogs = [];

let yesterdayWater =
Number(localStorage.getItem("yesterdayWater")) || 0;

function updateClock(){

  const now = new Date();

  const time =
  now.toLocaleTimeString();

  const day =
  now.toLocaleDateString(
    "en-US",
    { weekday:"long" }
  );

  const date =
  now.toLocaleDateString(
    "en-US",
    {
      day:"numeric",
      month:"long",
      year:"numeric"
    }
  );

  document.getElementById(
    "clock"
  ).innerHTML = `

    <div class="live-time">
      ${time}
    </div>

    <div class="live-day">
      ${day}
    </div>

    <div class="live-date">
      ${date}
    </div>

  `;
}

setInterval(updateClock,1000);

updateClock();

/* LOAD REMINDER OPTIONS */

function loadReminderOptions(){

  const unit =
  document.getElementById(
    "reminderUnit"
  ).value;

  const reminderValue =
  document.getElementById(
    "reminderValue"
  );

  reminderValue.innerHTML = "";

  let limit =
  unit === "minutes"
  ? 60
  : 12;

  for(let i=1;i<=limit;i++){

    reminderValue.innerHTML += `
      <option value="${i}">
        ${i}
      </option>
    `;
  }
}

loadReminderOptions();

/* CHANGE GOAL */

function changeGoal(){

  let value =
  Number(
    document.getElementById(
      "goalInput"
    ).value
  );

  if(value <= 0){

    alert(
      "Please enter valid goal 💧"
    );

    return;
  }

  const unit =
  document.getElementById(
    "goalUnit"
  ).value;

  if(unit === "liters"){

    value *= 1000;
  }

  goal = value;

  updateUI();
}

/* ADD WATER */

function addCustomWater(){

  let amount =
  Number(
    document.getElementById(
      "waterInput"
    ).value
  );

  if(amount <= 0){

    alert(
      "Please enter valid water amount 💧"
    );

    return;
  }

  const unit =
  document.getElementById(
    "waterUnit"
  ).value;

  if(unit === "liters"){

    amount *= 1000;
  }

  totalWater += amount;

  updateUI();

  autoRemoveLogs();
}

/* RESET */

function resetWater(){

  localStorage.setItem(
    "yesterdayWater",
    totalWater
  );

  yesterdayWater = totalWater;

  totalWater = 0;

  updateUI();
}

/* UPDATE UI */

function updateUI(){

  const percent =
  Math.min(
    Math.round(
      (totalWater / goal) * 100
    ),
    100
  );

  document.getElementById(
    "percent"
  ).innerText =
  `${percent}%`;

  document.getElementById(
    "waterText"
  ).innerText =
  `${totalWater} ml / ${goal} ml`;

  document.getElementById(
    "progressCircle"
  ).style.background = `

    conic-gradient(
      #38bdf8 ${percent * 3.6}deg,
      rgba(255,255,255,0.15) 0deg
    )

  `;

  updateMessage(percent);

  updateAnalytics(percent);

  updateYesterdayProgress();
}

/* SMART MESSAGE */

function updateMessage(percent){

  let msg = "";

  if(percent >= 100){

    msg =
    "Amazing 🔥 You completed today's hydration goal 💧";
  }

  else if(percent >= 70){

    msg =
    "Great consistency 😎 Keep going!";
  }

  else if(percent >= 40){

    msg =
    "Nice progress 💙 Drink some more water!";
  }

  else{

    msg =
    "Your body needs water 💧 Stay hydrated!";
  }

  document.getElementById(
    "statusText"
  ).innerText = msg;
}

/* ANALYTICS */

function updateAnalytics(percent){

  document.getElementById(
    "analyticsContainer"
  ).innerHTML = `

    <div class="analytics-card">

      <div class="analytics-percent">
        ${percent}%
      </div>

      <div class="analytics-message">

        ${
          percent >= 80
          ? "Excellent hydration today 💧"
          : "You can improve your hydration 🚀"
        }

      </div>

    </div>

  `;
}

/* YESTERDAY */

function updateYesterdayProgress(){

  const yesterdayPercent =
  Math.min(
    Math.round(
      (yesterdayWater / goal) * 100
    ),
    100
  );

  document.getElementById(
    "yesterdayContainer"
  ).innerHTML = `

    <div class="yesterday-card">

      <div class="yesterday-title">

        Yesterday's Hydration

      </div>

      <div class="yesterday-percent">

        ${yesterdayPercent}%

      </div>

      <div class="yesterday-text">

        ${
          yesterdayPercent >= 80
          ? "Excellent hydration 💧"
          : "Low water intake 🫠"
        }

      </div>

    </div>

  `;

  /* COMPARISON */

  const todayPercent =
  Math.min(
    Math.round(
      (totalWater / goal) * 100
    ),
    100
  );

  let comparisonText = "";

  if(todayPercent > yesterdayPercent){

    comparisonText = `

      📈 ${
        todayPercent - yesterdayPercent
      }% Better than Yesterday

    `;
  }

  else if(todayPercent < yesterdayPercent){

    comparisonText = `

      📉 ${
        yesterdayPercent - todayPercent
      }% Lower than Yesterday

    `;
  }

  else{

    comparisonText = `

      ⚖️ Same as Yesterday

    `;
  }

  document.getElementById(
    "yesterdayContainer"
  ).innerHTML += `

    <div class="yesterday-card"
         style="margin-top:18px;">

      <div class="yesterday-title">

        ${comparisonText}

      </div>

    </div>

  `;
}

/* REMINDER */

function startReminder(){

  clearInterval(reminderInterval);

  const value =
  Number(
    document.getElementById(
      "reminderValue"
    ).value
  );

  const unit =
  document.getElementById(
    "reminderUnit"
  ).value;

  let milliseconds =
  unit === "minutes"
  ? value * 60000
  : value * 60 * 60000;

  Notification.requestPermission();

  reminderInterval = setInterval(()=>{

    new Notification(
      "💧 Drink Water Reminder"
    );

    addMissedLog();

  },milliseconds);
}

/* MISSED LOG */

function addMissedLog(){

  const now = new Date();

  const day =
  now.toLocaleDateString(
    "en-US",
    { weekday:"long" }
  );

  const time =
  now.toLocaleTimeString();

  const date =
  now.toLocaleDateString();

  missedLogs.push({

    text:
    `⚠️ ${day}
${date}
${time}

Reminder Pending`,

    timestamp:
    Date.now()
  });

  renderLogs();
}

/* AUTO REMOVE LOGS */

function autoRemoveLogs(){

  const now = Date.now();

  missedLogs = missedLogs.filter(log=>{

    return now - log.timestamp > 180000;
  });

  renderLogs();
}

/* RENDER LOGS */

function renderLogs(){

  const logsDiv =
  document.getElementById(
    "logs"
  );

  if(missedLogs.length === 0){

    logsDiv.innerHTML =
    "No missed reminders ✅";

    return;
  }

  logsDiv.innerHTML = "";

  missedLogs.forEach((log,index)=>{

    logsDiv.innerHTML += `

      <div class="log-item">

        <div class="log-content">

          <input
          type="checkbox"
          onchange="removeLog(${index})"
          >

          <p>${log.text}</p>

        </div>

      </div>

    `;
  });
}

/* REMOVE LOG */

function removeLog(index){

  missedLogs.splice(index,1);

  renderLogs();
}

updateUI();