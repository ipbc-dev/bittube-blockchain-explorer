const PAGE_SIZE = 30;
const ELEM_OVERVIEW_CONTAINER = 'overviewContainer';
const ELEM_CHANNEL_CONTAINER = 'channelContainer';
const ELEM_VIDEO_CONTAINER = 'videoContainer';
const ELEM_VIEWER_CONTAINER = 'viewerContainer';
const ELEM_SPINNER = 'loading-spinner';
const ELEM_NODATA = 'noDataContainer';
const ELEM_PAYMENTS_CONTAINER = 'paymentsContainer';

let currentPageCreators = 0;
let currentPageViewers = 0;
let currentPageChannel = 0;
let currentPageVideo = 0;
let currentPageViewer = 0;
let currentPagePayments = 0;

let viewer_id;
let channel_id;
const getStatsURL = 'https://airtime.bit.tube/getStats';
// const getStatsURL = 'https://airtime-testing.bit.tube/getStats';
// const getStatsURL = 'http://localhost:12346/getStats';

let dateSeparator = '-'; // Sane Default

// if (navigator.vendor == 'Apple Computer, Inc.') {
//   dateSeparator = '/'; // IOS needs to be special, of course.
// }

// =====================================
// ======= DATE BEGIN ==================
// =====================================

function dateToYYYYMMDD(date) {
  if (!date) return false;
  var y = date.getFullYear().toString();
  var m = (date.getMonth() + 1).toString();
  var d = date.getDate().toString();
  (d.length == 1) && (d = '0' + d);
  (m.length == 1) && (m = '0' + m);
  var yyyymmdd = y + dateSeparator + m + dateSeparator + d;
  return yyyymmdd;
}

function dateToHHMM(date) {
  if (!date) return false;
  let currentHour = date.getHours().toString();
  let currentMinutes = date.getMinutes().toString();
  (currentHour.length == 1) && (currentHour = '0' + currentHour);
  (currentMinutes.length == 1) && (currentMinutes = '0' + currentMinutes);
  // console.log('dateToHHMM', date, currentHour, currentMinutes);
  return currentHour + ':' + currentMinutes;
}

function getCurrentDate() {
  return dateToYYYYMMDD(new Date());
}

function getCurrentDateMinusADay() {
  const date = new Date();
  date.setHours(date.getHours() - 26);
  return dateToYYYYMMDD(date);
}

function getCurrentTime() {
  return dateToHHMM(new Date());
}

function isYYYYMMDDValid(yyyymmdd) {
  if (!yyyymmdd) return false;
  const testDate = new Date(yyyymmdd);
  return isDateValid(testDate);
}

function isHHMMValid(hhmm) {
  if (!hhmm) return false;
  const testDate = new Date(getCurrentDate() + ' ' + hhmm);
  return isDateValid(testDate);
}

function isDateValid(date) {
  if (!date) return false;
  return date.toString() !== 'Invalid Date';
}

function assembleDateFromStringsLossy(yyyymmdd, hhmm) {
  const date = (isYYYYMMDDValid(yyyymmdd) ? yyyymmdd : getCurrentDate());
  const time = (isHHMMValid(hhmm) ? hhmm : getCurrentTime());
  return new Date(date + ' ' + time);
}

function setCurrentDateFilters() {
  const storedFilterFrom = localStorage.getItem('filterFrom');
  const storedFilterFromDate = new Date(storedFilterFrom);
  if (storedFilterFrom && isDateValid(storedFilterFromDate)) {
    document.getElementById('datefrom').value = dateToYYYYMMDD(storedFilterFromDate);
    document.getElementById('dateHourFrom').value = dateToHHMM(storedFilterFromDate);
    // console.log('setCurrentDateFilters storedFilterFrom VALID:', storedFilterFrom, storedFilterFromDate);
  } else {
    document.getElementById('datefrom').value = getCurrentDateMinusADay();
    document.getElementById('dateHourFrom').value = getCurrentTime();
    // console.log('setCurrentDateFilters storedFilterFrom INVALID:', storedFilterFrom, storedFilterFromDate);
  }

  const storedFilterTo = localStorage.getItem('filterTo');
  const storedFilterToDate = new Date(storedFilterTo);
  if (storedFilterTo && isDateValid(storedFilterToDate)) {
    document.getElementById('dateTo').value = dateToYYYYMMDD(storedFilterToDate);
    document.getElementById('dateHourTo').value = dateToHHMM(storedFilterToDate);
    // console.log('setCurrentDateFilters storedFilterTo VALID:', storedFilterTo, storedFilterToDate);
  } else {
    document.getElementById('dateTo').value = getCurrentDate();
    document.getElementById('dateHourTo').value = getCurrentTime();
    // console.log('setCurrentDateFilters storedFilterTo INVALID:', storedFilterTo, storedFilterToDate);
  }
}

function resetDateFiltersStorage() {
  localStorage.setItem('filterFrom', null);
  localStorage.setItem('filterTo', null);
}

function getFilterFromDate() {
  const dateFromStr = document.getElementById('datefrom').value;
  const hourFromStr = document.getElementById('dateHourFrom').value;
  return assembleDateFromStringsLossy(dateFromStr, hourFromStr);
}

function getFilterToDate() {
  const dateToStr = document.getElementById('dateTo').value;
  const hourToStr = document.getElementById('dateHourTo').value;
  return assembleDateFromStringsLossy(dateToStr, hourToStr);
}

function getStoredToDate() {
  const storedFilterTo = localStorage.getItem('filterTo');
  const storedFilterToDate = new Date(storedFilterTo);
  if (storedFilterTo && isDateValid(storedFilterToDate)) {
    return storedFilterToDate;
  } else {
    return new Date();
  }
}

