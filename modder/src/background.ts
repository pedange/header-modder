import type {Group} from './app/models/header-modder.models';

chrome.storage.onChanged.addListener((changes: {[key: string]: chrome.storage.StorageChange}, namespace: string) => {
  if (namespace === 'local' && changes['groups']) {
    updateRules(changes['groups'].newValue as Group[]);
  }
});

// Allow opening side panel on action click
if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel
    .setPanelBehavior({openPanelOnActionClick: true})
    .catch((error) => console.error(error));
}

function updateRules(groups: Group[] | undefined) {
  const dynamicRules: chrome.declarativeNetRequest.Rule[] = [];
  let ruleId = 1;

  if (groups) {
    groups.forEach(group => {
      if (group.enabled && group.rules) {
        group.rules.forEach(rule => {
          if (rule.enabled) {
            dynamicRules.push({
              id: ruleId++,
              priority: 1,
              action: {
                type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
                requestHeaders: [
                  {
                    header: rule.header,
                    operation: chrome.declarativeNetRequest.HeaderOperation.SET,
                    value: rule.value
                  }
                ]
              },
              condition: {
                urlFilter: group.urlPattern || '*',
                resourceTypes: [
                  chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
                  chrome.declarativeNetRequest.ResourceType.SUB_FRAME,
                  chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
                  chrome.declarativeNetRequest.ResourceType.SCRIPT,
                  chrome.declarativeNetRequest.ResourceType.STYLESHEET,
                  chrome.declarativeNetRequest.ResourceType.IMAGE,
                  chrome.declarativeNetRequest.ResourceType.MEDIA,
                  chrome.declarativeNetRequest.ResourceType.FONT,
                  chrome.declarativeNetRequest.ResourceType.WEBSOCKET,
                  chrome.declarativeNetRequest.ResourceType.OTHER
                ]
              }
            });
          }
        });
      }
    });
  }

  // First, get all current dynamic rules to remove them
  chrome.declarativeNetRequest.getDynamicRules(oldRules => {
    const oldRuleIds = oldRules.map((r: chrome.declarativeNetRequest.Rule) => r.id);
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldRuleIds,
      addRules: dynamicRules
    });
  });
}

// Initial update on load
chrome.storage.local.get(['groups'], (result: {[key: string]: unknown}) => {
  updateRules(result['groups'] as Group[]);
});
