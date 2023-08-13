/** GENERAL */
const darkMode = localStorage.getItem('darkMode');
const selectedOption = document.querySelector('#pills-tab');
const localesSelect = document.querySelectorAll('[name=locales]');
const allSelects = document.querySelectorAll('select');
const chk = document.querySelector('#chk');
let intervalId;

/** CURRENCIES */
const currencyContent = document.querySelector('#currency-content');
const localeSelectCurrency = document.querySelector('#localescurrency');
const resultCurrency = document.querySelector('#resultcurrency');
const resultCodeCurrency = document.querySelector('#resultcodecurrency');
const currenciesSelect = document.querySelector('#currencies');
const currencyDisplaySelect = document.querySelector('#currencyDisplay');
const copyButtonCurrency = document.querySelector('#copybuttoncurrency');
const currencyValue = document.querySelector('#valuecurrency');

/** DATETIME */
const datetimeContent = document.querySelector('#datetime-content');
const localeSelectDatetime = document.querySelector('#localesdatetime');
const timeZoneSelect = document.querySelector('#timezones');
const timeStyleSelect = document.querySelector('#timestyle');
const dateStyleSelect = document.querySelector('#datestyle');
const resultDateTime = document.querySelector('#resultdatetime');
const resultCodeDatetime = document.querySelector('#resultcodedatetime');
const copyButtonDatetime = document.querySelector('#copybuttondatetime');

/** NUMBERS */
const numberContent = document.querySelector('#number-content');
const localeSelectNumber = document.querySelector('#localesnumber');
const styleSelectNumber = document.querySelector('#styles');
const resultNumber = document.querySelector('#resultnumber');
const resultCodeNumber = document.querySelector('#resultcodenumber');
const unitsSelect = document.querySelector('#units');
const copyButtonNumber = document.querySelector('#copybuttonnumber');
const numberValue = document.querySelector('#valuenumber');

/** ON LOAD SECTOR */
const onLoadPage = async () => {
  const targetsSelect = [
    { element: currencyDisplaySelect, source: 'currencyDisplay' },
    { element: timeStyleSelect, source: 'dateTime' },
    { element: dateStyleSelect, source: 'dateTime' },
    { element: styleSelectNumber, source: 'number' },
  ];
  await checkTheme();
  await getLocales();
  await getTimezones();
  await getCurrencies();
  await getUnits();
  for (let i = 0; i < targetsSelect.length; i++) {
    await getSelectOptions(targetsSelect[i]);
  }
  await getContent();
};

/** GENERAL SECTOR */
const checkTheme = async () => {
  if (darkMode === 'true') {
    document.body.classList.add('dark');
    chk.checked = true;
  } else {
    chk.checked = false;
  }
};

const setTheme = () => {
  if (chk.checked) {
    document.body.classList.add('dark');
    localStorage.setItem('darkMode', 'true');
  } else {
    document.body.classList.remove('dark');
    localStorage.setItem('darkMode', 'false');
  }
};

chk.addEventListener('change', setTheme);

const getContent = async () => {
  let context;

  for (let i = 0; i < selectedOption.children.length; i++) {
    const selected = selectedOption.children[i].children[0].attributes['aria-selected'].value;
    if (selected === 'true') {
      context = selectedOption.children[i].children[0].innerText;
      break;
    }
  }

  clearFields();
  if (context === 'Date/Time') {
    intervalId = setInterval(async () => {
      await showDateTimeResult();
    }, 1000);
    return undefined;
  } else if (context === 'Number') await sanitizeNumberInput();
  else {
    await sanitizeCurrencyInput();
  }
  clearInterval(intervalId);
};

const getSelectOptions = async ({ element, source }) => {
  const dateTimeOptions = ['choose an option...', 'full', 'long', 'medium', 'short'];
  const numberOptions = ['choose an option...', 'decimal', 'percent'];
  const currencyDisplayOptions = ['choose an option...', 'code', 'name', 'symbol'];
  let options = source === 'number' ? numberOptions : source === 'dateTime' ? dateTimeOptions : currencyDisplayOptions;

  for (let i = 0; i < options.length; i++) {
    const formatedOption = options[i].slice(0, 1).toUpperCase() + options[i].slice(1);
    const newOption = document.createElement('option');
    newOption.value = i === 0 ? '' : options[i];
    newOption.innerHTML = formatedOption;
    element.appendChild(newOption);
  }
};