function getStoredFromDate() {
  const storedFilterFrom = localStorage.getItem('filterFrom');
  const storedFilterFromDate = new Date(storedFilterFrom);
  if (storedFilterFrom && isDateValid(storedFilterFromDate)) {
    return storedFilterFromDate;
  } else {
    const date = new Date();
    date.setHours(date.getHours() - 26);
    return date;
  }
}

function filterByDate() {
  const filterFrom = getFilterFromDate();
  localStorage.setItem('filterFrom', filterFrom);

  const filterTo = getFilterToDate();
  localStorage.setItem('filterTo', filterTo);

  const dataCall = document.getElementById('dateFilter').getAttribute('data-call');
  // console.log('filterByDate Call:', dataCall, filterFrom, filterTo, filterTo - filterFrom);

  switch (dataCall) {
    case 'all':
      fetchDataCreators('', 'creators', PAGE_SIZE, 0, filterFrom, filterTo);
      fetchDataViewers('', 'viewers', PAGE_SIZE, 0, filterFrom, filterTo);
      fetchOverviewPayments(PAGE_SIZE, 0, filterFrom, filterTo);
      break;
    case 'channel':
      checkUrlParams()
      break;
    case 'video':
      checkUrlParams()
      break;
    case 'viewer':
      checkUrlParams()
      break;
    default:
  }
}

function resetDateFiltersUser() {
  resetDateFiltersStorage();
  setCurrentDateFilters();
  filterByDate();
}

function resetDateFiltersUserHour() {
  resetDateFiltersStorage();
  const end = new Date();
  // end.setHours(end.getHours() - 1);
  const start = new Date(end);
  start.setHours(start.getHours() - 2);
  localStorage.setItem('filterFrom', start);
  localStorage.setItem('filterTo', end);
  setCurrentDateFilters();
  filterByDate();
}

function resetDateFiltersUserAllOfTime() {
  resetDateFiltersStorage();
  localStorage.setItem('filterFrom', (new Date(1)));
  localStorage.setItem('filterTo', (new Date(4102444800000)));
  setCurrentDateFilters();
  filterByDate();
}

function getUniversalDateDiffStr(date) {
  const now = new Date();
  const then = new Date(date);
  const timeagoMS = (now - then);
  const offsetMin = now.getTimezoneOffset();
  const seconds = (timeagoMS / 1000) + (offsetMin * 60);
  return secondsToStr(seconds);
}

function localizeUTCString(date) {
  const newDate = new Date(date);
  // console.log(date, newDate, newDate.getTimezoneOffset());
  newDate.setMinutes(newDate.getMinutes() + newDate.getTimezoneOffset());
  return newDate;
}

// =====================================
// ======= DATES END ===================
// =====================================

// =====================================
// ======= TABLE BUILDING BEGIN ========
// =====================================

function buildPagination(elemName, totalRows, currentPage, funcName, funcArgExtra) {
  const maxPages = Math.floor(totalRows / PAGE_SIZE);
  const elem_pages = document.getElementById(elemName);
  elem_pages.innerHTML = '';

  if (currentPage > 0) {
    elem_pages.innerHTML += '<span class="clickAbleSpan" onClick="' + funcName + '(-1, \'' + funcArgExtra + '\');"> prev page </span>';
  } else {
    elem_pages.innerHTML += '<span> prev page </span>';
  }

  elem_pages.innerHTML += '| current page ' + currentPage + '/' + maxPages + ' | ';

  if (maxPages > 0 && currentPage < maxPages) {
    elem_pages.innerHTML += '<span class="clickAbleSpan" onClick="' + funcName + '(1, \'' + funcArgExtra + '\');"> next page </span>';
  }else {
    elem_pages.innerHTML += '<span> next page </span>';
  }
}

async function tableCreatorsTurnPage(offset) {
  const dateStart = getStoredFromDate();
  const dateEnd = getStoredToDate();
  currentPageCreators += offset;
  setVisibleElemName(ELEM_SPINNER, true);
  await fetchDataCreators('', 'creators', PAGE_SIZE, currentPageCreators, dateStart, dateEnd);
  setVisibleElemName(ELEM_SPINNER, false);
}

function buildTableCreators(data) {
  const total_row_count = parseInt(data[0].total_row_count);
  buildPagination('pagesCreators', total_row_count, currentPageCreators, 'tableCreatorsTurnPage');

  const tableHeader = '<tr>' +
    '<td>Username</td>' +
    '<td style="width: 30%;">Wallet</td>' +
    '<td>Total videos</td>' +
    '<td>Total AirTime</td>' +
    '<td>Earned Tubes</td>' +
    '</tr>';
  let tableBody = '';

  data.forEach(function (element) {
    tableBody += '<tr>' +
      '<td><a href="airtime.html?channel=' + element.channel_id + '">' + element.channel_name + '</a></td>' +
      '<td> <a href="airtime.html?wallet=' + element.wallet + '">' + element.wallet + '</a></td>' +
      '<td> <a href="airtime.html?channel=' + element.channel_id + '">' + element.videos + '</a></td>' +
      '<td>' + secondsToStr(element.airtime) + '</td>' +
      '<td>' + element.sum_creator_reward / 1e8 + '</td>' +
      '</tr>';
  });

  document.getElementById("airtimeTableCreators").innerHTML = tableHeader + tableBody;
}

async function tableViewersTurnPage(offset) {
  const dateStart = getStoredFromDate();
  const dateEnd = getStoredToDate();
  currentPageViewers += offset;
  setVisibleElemName(ELEM_SPINNER, true);
  await fetchDataViewers('', 'viewers', PAGE_SIZE, currentPageViewers, dateStart, dateEnd);
  setVisibleElemName(ELEM_SPINNER, false);
}

