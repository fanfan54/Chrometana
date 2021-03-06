(function () {
  "use strict";
  var defaultSE = "Google.com";
  var advanced_settings = document.getElementsByClassName('chrometana_advanced_setting');
  var useCustomSearch = document.getElementById('useCustomSearch');
  var custom_engine_settings = document.getElementById('custom_engine_settings');
  var selectorList = document.getElementsByClassName('selector');

  if (getURLVariable("newinstall") === "yes"){
    var installadvice = document.getElementById('installadvice');
    addClass(installadvice, 'visible');
    // Set all bing searches to redirect by default (Google policy "works by default" workaround)
    save_options('all_bing_searches', true);
  }

  if (getURLVariable("update") === "yes"){
      chrome.storage.sync.get(['all_bing_searches'], function (all_bing_searches){
        console.log(all_bing_searches);
        if(all_bing_searches.all_bing_searches !== null) {
          console.log("already set");
        } else {
          // Set all bing searches to redirect by default (Google policy "works by default" workaround)
          save_options('all_bing_searches', true);
        }
      });
  }

  var optionCaller = function() {
    save_options('search_engine', this.getAttribute('value'));
  };

  var handleMouseover = function() {
    var selectedElements = document.getElementsByClassName('hovering');
    for (var i = 0; i < selectedElements.length; i++) {
      removeClass(selectedElements[i], 'hovering');
    }
    var selected = document.getElementsByClassName('selected')[0];
    removeClass(selected, 'hovering');
    addClass(this, 'hovering');

  };

  var handleMouseout = function() {
    var selected = document.getElementsByClassName('selected')[0];
    removeClass(this, 'hovering');
    addClass(selected, 'hovering');
  };

  var advancedSettingsCaller = function() {
    var value;
    if(this.getAttribute("type") === "checkbox" || this.getAttribute("type") === "radio"){
      if(this.checked){
        value = true;
      }
      else{
        value = false;
      }
    }
    save_options(this.id, value);
  };

  function save_options(key, value){
    var options = {};
    options[key] = value;
    if(key === "custom_engine"){ 
      if(value !== ""){
        options.search_engine = "Custom";
      }
      else{
        options.search_engine = defaultSE;
      }
    }
    chrome.storage.sync.set(options, function() {
      restore_options();
    });
  }

  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  function restore_options() {
    chrome.storage.sync.get({
      search_engine: defaultSE, 
      custom_engine: '',
      enable_open_website: false,
      all_bing_searches: true,
      exclude_settings_app: true
    }, function(items) {
      updateDisplay(items);
    });
  }

  function updateDisplay(items){
    for (var i = 0; i <  selectorList.length; i++) {
      if (selectorList[i].getAttribute('value') === items.search_engine) {
        addClass(selectorList[i], 'selected');
        addClass(selectorList[i], 'hovering');
      }
      else {
        removeClass(selectorList[i], 'selected');
      }
    }
    if(items.search_engine === "Custom"){
      useCustomSearch.checked = true;
    }
    else{
      useCustomSearch.checked = false;
    }
    document.getElementById("custom_engine").value = items.custom_engine;
    updateCustomSearchView();
    updateCheckBoxes(items);
    var status = document.getElementById('status');
    addClass(status, 'updated');
      status.textContent = 'New search engine preferences saved.';
      setTimeout(function() {
        status.textContent = '';
        removeClass(status, 'updated');
      }, 1050);
  }

  function updateCheckBoxes(items){
    for (var i = 0; i <  advanced_settings.length; i++) {
      var id = advanced_settings[i].getAttribute("id");
      if(id in items){
        if(items[id] === true){
          document.getElementById(id).checked = true;
        }
        else{
          document.getElementById(id).checked = false;
        }
      }
      else if (id !== null){
        document.getElementById(id).checked = false;
      }
    }
  }

  function updateCustomSearchView(){
    if(useCustomSearch.checked){
      addClass(custom_engine_settings, 'visible');
    }
    else{
      removeClass(custom_engine_settings, 'visible');
    }
  }


  //Parses arguments from URL
  function getURLVariable(variable){
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      if(pair[0] === variable){
        return pair[1];
      }
    }
    return(false);
  }

  function addClass(element, classNameToAdd) {
    if(typeof element!=="undefined"){
      element.classList.add(classNameToAdd);
    }
  }

  function removeClass(element, classNameToRemove) {
    if(typeof element!=="undefined"){
      element.classList.remove(classNameToRemove);
    }
  }

  // Add Event Listeners
  document.addEventListener('DOMContentLoaded', restore_options);

  for (var s = 0; s <  selectorList.length; s++) {
    selectorList[s].addEventListener('click', optionCaller,false);
    selectorList[s].addEventListener('mouseover', handleMouseover, false);
    selectorList[s].addEventListener('mouseleave', handleMouseout, false);
  }

  useCustomSearch.addEventListener('click', function() {
    updateCustomSearchView();
    if(!this.checked){
      document.getElementById('custom_engine_update').click();
    }
  });

  for (var i = 0; i <  advanced_settings.length; i++) {
    advanced_settings[i].addEventListener('click', advancedSettingsCaller, false);
  }

  document.getElementById('custom_engine_update').addEventListener('click', function() {
    var element = document.getElementById('custom_engine');
    if(useCustomSearch.checked){
      if(element.value.toLowerCase().indexOf("http") !== -1){
        save_options('custom_engine', element, element.value);
      }
      else{
        alert("Custom search engine must start with http");
      }
    }
    else{
      save_options('custom_engine', element, "");
    }
  });

  document.getElementById('additional-settings-toggle').addEventListener('click', function() {
    var settingsPane = document.getElementById('expandable_settings_pane');
    var engines = document.getElementById('custom-engine-select');

    if (settingsPane.className.search('open') >= 0) {
      removeClass(settingsPane, 'open');
      removeClass(engines, 'hidden');
    }
    else {
      addClass(settingsPane, 'open');
      addClass(engines, 'hidden');
    }
  });
}());