/** CURRENCY SECTOR */
const getCurrencies = async () => {
  const currencies = Intl.supportedValuesOf('currency');
  for (let i = 0; i < currencies.length; i++) {
    const newOption = document.createElement('option');
    newOption.value = currencies[i];
    newOption.innerHTML = currencies[i];
    currenciesSelect.appendChild(newOption);
  }
};

const sanitizeCurrencyInput = async () => {
  currencyValue.value = currencyValue.value.replace(/\D/g, '') || 1000;
  await showCurrencyResult(currencyValue.value);
};

const showCurrencyResult = async (typedValue) => {
  localeSelectCurrency.value = localeSelectCurrency.value.length ? localeSelectCurrency.value : navigator.language;
  currenciesSelect.value = currenciesSelect.value.length ? currenciesSelect.value : 'BRL';
  const choosenLocale = localeSelectCurrency.value;
  const choosenCurrency = currenciesSelect.value;
  const choosenCurrencyDisplay = currencyDisplaySelect.value;
  const currencyFormatOptions = { style: 'currency' };

  choosenCurrency.length ? (currencyFormatOptions['currency'] = choosenCurrency) : undefined;
  choosenCurrencyDisplay.length ? (currencyFormatOptions['currencyDisplay'] = choosenCurrencyDisplay) : undefined;

  const formatedResult = Intl.NumberFormat(`${choosenLocale}`, currencyFormatOptions).format(typedValue);

  resultCurrency.innerHTML = formatedResult;

  await currencyCodeGenerator(choosenLocale, currencyFormatOptions, typedValue);
};

const currencyCodeGenerator = async (locale, currencyFormatOptions, typedValue) => {
  for (const key in currencyFormatOptions) {
    // console.log(key);
    // const element = object[key];
  }
  let { currency, currencyDisplay } = currencyFormatOptions;
  currency = currency?.length ? `, currency: '${currency}'` : '';
  currencyDisplay = currencyDisplay?.length ? `, currencyDisplay: '${currencyDisplay}'` : '';
  resultCodeCurrency.innerHTML = `Intl.NumberFormat('${locale}', { style: 'currency'${currency}${currencyDisplay} }).format(${typedValue})`;
};

const copyToClipboardCurrency = async () => {
  navigator.clipboard.writeText(resultCodeCurrency.value);
  copyButtonCurrency.classList.add('btn-secondary');
  copyButtonCurrency.innerHTML = 'Copied';
  copyButtonCurrency.setAttribute('disabled', 'true');
  setTimeout(() => {
    copyButtonCurrency.classList.remove('btn-secondary');
    copyButtonCurrency.innerHTML = 'Copy';
    copyButtonCurrency.removeAttribute('disabled');
  }, 3000);
};

/** DATETIME SECTOR */
const getTimezones = async () => {
  const timezones = Intl.supportedValuesOf('timeZone');
  for (let i = 0; i < timezones.length; i++) {
    const newOption = document.createElement('option');
    newOption.value = timezones[i];
    newOption.innerHTML = timezones[i];
    timeZoneSelect.appendChild(newOption);
  }
};

const showDateTimeResult = async () => {
  localeSelectDatetime.value = localeSelectDatetime.value.length ? localeSelectDatetime.value : navigator.language;
  const choosenLocale = localeSelectDatetime.value;
  const choosenTimezone = timeZoneSelect.value;
  const choosenTimeStyle = timeStyleSelect.value;
  const choosenDateStyle = dateStyleSelect.value;
  const dateTimeFormatOptions = {};

  dateTimeFormatOptions['timeStyle'] = choosenTimeStyle.length ? choosenTimeStyle : 'long';
  dateTimeFormatOptions['dateStyle'] = choosenDateStyle.length ? choosenDateStyle : 'long';
  choosenTimezone.length ? (dateTimeFormatOptions['timeZone'] = choosenTimezone) : undefined;

  const formatedResult = Intl.DateTimeFormat(`${choosenLocale}`, dateTimeFormatOptions).format(new Date());

  resultDateTime.innerHTML = formatedResult;

  await dateTimeCodeGenerator(choosenLocale, dateTimeFormatOptions);
};