function buildTableViewers(data, searchType) {
  const total_row_count = parseInt(data[0].total_row_count);
  buildPagination('pagesViewers', total_row_count, currentPageViewers, 'tableViewersTurnPage');
  const tableHeader = '<tr>' +
    '<td>Username</td>' +
    '<td style="width: 40%;">Wallet</td>' +
    '<td>Total videos</td>' +
    '<td>Total AirTime</td>' +
    '<td>Earned Tubes</td>' +
    '<td>AirTime ID</td>' +
    '</tr>';

  let tableBody = '';
  data.forEach(function (element) {
    tableBody += '<tr>';

    // if (searchType == 'viewers' || searchType == 'searchUserName') {
      tableBody += '<td><a href="airtime.html?viewer_id=' + element.viewer_id + '">' + element.user_name + '</a></td>';
    // } else if (searchType == 'searchWallet') {
      // tableBody += '<td><a href="airtime.html?channel=' + element.channel_id + '">' + element.channel_name + '</a></td>';
    // }

    tableBody += '<td><a href="airtime.html?wallet=' + element.wallet + '">' + element.wallet + '</a></td>' +
      '<td> <a href="#">' + element.videos + '</a></td>' +
      '<td>' + secondsToStr(element.airtime) + '</td>' +
      '<td>' + element.sum_viewer_reward / 1e8 + '</td>' +
      '<td><a href="airtime.html?viewer_id=' + element.viewer_id + '">AT' + element.viewer_id + '</a></td>' +
      '</tr>';
  });

  document.getElementById("airtimeTableViewers").innerHTML = tableHeader + tableBody;
}

function buildHeaderChannel(data) {
  document.getElementById('channelName').innerHTML = 'Channel: ' + data.channel_name;
  document.getElementById('channelTotalVideos').innerHTML = 'Total Videos: ' + data.videos;
  document.getElementById('channelWallet').innerHTML = 'Wallet: ' + data.wallet;

  if (!data.blacklisted) {
    document.getElementById('channelTotalAirTime').innerHTML = 'Total AirTime: ' + secondsToStr(data.airtime);
    document.getElementById('channelTotalViewerReward').innerHTML = 'Viewers Earned Total: ' + data.sum_viewer_reward / 1e8;
    document.getElementById('channelTotalCreatorReward').innerHTML = 'Creator Earned Total: ' + data.sum_creator_reward / 1e8;
    document.getElementById('channelPaidBalance').innerHTML = 'Alltime Total Current Paid Balance: ' + data.paid_balance / 1e8;
    document.getElementById('channelUnpaidBalance').innerHTML = 'Alltime Total Current Unpaid Balance: ' + data.unpaid_balance / 1e8;
    // document.getElementById('channelLastPaidAt').innerHTML = 'Last Paid At: ' + data.last_paid_at + ' (' + getUniversalDateDiffStr(data.last_paid_at) + ")";
  } else {
    document.getElementById('channelTotalAirTime').innerHTML = '';
    document.getElementById('channelTotalViewerReward').innerHTML = '';
    document.getElementById('channelTotalCreatorReward').innerHTML = '';
    document.getElementById('channelPaidBalance').innerHTML = 'No rewards will be paid out.';
    document.getElementById('channelUnpaidBalance').innerHTML = '<h1>THIS CHANNEL IS BLACKLISTED</h1>';
  }
  

  channel_id = data.channel_id;
}

async function tableChannelTurnPage(offset, channelID) {
  const dateStart = getStoredFromDate();
  const dateEnd = getStoredToDate();
  currentPageChannel += offset;
  setVisibleElemName(ELEM_SPINNER, true);
  await fetchDataChannel(channelID, 'creatorVideos', PAGE_SIZE, currentPageChannel, dateStart, dateEnd);
  setVisibleElemName(ELEM_SPINNER, false);
}

function buildTableChannel(data) {
  const total_row_count = parseInt(data[0].total_row_count);
  buildPagination('pagesChannel', total_row_count, currentPageChannel, 'tableChannelTurnPage', channel_id);

  const tableHeader = '<tr>' +
    '<td style="width: 30%;">Hash</td>' +
    '<td>AirTime</td>' +
    '<td>Viewers</td>' +
    '<td>Earned Tubes</td>' +
    '</tr>';

  let tableBody = '';
  data.forEach(function (element) {
    tableBody += (element.blacklisted ? '<tr style="background: darkred; color: white">' : '<tr>') +
      '<td><a href="airtime.html?video=' + element.video_hash + '">' + element.video_hash + '</a></td>' +
      '<td>' + secondsToStr(element.airtime) + '</td>' +
      '<td>' + element.viewers + '</td>' +
      '<td>' + element.sum_creator_reward / 1e8 + '</td>' +
      '</tr>';
  });

  document.getElementById("airtimeTableChannel").innerHTML = tableHeader + tableBody;
}

function buildHeaderVideo(data) {
  document.getElementById('videoHash').innerHTML = 'Video Hash: ' + data.video_hash;
  document.getElementById('channelName').innerHTML = 'Channel Name: ' + data.channel_name;
  document.getElementById('videoWallet').innerHTML = 'Wallet: ' + data.wallet;
  if (!data.blacklisted) {
    document.getElementById('totalVideoAirtime').innerHTML = 'Total AirTime: ' + secondsToStr(data.airtime);
    document.getElementById('totalVideoViewers').innerHTML = 'Total Viewers: ' + data.viewers;
    document.getElementById('totalVideoCreatorReward').innerHTML = 'Creator Earned Total: ' + data.sum_creator_reward / 1e8;
    document.getElementById('totalVideoViewerReward').innerHTML = 'Viewers Earned Total: ' + data.sum_viewer_reward / 1e8;
  } else {
    document.getElementById('totalVideoAirtime').innerHTML = '<h1>THIS VIDEO IS BLACKLISTED</h1>';
    document.getElementById('totalVideoViewers').innerHTML = 'No rewards will be paid out.';
    document.getElementById('totalVideoCreatorReward').innerHTML = '';
    document.getElementById('totalVideoViewerReward').innerHTML = '';
  }
}

