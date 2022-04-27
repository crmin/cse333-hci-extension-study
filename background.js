// deactivated가 된 후 시간이 threshold(=10s)를 초과하는 경우 출력

function getUnixTime() {
    return Math.floor(new Date().getTime() / 1000);
}

let currentActivatedTabId = null;
let lastDeactivatedTimes = {}

let exceededTabIds = [];

chrome.action.onClicked.addListener(async () => {
    let url = chrome.runtime.getURL('popup.html');
    let tab = await chrome.tabs.create({ url });
    console.log(`current tab id: ${tab.id}`)
    console.log('tab:');
    console.log(lastDeactivatedTimes);
})

chrome.tabs.onActivated.addListener(activeInfo => activate(activeInfo));

async function activate(activeInfo) {
    lastDeactivatedTimes[currentActivatedTabId] = getUnixTime();
    currentActivatedTabId = activeInfo.tabId;
}

setInterval(() => {
    for(const [tabId, lastDeactivatedTime] of Object.entries(lastDeactivatedTimes)) {
        const tabTimeDelta = getUnixTime() - lastDeactivatedTime;
        const tabTimeThreshold = 10;
        const isIncludedTabId = exceededTabIds.includes(tabId);
        if(tabId != currentActivatedTabId && tabTimeDelta > tabTimeThreshold && !isIncludedTabId) {
            console.log(`Exceed: ${tabId}`);
            exceededTabIds.push(tabId);
        } else if(tabTimeDelta <= tabTimeThreshold && isIncludedTabId) {
            // remove from list
            exceededTabIds = exceededTabIds.filter(function(value, index, arr){
                return value != tabId;
            });
        }
    }
}, 1000)