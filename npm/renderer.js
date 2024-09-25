const { ipcRenderer } = require('electron');

function loadSettings() {
  ipcRenderer.send('load-settings');
}

function readCSSVariables() {
  return {
    'shadow-color': document.getElementById('shadow-color').value,
    'text-color': document.getElementById('text-color').value,
    'accent-color-1': document.getElementById('accent-color-1').value,
    'accent-color-2': document.getElementById('accent-color-2').value,
    'border-size': document.getElementById('border-size').value + 'px'
  };
}

function saveSettings() {
  const settings = {
    happy_hour: document.getElementById('happy_hour').checked,
    random_hour: document.getElementById('random_hour').checked,
    randHappy: document.getElementById('randHappy').checked,
    scheduleHappy: document.getElementById('scheduleHappy').checked,
    scheduleHappyDay: parseInt(document.getElementById('scheduleHappyDay').value),
    scheduleHappyHour: parseInt(document.getElementById('scheduleHappyHour').value),
    bulk_enabled: document.getElementById('bulk_enabled').checked,
    pauseShort: document.getElementById('pauseShort').value,
    happyHourShort: document.getElementById('happyHourShort').value,
    randomHourShort: document.getElementById('randomHourShort').value,
    addHourShort: document.getElementById('addHourShort').value,
    addMinuteShort: document.getElementById('addMinuteShort').value,
    addSecondShort: document.getElementById('addSecondShort').value,
    subHourShort: document.getElementById('subHourShort').value,
    subMinuteShort: document.getElementById('subMinuteShort').value,
    subSecondShort: document.getElementById('subSecondShort').value,
    twitch_channel_name: document.getElementById('twitch_channel_name').value,
    streamlabs_token: document.getElementById('streamlabs_token').value,
    streamelements_token: document.getElementById('streamelements_token').value,
    streamloots_token: document.getElementById('streamloots_token').value,
    allowTimeAddWhilePaused: document.getElementById('allowTimeAddWhilePaused').checked,
    initialHoursConfig: parseInt(document.getElementById('initialHoursConfig').value),
    initialMinutesConfig: parseInt(document.getElementById('initialMinutesConfig').value),
    initialSecondsConfig: parseInt(document.getElementById('initialSecondsConfig').value),
    maxHoursConfig: document.getElementById('maxHoursConfig').value ? parseInt(document.getElementById('maxHoursConfig').value) : null,
    maxMinutesConfig: document.getElementById('maxMinutesConfig').value ? parseInt(document.getElementById('maxMinutesConfig').value) : null,
    maxSecondsConfig: document.getElementById('maxSecondsConfig').value ? parseInt(document.getElementById('maxSecondsConfig').value) : null,
    syncTime: parseInt(document.getElementById('syncTime').value),
    subEnable: document.getElementById('subEnable').checked,
    bitEnable: document.getElementById('bitEnable').checked,
    donationEnable: document.getElementById('donationEnable').checked,
    chestEnable: document.getElementById('chestEnable').checked,
    seconds_added_per_sub_prime: parseInt(document.getElementById('seconds_added_per_sub_prime').value),
    seconds_added_per_sub_tier1: parseInt(document.getElementById('seconds_added_per_sub_tier1').value),
    seconds_added_per_sub_tier2: parseInt(document.getElementById('seconds_added_per_sub_tier2').value),
    seconds_added_per_sub_tier3: parseInt(document.getElementById('seconds_added_per_sub_tier3').value),
    seconds_added_per_resub_prime: parseInt(document.getElementById('seconds_added_per_resub_prime').value),
    seconds_added_per_resub_tier1: parseInt(document.getElementById('seconds_added_per_resub_tier1').value),
    seconds_added_per_resub_tier2: parseInt(document.getElementById('seconds_added_per_resub_tier2').value),
    seconds_added_per_resub_tier3: parseInt(document.getElementById('seconds_added_per_resub_tier3').value),
    seconds_added_per_giftsub_tier1: parseInt(document.getElementById('seconds_added_per_giftsub_tier1').value),
    seconds_added_per_giftsub_tier2: parseInt(document.getElementById('seconds_added_per_giftsub_tier2').value),
    seconds_added_per_giftsub_tier3: parseInt(document.getElementById('seconds_added_per_giftsub_tier3').value),
    min_amount_of_bits: parseInt(document.getElementById('min_amount_of_bits').value),
    seconds_added_per_bits: parseInt(document.getElementById('seconds_added_per_bits').value),
    min_donation_amount: parseFloat(document.getElementById('min_donation_amount').value),
    seconds_added_per_donation: parseInt(document.getElementById('seconds_added_per_donation').value),
    min_amount_of_chests: parseInt(document.getElementById('min_amount_of_chests').value),
    seconds_added_per_chests: parseInt(document.getElementById('seconds_added_per_chests').value),
    factor_t1: parseFloat(document.getElementById('factor_t1').value),
    factor_t2: parseFloat(document.getElementById('factor_t2').value),
    factor_t3: parseFloat(document.getElementById('factor_t3').value),
    factor_bits: parseFloat(document.getElementById('factor_bits').value),
    factor_donations: parseFloat(document.getElementById('factor_donations').value),
    range_t1: document.getElementById('range_t1').value.split(',').map(Number),
    range_t2: document.getElementById('range_t2').value.split(',').map(Number),
    range_t3: document.getElementById('range_t3').value.split(',').map(Number),
    range_bits: document.getElementById('range_bits').value.split(',').map(Number),
    range_donations: document.getElementById('range_donations').value.split(',').map(Number),
  };

  settings.cssVariables = readCSSVariables();

  ipcRenderer.send('save-settings', settings);
}

ipcRenderer.on('load-settings-response', (event, response) => {
  if (response.success) {
    const settings = response.settings;
    for (const [key, value] of Object.entries(settings)) {
      const element = document.getElementById(key);
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = value;
        } else if (element.tagName === 'SELECT') {
          element.value = value;
        } else if (Array.isArray(value)) {
          element.value = value.join(',');
        } else if (value === null) {
          element.value = '';
        } else {
          element.value = value;
        }
      }
    }
    if (settings.cssVariables) {
      document.getElementById('shadow-color').value = settings.cssVariables['shadow-color'];
      document.getElementById('text-color').value = settings.cssVariables['text-color'];
      document.getElementById('accent-color-1').value = settings.cssVariables['accent-color-1'];
      document.getElementById('accent-color-2').value = settings.cssVariables['accent-color-2'];
      document.getElementById('border-size').value = parseInt(settings.cssVariables['border-size']);
    }
  } else {
    console.error('Failed to load settings:', response.message);
  }
});

function showModal(message) {
  const modal = document.getElementById('modal');
  const modalMessage = document.getElementById('modal-message');
  modalMessage.textContent = message;
  modal.style.display = 'block';
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
}

ipcRenderer.on('save-settings-response', (event, response) => {
  if (response.success) {
    showModal('Settings saved successfully!');
  } else {
    showModal('Failed to save settings: ' + response.message);
  }
});

window.onload = loadSettings;