async function tableVideoTurnPage(offset, videoID) {
  const dateStart = getStoredFromDate();
  const dateEnd = getStoredToDate();
  currentPageVideo += offset;
  setVisibleElemName(ELEM_SPINNER, true);
  await fetchDataVideo(videoID, 'videoViewers', PAGE_SIZE, currentPageVideo, dateStart, dateEnd);
  setVisibleElemName(ELEM_SPINNER, false);
}

function buildTableVideo(data, hash) {
  const total_row_count = parseInt(data[0].total_row_count);
  buildPagination('pagesVideo', total_row_count, currentPageVideo, 'tableVideoTurnPage', hash);

  const tableHeader = '<tr>' +
    '<td>Username</td>' +
    '<td style="width: 40%;">Wallet</td>' +
    '<td>AirTime</td>' +
    '<td>Creator Earned Tubes</td>' +
    '<td>AirTime ID</td>' +
    '</tr>';

  let tableBody = '';
  data.forEach(function (element) {
    tableBody += '<tr>' +
      '<td><a href="airtime.html?viewer_id=' + element.viewer_id + '">' + element.user_name + '</a></td>' + 
      '<td><a href="airtime.html?wallet=' + element.user_name + '">' + element.wallet + '</td>' + 
      '<td>' + secondsToStr(element.airtime) + '</td>' +
      '<td>' + element.sum_creator_reward / 1e8 + '</td>' +
      '<td><a href="airtime.html?viewer_id=' + element.viewer_id + '">AT' + element.viewer_id + '</td>' +
    '</tr>';
  });

  document.getElementById("airtimeTableVideo").innerHTML = tableHeader + tableBody;
}

function buildHeaderViewer(data) {
  document.getElementById('viewerName').innerHTML = 'Username: ' + data.viewer_name;
  document.getElementById('viewerID').innerHTML = 'Airtime ID: AT' + data.viewer_id;
  document.getElementById('viewerWallet').innerHTML = 'Wallet: ' + data.wallet;

  if (!data.blacklisted) {
    document.getElementById('totalVideosWatched').innerHTML = 'Total videos watched: ' + data.videos;
    document.getElementById('totalAirtime').innerHTML = 'Total AirTime: ' + secondsToStr(data.airtime);
    document.getElementById('totalViewerReward').innerHTML = 'Viewer Earned: ' + data.sum_viewer_reward / 1e8;
    document.getElementById('totalCreatorReward').innerHTML = 'Creators Earned: ' + data.sum_creator_reward / 1e8;
    document.getElementById('viewerPaidBalance').innerHTML = 'Alltime Total Current Paid Balance: ' + data.paid_balance / 1e8;
    document.getElementById('viewerUnpaidBalance').innerHTML = 'Alltime Total Current Unpaid Balance: ' + data.unpaid_balance / 1e8;
    // document.getElementById('viewerLastPaidAt').innerHTML = 'Last Paid At: ' + data.last_paid_at + ' (' + getUniversalDateDiffStr(data.last_paid_at) + ")";
  } else {
    document.getElementById('totalVideosWatched').innerHTML = '';
    document.getElementById('totalAirtime').innerHTML = '';
    document.getElementById('totalViewerReward').innerHTML = '';
    document.getElementById('totalCreatorReward').innerHTML = '';
    document.getElementById('viewerPaidBalance').innerHTML = 'No rewards will be paid out.';
    document.getElementById('viewerUnpaidBalance').innerHTML = '<h1>THIS VIEWER IS BLACKLISTED</h1>';
  }
  viewer_id = data.viewer_id;
}

async function tableViewerTurnPage(offset, viewerID) {
  const dateStart = getStoredFromDate();
  const dateEnd = getStoredToDate();
  currentPageViewer += offset;
  setVisibleElemName(ELEM_SPINNER, true);
  await fetchDataViewer(viewerID, 'viewerWatched', PAGE_SIZE, currentPageViewer, dateStart, dateEnd);
  setVisibleElemName(ELEM_SPINNER, false);
}

function buildTableViewer(data) {
  const total_row_count = parseInt(data[0].total_row_count);
  buildPagination('pagesViewer', total_row_count, currentPageViewer, 'tableViewerTurnPage', viewer_id);

  const tableHeader = '<tr>' +
    '<td style="width: 30%;">Hash</td>' +
    '<td>AirTime</td>' +
    '<td>Viewer Earned Tubes</td>' +
    '</tr>';

  let tableBody = '';
  data.forEach(function (element) {
    tableBody += (element.blacklisted ? '<tr style="background: darkred; color: white">' : '<tr>') +
      '<td><a href="airtime.html?video=' + element.video_hash + '">' + element.video_hash + '</a></td>' +
      '<td>' + secondsToStr(element.airtime) + '</td>' +
      '<td>' + element.sum_viewer_reward / 1e8 + '</td>' +
      '</tr>';
  });

  document.getElementById("airtimeTableViewer").innerHTML = tableHeader + tableBody;
}