const dateTimeCodeGenerator = async (locale, dateTimeFormatOptions) => {
  let { timeStyle, dateStyle, timeZone } = dateTimeFormatOptions;
  timeStyle = `timeStyle: '${timeStyle}'`;
  dateStyle = `dateStyle: '${dateStyle}'`;
  timeZone = timeZone?.length ? `, timeZone: '${timeZone}'` : '';
  resultCodeDatetime.innerHTML = `Intl.DateTimeFormat('${locale}', { ${timeStyle}, ${dateStyle}${timeZone} }).format(new Date())`;
};

const copyToClipboardDatetime = async () => {
  navigator.clipboard.writeText(resultCodeDatetime.value);
  copyButtonDatetime.classList.add('btn-secondary');
  copyButtonDatetime.innerHTML = 'Copied';
  copyButtonDatetime.setAttribute('disabled', 'true');
  setTimeout(() => {
    copyButtonDatetime.classList.remove('btn-secondary');
    copyButtonDatetime.innerHTML = 'Copy';
    copyButtonDatetime.removeAttribute('disabled');
  }, 3000);
};

/** NUMBER SECTOR */
const getUnits = async () => {
  const units = Intl.supportedValuesOf('unit');
  for (let i = 0; i < units.length; i++) {
    const formatedUnits = units[i].slice(0, 1).toUpperCase() + units[i].slice(1);
    const newOption = document.createElement('option');
    newOption.value = units[i];
    newOption.innerHTML = formatedUnits;
    unitsSelect.appendChild(newOption);
  }
};

const sanitizeNumberInput = async () => {
  numberValue.value = numberValue.value.replace(/\D/g, '') || 1000;
  await showNumberResult(numberValue.value);
};

const showNumberResult = async (typedValue) => {
  localeSelectNumber.value = localeSelectNumber.value.length ? localeSelectNumber.value : navigator.language;
  const choosenLocale = localeSelectNumber.value;
  const choosenStyle = styleSelectNumber.value;
  //   const choosenDateStyle = dateStyleSelect.value;
  const numberFormatOptions = {};

  numberFormatOptions['style'] = choosenStyle.length ? choosenStyle : 'decimal';
  // choosenCurrency.length ? numberFormatOptions['currency'] = choosenCurrency

  //   dateTimeFormatOptions['timeStyle'] = choosenTimeStyle.length ? choosenTimeStyle : 'long';
  //   dateTimeFormatOptions['dateStyle'] = choosenDateStyle.length ? choosenDateStyle : 'long';

  const formatedResult = Intl.NumberFormat(`${choosenLocale}`, numberFormatOptions).format(typedValue);

  resultNumber.innerHTML = formatedResult;

  await numberCodeGenerator(choosenLocale, numberFormatOptions, typedValue);
};

const numberCodeGenerator = async (locale, numberFormatOptions, typedValue) => {
  for (const key in numberFormatOptions) {
    // console.log(key);
    // const element = object[key];
  }
  let { style } = numberFormatOptions;
  style = `style: '${style}'`;
  resultCodeNumber.innerHTML = `Intl.NumberFormat('${locale}', { ${style} }).format(${typedValue})`;
};

const copyToClipboardNumber = async () => {
  navigator.clipboard.writeText(resultCodeNumber.value);
  copyButtonNumber.classList.add('btn-secondary');
  copyButtonNumber.innerHTML = 'Copied';
  copyButtonNumber.setAttribute('disabled', 'true');
  setTimeout(() => {
    copyButtonNumber.classList.remove('btn-secondary');
    copyButtonNumber.innerHTML = 'Copy';
    copyButtonNumber.removeAttribute('disabled');
  }, 3000);
};

/** UTILS SECTOR */
const clearFields = () => {
  resultCodeDatetime.innerHTML = '';
  resultCodeNumber.innerHTML = '';
  resultCodeCurrency.innerHTML = '';
  currencyValue.value = 1000;
  numberValue.value = 1000;
  resultDateTime.innerHTML = 'Result will be shown here...';
  for (let i = 1; i < allSelects.length; i++) {
    allSelects[i].selectedIndex = 0;
  }
};

