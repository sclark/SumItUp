chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
 if (request.action == "getDOM") sendResponse({text: document.body.innerText, title: document.title});
 else sendResponse({});
});