async function tablePaymentsTurnPage(offset) {
  const dateStart = getStoredFromDate();
  const dateEnd = getStoredToDate();
  currentPagePayments += offset;
  setVisibleElemName(ELEM_SPINNER, true);
  await fetchOverviewPayments(PAGE_SIZE, currentPagePayments, dateStart, dateEnd);
  setVisibleElemName(ELEM_SPINNER, false);
}

function buildTablePayments(data) {
  const total_row_count = parseInt(data[0].total_row_count);
  buildPagination('pagesPayments', total_row_count, currentPagePayments, 'tablePaymentsTurnPage');

  const tableHeader = '<tr>' +
    '<td>Time Since Payment</td>' +
    '<td>Wallet</td>' +
    '<td>UserName</td>' +
    '<td>TXID</td>' +
    '<td>Amount</td>' +
    '</tr>';

  let tableBody = '';
  data.forEach(function (element) {
    tableBody += '<tr>' +
      '<td class="tooltip"><span class="tooltiptext">' + element.time + '</span>' + getUniversalDateDiffStr(element.time) + '</td>' +
      '<td><a href="airtime.html?wallet=' + element.wallet + '">' + element.wallet + '</a></td>' +
      '<td><a href="airtime.html?username=' + element.user_name + '">' + (element.user_name || element.user_id) + '</a></td>' +
      '<td><a href="/tx/' + element.tx_id + '">' + element.tx_id.substring(0, 10) + '...</a></td>' +
      '<td>' + element.amount / 1e8 + '</td>' +
      '</tr>';
  });

  document.getElementById("airtimeTablePayments").innerHTML = tableHeader + tableBody;
}

// =====================================
// ======= TABLE BUILDING END ==========
// =====================================

// =====================================
// ======= DATA FETCHING BEGIN =========
// =====================================

async function fetchDataUsername(term, searchType, pageSize, currentPage, dateStart = '', dateEnd = '') {
  const params = 'id=' + term + '&type=' + searchType + '&pageSize=' + pageSize + '&pageNumber=' + currentPage + '&dateStart=' + dateStart + '&dateEnd=' + dateEnd;
  const data = (await DoRequest(getStatsURL, params)).stats;
  if (data != false && data.length != 0) {
    currentPageCreators = currentPage;
    if (data.creators.length > 0) {
      buildTableCreators(data.creators);
    } else {
      // console.warn('fetchDataUsername -- No Creator Data!', data);
    }
    if (data.viewers.length > 0) {
      buildTableViewers(data.viewers, searchType);
    } else {
      //document.getElementById('DivViewers').classList.add('hidden')
      // console.warn('fetchDataUsername -- No Viewer Data!', data);
    }
    return !(data.viewers.length === 0 && data.creators.length === 0);
  } else {
    // Show not data found
    // console.warn('fetchDataUsername -- No Data!', data);
    return false;
  }
}

async function fetchDataWallet(term, searchType, pageSize, currentPage, dateStart = '', dateEnd = '') {
  const params = 'id=' + term + '&type=' + searchType + '&pageSize=' + pageSize + '&pageNumber=' + currentPage + '&dateStart=' + dateStart + '&dateEnd=' + dateEnd;
  const data = (await DoRequest(getStatsURL, params)).stats;
  if (data != false && data.length != 0) {
    currentPageCreators = currentPage;
    if (data.creators.length > 0) {
      buildTableCreators(data.creators);
    } else {
      // console.warn('fetchDataWallet -- No Creator Data!', data);
    }
    if (data.viewers.length > 0) {
      buildTableViewers(data.viewers, searchType);
    } else {
      //document.getElementById('DivViewers').classList.add('hidden')
      // console.warn('fetchDataWallet -- No Viewer Data!', data);
    }
    return !(data.viewers.length === 0 && data.creators.length === 0);
  } else {
    // Show not data found
    // console.warn('fetchDataWallet -- No Data!', data);
    return false;
  }
}

async function fetchDataCreators(term, searchType, pageSize, currentPage, dateStart = '', dateEnd = '') {
  const params = 'id=' + term + '&type=' + searchType + '&pageSize=' + pageSize + '&pageNumber=' + currentPage + '&dateStart=' + dateStart + '&dateEnd=' + dateEnd;
  const data = (await DoRequest(getStatsURL, params)).stats;
  if (data != false && data.length != 0) {
    currentPageCreators = currentPage;
    buildTableCreators(data);
    return true;
  } else {
    // Show not data found
    // console.warn('fetchDataCreators -- No Data!', data);
    return false;
  }
}

async function fetchDataVideo(term, searchType, pageSize, currentPage, dateStart = '', dateEnd = '') {
  const params = 'id=' + term + '&type=' + searchType + '&pageSize=' + pageSize + '&pageNumber=' + currentPage + '&dateStart=' + dateStart + '&dateEnd=' + dateEnd;
  const data = (await DoRequest(getStatsURL, params)).stats;
  if (data != false && data.length != 0) {
    currentPageVideo = currentPage;
    buildTableVideo(data, term);
    return true;
  } else {
    // Show not data found
    // console.warn('fetchDataVideo -- No Data!', data);
    return false;
  }
}

async function fetchDataViewers(term, searchType, pageSize, currentPage, dateStart = '', dateEnd = '') {
  const params = 'id=' + term + '&type=' + searchType + '&pageSize=' + pageSize + '&pageNumber=' + currentPage + '&dateStart=' + dateStart + '&dateEnd=' + dateEnd;
  const data = (await DoRequest(getStatsURL, params)).stats;
  if (data != false && data.length != 0) {
    currentPageViewers = currentPage;
    buildTableViewers(data, searchType);
    return true;
  } else {
    // Show not data found
    // console.warn('fetchDataViewers -- No Data!', data);
    return false;
  }
}