const getLocales = async () => {
  const locales = [
    'af-ZA',
    'am-ET',
    'ar-AE',
    'ar-BH',
    'ar-DZ',
    'ar-EG',
    'ar-IQ',
    'ar-JO',
    'ar-KW',
    'ar-LB',
    'ar-LY',
    'ar-MA',
    'arn-CL',
    'ar-OM',
    'ar-QA',
    'ar-SA',
    'ar-SD',
    'ar-SY',
    'ar-TN',
    'ar-YE',
    'as-IN',
    'az-az',
    'ba-RU',
    'be-BY',
    'bg-BG',
    'bn-BD',
    'bn-IN',
    'bo-CN',
    'br-FR',
    'ca-ES',
    'co-FR',
    'cs-CZ',
    'cy-GB',
    'da-DK',
    'de-AT',
    'de-CH',
    'de-DE',
    'de-LI',
    'de-LU',
    'dsb-DE',
    'dv-MV',
    'el-CY',
    'el-GR',
    'en-AU',
    'en-BZ',
    'en-CA',
    'en-cb',
    'en-GB',
    'en-IE',
    'en-IN',
    'en-JM',
    'en-MT',
    'en-MY',
    'en-NZ',
    'en-PH',
    'en-SG',
    'en-TT',
    'en-US',
    'en-ZA',
    'en-ZW',
    'es-AR',
    'es-BO',
    'es-CL',
    'es-CO',
    'es-CR',
    'es-DO',
    'es-EC',
    'es-ES',
    'es-GT',
    'es-HN',
    'es-MX',
    'es-NI',
    'es-PA',
    'es-PE',
    'es-PR',
    'es-PY',
    'es-SV',
    'es-US',
    'es-UY',
    'es-VE',
    'et-EE',
    'eu-ES',
    'fa-IR',
    'fi-FI',
    'fil-PH',
    'fo-FO',
    'fr-BE',
    'fr-CA',
    'fr-CH',
    'fr-FR',
    'fr-LU',
    'fr-MC',
    'fy-NL',
    'ga-IE',
    'gd-GB',
    'gd-ie',
    'gl-ES',
    'gsw-FR',
    'gu-IN',
    'he-IL',
    'hi-IN',
    'hr-BA',
    'hr-HR',
    'hsb-DE',
    'hu-HU',
    'hy-AM',
    'id-ID',
    'ig-NG',
    'ii-CN',
    'in-ID',
    'is-IS',
    'it-CH',
    'it-IT',
    'iw-IL',
    'ja-JP',
    'ka-GE',
    'kk-KZ',
    'kl-GL',
    'km-KH',
    'kn-IN',
    'kok-IN',
    'ko-KR',
    'ky-KG',
    'lb-LU',
    'lo-LA',
    'lt-LT',
    'lv-LV',
    'mi-NZ',
    'mk-MK',
    'ml-IN',
    'mn-MN',
    'moh-CA',
    'mr-IN',
    'ms-BN',
    'ms-MY',
    'mt-MT',
    'nb-NO',
    'ne-NP',
    'nl-BE',
    'nl-NL',
    'nn-NO',
    'no-no',
    'nso-ZA',
    'oc-FR',
    'or-IN',
    'pa-IN',
    'pl-PL',
    'prs-AF',
    'ps-AF',
    'pt-BR',
    'pt-PT',
    'qut-GT',
    'quz-BO',
    'quz-EC',
    'quz-PE',
    'rm-CH',
    'ro-mo',
    'ro-RO',
    'ru-mo',
    'ru-RU',
    'rw-RW',
    'sah-RU',
    'sa-IN',
    'se-FI',
    'se-NO',
    'se-SE',
    'si-LK',
    'sk-SK',
    'sl-SI',
    'sma-NO',
    'sma-SE',
    'smj-NO',
    'smj-SE',
    'smn-FI',
    'sms-FI',
    'sq-AL',
    'sr-BA',
    'sr-CS',
    'sr-ME',
    'sr-RS',
    'sr-sp',
    'sv-FI',
    'sv-SE',
    'sw-KE',
    'syr-SY',
    'ta-IN',
    'te-IN',
    'th-TH',
    'tk-TM',
    'tlh-QS',
    'tn-ZA',
    'tr-TR',
    'tt-RU',
    'ug-CN',
    'uk-UA',
    'ur-PK',
    'uz-uz',
    'vi-VN',
    'wo-SN',
    'xh-ZA',
    'yo-NG',
    'zh-CN',
    'zh-HK',
    'zh-MO',
    'zh-SG',
    'zh-TW',
    'zu-ZA',
  ];
  for (let k = 0; k < localesSelect.length; k++) {
    for (let i = 0; i < locales.length; i++) {
      const newOption = document.createElement('option');
      newOption.value = locales[i];
      newOption.innerHTML = locales[i];
      localesSelect[k].appendChild(newOption);
    }
  }
};
