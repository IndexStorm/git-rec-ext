browser.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab) {
        if (changeInfo.url) {
            browser.tabs.sendMessage( tabId, {
                message: 'url changed',
                url: changeInfo.url
            })
        }
    }
);