async function fetchHeaderData(term, dataType, searchType, dateStart = '', dateEnd = '') {
  const params = 'id=' + term + '&type=' + dataType + '&dateStart=' + dateStart + '&dateEnd=' + dateEnd;
  const data = (await DoRequest(getStatsURL, params)).stats;
  if (data != false && data.length != 0) {
    buildHeaderChannel(data[0]);
    return true;
  } else {
    // Show not data found
    // console.warn('fetchHeaderData -- No Data!', data);
    return false;
  }
}

async function fetchDataChannel(term, searchType, pageSize, currentPage, dateStart = '', dateEnd = '') {
  const params = 'id=' + term + '&type=' + searchType + '&pageSize=' + pageSize + '&pageNumber=' + currentPage + '&dateStart=' + dateStart + '&dateEnd=' + dateEnd;
  const data = (await DoRequest(getStatsURL, params)).stats;
  if (data != false && data.length != 0) {
    currentPageChannel = currentPage;
    buildTableChannel(data);
    return true;
  } else {
    // Show not data found
    // console.warn('fetchDataChannel -- No Data!', data);
    return false;
  }
}

async function fetchHeaderVideo(term, dataType, searchType, dateStart = '', dateEnd = '') {
  const params = 'id=' + term + '&type=' + dataType + '&dateStart=' + dateStart + '&dateEnd=' + dateEnd;
  const data = (await DoRequest(getStatsURL, params)).stats;
  if (data != false && data.length != 0) {
    buildHeaderVideo(data[0]);
    return true;
  } else {
    // Show not data found
    // console.warn('fetchHeaderVideo -- No Data!', data);
    return false;
  }
}

async function fetchHeaderViewer(term, dataType, searchType, dateStart = '', dateEnd = '') {
  const params = 'id=' + term + '&type=' + dataType + '&dateStart=' + dateStart + '&dateEnd=' + dateEnd;
  const data = (await DoRequest(getStatsURL, params)).stats;
  if (data != false && data.length != 0) {
    buildHeaderViewer(data[0]);
    return true;
  } else {
    // Show not data found
    // console.warn('fetchHeaderViewer -- No Data!', data);
    return false;
  }
}

async function fetchDataViewer(term, searchType, pageSize, currentPage, dateStart = '', dateEnd = '') {
  const params = 'id=' + term + '&type=' + searchType + '&pageSize=' + pageSize + '&pageNumber=' + currentPage + '&dateStart=' + dateStart + '&dateEnd=' + dateEnd;;
  const data = (await DoRequest(getStatsURL, params)).stats;
  if (data != false && data.length != 0) {
    currentPageChannel = currentPage;
    buildTableViewer(data, term);
    return true;
  } else {
    // Show not data found
    // console.warn('fetchDataViewer -- No Data!', data);
    return false;
  }
}

async function fetchOverviewPayments(pageSize, currentPage, dateStart = '', dateEnd = '') {
  const params = '&type=overviewPayments&pageSize=' + pageSize + '&pageNumber=' + currentPage + '&dateStart=' + dateStart + '&dateEnd=' + dateEnd;;
  const data = (await DoRequest(getStatsURL, params)).stats;
  if (data != false && data.length != 0) {
    currentPagePayments = currentPage;
    buildTablePayments(data);
    return true;
  } else {
    // Show not data found
    // console.warn('fetchOverviewPayments -- No Data!', data);
    return false;
  }
}

function checKAPIErrors(data) {
  const timespanTooShortError = "'dateStart' and 'dateEnd' delimit a timespan that is too small, adjusting 'dateStart' to default";
  let filterChanged = false;
  let msg = [];

  if (data) {
    if (data.warning) {
      if (data.warning.indexOf(timespanTooShortError) !== -1) {
        msg.push('Timespan Too Short Warning!');
      }
    }

    if (data.dateStart) {
      const fromLocal = getFilterFromDate();
      const fromAPI = localizeUTCString(data.dateStart);
      const diff = Math.abs(fromLocal - fromAPI);
      if (diff > 60000) {
        msg.push('dateStart Changed! ' + fromLocal + ' -> ' + fromAPI);
        localStorage.setItem('filterFrom', fromAPI);
        filterChanged = true;
        flashRed('filterFromDIV');
      }
    }

    if (data.dateEnd) {
      const toLocal = getFilterToDate();
      const toAPI = localizeUTCString(data.dateEnd);
      const diff = Math.abs(toLocal - toAPI);
      if (diff > 60000) {
        msg.push('dateEnd Changed! ' + toLocal + ' -> ' + toAPI);
        localStorage.setItem('filterTo', toAPI);
        filterChanged = true;
        flashRed('filterToDIV');
      }
    }
  }

  if (filterChanged) {
    setCurrentDateFilters();
    msg.push('Syncronized Filter with API');
  }

  if (msg.length > 1) {
    console.warn('checkAPIErrors:', msg);
  }
}

// =====================================
// ======= DATA FETCHING END ===========
// =====================================

// =====================================
// ======= NAVIGATION BEGIN ============
// =====================================

function searchStats() {
  const parameter = document.getElementById('inputSearch').value;
  if (parameter != '') {
    if (parameter.substring(0, 2) == 'bx' && parameter.length >= 97) {
      window.location.href = "airtime.html?wallet=" + parameter;
      // console.log('wallet', parameter);
    } else if ((parameter.substring(0, 2) == 'Qm' && parameter.length == 46) || (parameter.substring(0, 2) == 'BR' && parameter.length == 20)) {
      window.location.href = "airtime.html?video=" + parameter;
      // console.log('video', parameter);
    } else if (parameter.substring(0, 2).toLowerCase() == 'at') {
      window.location.href = "airtime.html?viewer_id=" + parameter.substring(2);
      // console.log('viewer_id', parameter);
    } else {
      window.location.href = "airtime.html?username=" + parameter;
      // console.log('username', parameter);
    }
  } else {
    window.location.href = "airtime.html"
    // console.log('none', parameter);
  }
}

function checkUrlParams() {
  const url_string = window.location.href;
  const parameterName = url_string.substring(url_string.lastIndexOf("?") + 1).split("&")[0].split('=')[0];
  const parameter = url_string.substring(url_string.lastIndexOf("?") + 1).split("&")[0].split('=')[1];
  // console.log('checkUrlParams', url_string, parameterName, parameter);
  if (parameter != '' && parameter != undefined) {
    if (parameter.substring(0, 2) == 'bx' && parameter.length == 97) {
      // fetchDataWallet(parameter, 'searchWallet', 30, 0, dateStart, dateEnd);
      drawWalletSearch(parameter);
    } else if (parameterName === 'video' || (parameter.substring(0, 2) == 'Qm' && parameter.length == 46) || (parameter.substring(0, 2) == 'BR' && parameter.length == 20)) {
      drawVideo(parameter);
    } else if (parameter.substring(0, 2).toLowerCase() == 'at') {
      drawViewer(parameter.substring(2));
    } else {
      if (parameterName == 'viewer_id') {
        drawViewer(parameter);
      } else if (parameterName == 'channel') {
        drawChannel(parameter);
      } else {
        drawUsernameSearch(parameter);
      }
    }
  } else {
    drawOverview();
  }
}

async function drawOverview(page = 0) {
  resetVisibility();
  resetContent();
  setVisibleElemName(ELEM_SPINNER, true);

  const dateStart = getStoredFromDate();
  const dateEnd = getStoredToDate();
  const promises = [];
  promises.push(fetchDataCreators('', 'creators', PAGE_SIZE, page, dateStart, dateEnd));
  promises.push(fetchDataViewers('', 'viewers', PAGE_SIZE, page, dateStart, dateEnd));
  promises.push(fetchOverviewPayments(PAGE_SIZE, page, dateStart, dateEnd));
  const results = await Promise.all(promises);

  resetVisibility();
  if (results.indexOf(true) === -1) {
    setVisibleElemName(ELEM_NODATA, true);
  } else {
    setVisibleElemName(ELEM_OVERVIEW_CONTAINER, true);
    setVisibleElemName(ELEM_PAYMENTS_CONTAINER, true);
  }
}

async function drawChannel(channelID, page = 0) {
  resetVisibility();
  resetContent();
  setVisibleElemName(ELEM_SPINNER, true);

  const dateStart = getStoredFromDate();
  const dateEnd = getStoredToDate();
  const searchType = 'creatorVideos';
  const promises = [];
  promises.push(fetchHeaderData(channelID, 'creatorTotals', searchType, dateStart, dateEnd));
  promises.push(fetchDataChannel(channelID, searchType, PAGE_SIZE, page, dateStart, dateEnd));
  const results = await Promise.all(promises);

  resetVisibility();
  if (results.indexOf(true) === -1) {
    setVisibleElemName(ELEM_NODATA, true);
  } else {
    setVisibleElemName(ELEM_CHANNEL_CONTAINER, true);
  }
}

async function drawVideo(videoID, page = 0) {
  resetVisibility();
  resetContent();
  setVisibleElemName(ELEM_SPINNER, true);

  const dateStart = getStoredFromDate();
  const dateEnd = getStoredToDate();
  const searchType = 'videoViewers';
  const promises = [];
  promises.push(fetchHeaderVideo(videoID, 'videoTotals', searchType, dateStart, dateEnd));
  promises.push(fetchDataVideo(videoID, searchType, PAGE_SIZE, page, dateStart, dateEnd));
  const results = await Promise.all(promises);

  resetVisibility();
  if (results.indexOf(true) === -1) {
    setVisibleElemName(ELEM_NODATA, true);
  } else {
    setVisibleElemName(ELEM_VIDEO_CONTAINER, true);
  }
}

async function drawViewer(viewerID, page = 0) {
  resetVisibility();
  resetContent();
  setVisibleElemName(ELEM_SPINNER, true);

  const dateStart = getStoredFromDate();
  const dateEnd = getStoredToDate();
  const searchType = 'viewerWatched';
  const promises = [];
  promises.push(fetchHeaderViewer(viewerID, 'viewerTotals', searchType, dateStart, dateEnd));
  promises.push(fetchDataViewer(viewerID, searchType, PAGE_SIZE, page, dateStart, dateEnd));
  const results = await Promise.all(promises);

  resetVisibility();
  if (results.indexOf(true) === -1) {
    setVisibleElemName(ELEM_NODATA, true);
  } else {
    setVisibleElemName(ELEM_VIEWER_CONTAINER, true);
  }
}

async function drawWalletSearch(wallet, page = 0) {
  resetVisibility();
  resetContent();
  setVisibleElemName(ELEM_SPINNER, true);

  const dateStart = getStoredFromDate();
  const dateEnd = getStoredToDate();
  const promises = [];
  promises.push(fetchDataWallet(wallet, 'searchWallet', PAGE_SIZE, page, dateStart, dateEnd));
  const results = await Promise.all(promises);

  resetVisibility();
  if (results.indexOf(true) === -1) {
    setVisibleElemName(ELEM_NODATA, true);
  } else {
    setVisibleElemName(ELEM_OVERVIEW_CONTAINER, true);
  }
}

async function drawUsernameSearch(userName, page = 0) {
  resetVisibility();
  setVisibleElemName(ELEM_SPINNER, true);

  const dateStart = getStoredFromDate();
  const dateEnd = getStoredToDate();
  const promises = [];
  promises.push(fetchDataUsername(userName, 'searchUserName', PAGE_SIZE, page, dateStart, dateEnd));
  const results = await Promise.all(promises);

  resetVisibility();
  if (results.indexOf(true) === -1) {
    setVisibleElemName(ELEM_NODATA, true);
  } else {
    setVisibleElemName(ELEM_OVERVIEW_CONTAINER, true);
  }
}

// =====================================
// ======= NAVIGATION END ==============
// =====================================

// =====================================
// ======= UTILITY BEGIN ===============
// =====================================
function clearStorage() {
  // console.log('UNLOAD HREF', window.location.href);
  // if (window.location.href.indexOf('airtime.html') === -1) {
    console.log('CLEAR STORAGE'); // , window.location.href
    resetDateFiltersStorage();
  // }
}

function updateLastAct() {
  // console.log('updateLastAct');
  localStorage.setItem('lastAct', Date.now());
}

function checkLastAct() {
  let clear = true;
  try {
    const lastUnloadDate = new Date(parseInt(localStorage.getItem('lastAct'), 10));
    // console.log(new Date() - lastUnloadDate);
    if (new Date() - lastUnloadDate < 1000 * 60 * 5) {
      clear = false;
    }
  } catch (err) {
    // console.error(err);
  }
  // console.log('checkLastAct', clear);
  if (clear) clearStorage();
}

function DoRequest(url, params) {
  // const url = 'https://airtime.bit.tube/getStats';
  // const params = 'id=' + id + '&type=' + type + '&pageSize=' + pageSize + '&pageNumber=' + currentPage + '&dateStart=' + dateStart + '&dateEnd=' + dateEnd;

  return new Promise((resolve, reject) => {
    const http = new XMLHttpRequest();
    http.open('POST', url, true);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded'); // Send the proper header information along with the request
    http.onreadystatechange = function () { // Call a function when the state changes.
      if (http.readyState == 4 && http.status == 200) {
        // console.log('DoRequest', url, params, http.status);
        try {
          const data = JSON.parse(http.responseText);
          checKAPIErrors(data);
          resolve(data);
        } catch (err) {
          console.warn('DoRequest JSON Parse Error:', err);
          reject(err);
        }
      } else if (http.readyState == 4) {
        reject(new Error('DoRequest - Got Bad Status:' + http.status + ' - ' + http.statusText));
      }
    }
    http.send(params);
  });
}

// https://stackoverflow.com/questions/8211744/convert-time-interval-given-in-seconds-into-more-human-readable-form
function millisecondsToStr(milliseconds) {
  // TIP: to find current time in milliseconds, use:
  // var  current_time_milliseconds = new Date().getTime();

  function numberEnding(number) {
    return (number > 1) ? 's' : '';
  }

  function round(number) {
    return Math.floor(number * 100) / 100;
  }

  var temp = Math.floor(milliseconds / 1000);
  var years = round(temp / 31536000);
  if (years >= 1) {
    return years + ' year' + numberEnding(years);
  }
  //TODO: Months! Maybe weeks? 
  var days = round((temp %= 31536000) / 86400);
  if (days >= 1) {
    return days + ' day' + numberEnding(days);
  }
  var hours = round((temp %= 86400) / 3600);
  if (hours >= 1) {
    return hours + ' hour' + numberEnding(hours);
  }
  var minutes = round((temp %= 3600) / 60);
  if (minutes >= 1) {
    return minutes + ' minute' + numberEnding(minutes);
  }
  var seconds = temp % 60;
  if (seconds) {
    return seconds + ' second' + numberEnding(seconds);
  }
  return 'less than a second'; //'just now' //or other string you like;
}

function secondsToStr(seconds) {
  return millisecondsToStr(seconds * 1000);
}

function resetVisibility() {
  const elements = [ELEM_OVERVIEW_CONTAINER, ELEM_CHANNEL_CONTAINER, ELEM_VIDEO_CONTAINER, ELEM_VIEWER_CONTAINER, ELEM_SPINNER, ELEM_NODATA, ELEM_PAYMENTS_CONTAINER];
  elements.forEach((elemName) => {
    setVisibleElemName(elemName, false);
  });
}

function resetContent() {
  const elements = ["airtimeTableVideo", "airtimeTablePayments", "airtimeTableChannel", "airtimeTableCreators", "airtimeTableViewer", "airtimeTableViewers", "pagesCreators", "pagesViewers", "pagesPayments", "pagesChannel", "pagesVideo", "pagesViewer"];
  elements.forEach((elemName) => {
    document.getElementById(elemName).innerHTML = "";
  });
}

function setVisibleElemName(elemName, setToVisible) {
  const elem = document.getElementById(elemName);
  if (setToVisible) {
    if (elem.className.indexOf('hidden') !== -1) {
      elem.classList.remove('hidden');
    }
  } else {
    if (elem.className.indexOf('hidden') === -1) {
      elem.classList.add('hidden');
    }
  }
}

function flashRed(elem_name) {
  if (!elem_name) return;
  const elem = document.getElementById(elem_name);
  if (!elem) return;
  elem.style.transition = 'background-color 500ms ease-out';
  elem.style.setProperty('background-color', 'red', 'important');

  setTimeout(() => {
    elem.style.transition = 'background-color 2500ms linear';
    elem.style.setProperty('background-color', '', '');
  }, 500);
}

// =====================================
// ======= UTILITY END =================
// =====================================

function onload() {
  document.addEventListener('mousemove', () => {
    updateLastAct();
  }, {passive: true, capture: false});
}