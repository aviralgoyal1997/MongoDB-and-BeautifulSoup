var colorMap = { b: 'blue', bh: '#00a1de', t: 'brown', th: '#62361b', g: 'green', gh: '#009b3a', o: 'orange', oh: '#f9461c', v: 'pink', vh: '#e27ea6', p: 'purple', ph: '#522398', r: 'red', rh: '#c60c30', y: 'yellow', yh: '#f9e300' };
var geoFriendlyErrors = {
  0: "<ul><li>You’re underground or in a sturdy building.</li><li>Your computer or device doesn’t have GPS or WiFi available.</li><li>Your computer or device couldn’t give us an accurate enough reading.</li></ul>",
  1: "<ul><li>You didn’t allow us to see your location, when prompted.</li><li>Your browser is set to reject requests for location info whenever we ask.</li><li>Your browser is set to reject requests for location info whenever anyone asks.</li></ul>",
  2: "<ul><li>Your browser isn’t able to offer us location data.</li><li>You’re underground or in a sturdy building.</li><li>Your computer or device doesn’t have GPS or WiFi available.</li></ul>",
  3: "<ul><li>Your browser tried finding your location and sharing it with us, but it couldn’t get the info quickly enough (the operation timed out).</li></ul>",
  4: "<ul><li>You aren’t connected to the Internet.</li><li>An error occurred getting information from our servers.</li></ul>"
};
var coords;
var geoPositionOptions = new Object();
function setGeoTool() {
  if (!navigator.geolocation) {
    HideGeoTool();
    return;
  }
  geoPositionOptions.enableHighAccuracy = true;
  geoPositionOptions.timeout = 10000;
  geoPositionOptions.maximumAge = 10000;

  $("#detectlink").click(function (eventObj) {
    $("#ttgeo_detect_start").hide();
    $("#ttgeo_detect_busy").show();
    RecalcTitleHeight();
    navigator.geolocation.getCurrentPosition(geoSuccessCallback, geoErrorCallback, geoPositionOptions);
  });
  $(".georetrylink").click(function (eventObj) {
    $("#ttgeo_detect_success, #ttgeo_detect_fail").hide();
    setTimeout(function () { $("#detectlink").click(); }, 250);
  });
  if ($("div#ap_pane_search").length > 0) {
    $(".stationsearch").click(function () {
      $("div#ap_pane_search div.acpickerhead").trigger('click');
    });
  }
}
function HideGeoTool() {
  $("#ap_pane_nearaby").remove();
}
function geoSuccessCallback(position) {
  coords = position.coords;
  if (coords.accuracy > GeoAccuracyCeiling) {
    $("div#ttgeo_detect_busy").hide();
    $("div#ttgeo_detect_fail").ttGeoDebug(geoDebug, { code: 0, message: "Insuficient accuracy, browser/device returned: " + coords.accuracy + ', must be less than ' + GeoAccuracyCeiling }).show();
  } else {
    $.ajax({
      url: '/traintracker/GeoLocation/geoLocation.aspx',
      type: 'POST',
      data: { Latitude: coords.latitude, Longitude: coords.longitude, IdList: true },
      success: function (data, textStatus, jqXHR) {
        $("#ttgeo_detect_busy").hide();
        //alert("got data: " + data.length);
        PopulateLocList(data);
        $("#ttgeo_detect_success").show();
        RecalcTitleHeight();
        // set the accuracy tag:

        $("#loctolerance").html(Math.round(coords.accuracy).toString() + ' meters');
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("div#ttgeo_detect_fail").ttGeoDebug(geoDebug, { code: 4, message: textStatus }).show();
      },
      dataType: 'json'
    });
  }
  RecalcTitleHeight();
}
function PopulateLocList(mapids) {
  $("#ttloclist").ttUnregisterFavorites();
  $("#ttloclist ul.ttlocul li").remove();

  $.each(mapids, function (i, v) {
    $(BuildSlip(v, false)).appendTo("#ttloclist ul.ttlocul");
  });

  $("#ttloclist").ttRegisterFavorites({
    toolid: $(this).get(0).id,
    update: function (activeStars, changed) {
      $("#ttloclist ul.ttlocul li").each(function (idx, ele) {
        if ($.inArray($(this).attr("data-sid"), activeStars) >= 0) {
          $(this).find(".ttfav_bstar").removeClass("bstar_off").addClass("bstar_on");
        } else {
          $(this).find(".ttfav_bstar").removeClass("bstar_on").addClass("bstar_off");
        }
      });
    },
    initialize: function (clickCallback) {
      $("#ttloclist ul.ttlocul li").each(function (idx, ele) {
        var sid = $(this).attr("data-sid");
        $(this).find(".ttfav_bstar").click(function () {
          clickCallback(sid);
        });
      });
    }
  });
  RecalcTitleHeight();
}

function geoErrorCallback(pe) {
  coords = null;
  $("div#ttgeo_detect_busy").hide();
  $("div#ttgeo_detect_fail").ttGeoDebug(geoDebug, pe).show();
  RecalcTitleHeight();
}


function RecalcTitleHeight() {
  $(".ttgeo_title").height($("#ttgeorow").height());
}
var SearchKeys;
var working = false;

function setSearchTool(txtFieldId, btnSearchId) {
  $("#" + btnSearchId).click(function (e) {
    e.preventDefault();
    if (!working) {
      working = true;
      ConductSearch(txtFieldId, true);
      working = false;
    }
  });
  SearchKeys = BuildSearch();

  $("#" + txtFieldId).keyup(function (eo) {
    if (!working) {
      working = true;
      ConductSearch(txtFieldId, false);
      working = false;
    }
  });
}
function ConductSearch(txtFieldId, freshen) {
  var keywords = $("#" + txtFieldId).val().toString().split(" ");
  var merged = GetMergedMapIds(SearchKeys, keywords);

  $("ul#ttsearchresultsul li").remove();
  var total = 0;
  var splash = 0;
  $("#stationsrchresults").ttUnregisterFavorites();
  if (freshen) { splash = 250; }
  setTimeout(function () {
    for (mid in merged) {
      if (total < 5) {
        var slip = BuildSlip(mid);
        $(slip).appendTo("ul#ttsearchresultsul");
        ++total;
      } else {
        break;
      }
    }
    $("#stationsrchresults").ttRegisterFavorites({
      toolid: $(this).get(0).id,
      update: function (activeStars, changed) {
        $("#ttsearchresultsul li").each(function (idx, ele) {
          if ($.inArray($(this).attr("data-sid"), activeStars) >= 0) {
            $(this).find(".ttfav_bstar").removeClass("bstar_off").addClass("bstar_on");
          } else {
            $(this).find(".ttfav_bstar").removeClass("bstar_on").addClass("bstar_off");
          }
        });
      },
      initialize: function (clickCallback) {
        $("ul#ttsearchresultsul li").each(function (idx, ele) {
          var sid = $(this).attr("data-sid");
          $(this).find(".ttfav_bstar").click(function () {
            clickCallback(sid);
          });
        });
      }
    });
  }, splash);
}

var acState = [];
function startAccordion(openPaneId) {
  $("#ap_container > div").each(function (idx, ele) {
    if (openPaneId == ele.id) {
      acpOpenPane($('#' + openPaneId).get(0));
      acState.push({ pane: ele, state: 1 });
    } else {
      acState.push({ pane: ele, state: 0 });
    }
    $(this).find("div.acpickerhead:first").bind('click', { so: acState[idx] }, function (eo) {
      if (eo.data.so.state == 0) {
        acpOpenPane(eo.data.so.pane);
        for (i in acState) {
          if (acState[i].state == 1) {
            acpClosePane(acState[i].pane);
            acState[i].state = 0;
          }
        }
        eo.data.so.state = 1;
      } else {
        acpClosePane(eo.data.so.pane);
        eo.data.so.state = 0;
      }
    });
  });
}
function acpOpenPane(ele) {
  $(ele).find("div.acpickercontent").slideDown(250, function () {
    if (ele.id == 'ap_pane_follow' || ele.id == 'ap_pane_search') {
      $(ele).find('input[type="text"]').focus();
    } 
  });
  $(ele).find("div.acpickerhead").removeClass("acpickerdown");
  $(ele).find("div.acpickerhead").addClass("acpickerup");
}
function acpClosePane(ele) {
  $(ele).find("div.acpickercontent").slideUp(250);
  $(ele).find("div.acpickerhead").removeClass("acpickerup");
  $(ele).find("div.acpickerhead").addClass("acpickerdown");
  if (ele.id == 'ap_pane_follow' || ele.id == 'ap_pane_search') {
    $(ele).find('input[type="text"]').blur();
  }
}
// Start jQuery safety
jQuery(function ($) {
  // favorites tool
  var RegisteredFavTools = [];
  var FavsList = [];
  var RecsList = [];
  $.fn.ttRegisterFavorites = function (tool) {
    if (RegisteredFavTools.length == 0) {
      // first call, do base setup
      var data = readCookie("TTFavorites");
      if (data) {
        data = data.split(":");
        if (data.length == 2) {
          FavsList = data[0] == '' ? [] : data[0].split(",");
          RecsList = data[1] == '' ? [] : data[1].split(",");
          if (RecsList.length > 5) {
            RecsList.length = 5;
          }
        } else {
          createCookie("TTFavorites", ":", 365);
        }
      }
    }
    if (RecsList.length == 0 && FavsList.length == 0 && tool.hasOwnProperty('nodata')) {
      tool.nodata();
    }
    if (RecsList.length == 0 && tool.hasOwnProperty('norecs')) {
      tool.norecs();
    }
    if (tool.hasOwnProperty('newrecent')) {
      UpdateRecList(tool.newrecent);
      createCookie("TTFavorites", FavsList.join(",") + ":" + RecsList.join(","), 365);
    }
    RegisteredFavTools.push(tool);
    tool.initialize(function (mapid) {
      UpdateFavList(mapid);
      createCookie("TTFavorites", FavsList.join(",") + ":" + RecsList.join(","), 365);
      for (t in RegisteredFavTools) {
        RegisteredFavTools[t].update(FavsList, mapid);
      }
    });
    tool.update(FavsList, undefined);
  };
  $.fn.ttUnregisterFavorites = function () {
    for (t in RegisteredFavTools) {
      if (RegisteredFavTools[t].toolid == this.get(0).id) {
        RegisteredFavTools.splice(t, 1);
      }
    }
  };
  function UpdateRecList(mapid) {
    var idx = $.inArray(mapid, RecsList);
    if (idx >= 0) {
      RecsList.splice(idx, 1);
    }
    RecsList.splice(0, 0, mapid);
  }
  function UpdateFavList(mapid) {
    var idx = -1;
    for (i = 0; i < FavsList.length; ++i) {
      if (FavsList[i] == mapid) {
        idx = i;
        break;
      }
    }
    if (idx >= 0) {
      FavsList.splice(idx, 1)
    } else {
      FavsList.splice(0, 0, mapid);
    }
  }

  $.fn.ttGeoDebug = function (show, errorObject) {
    if (show) {
      $(this).find("#geodebugmessage").html("ERROR: " + errorObject.message).show();
    }
    $(this).find("#geofriendlymessage").html(geoFriendlyErrors[errorObject.code]);
    var anchor = $(this).find("#geohelpanchor");
    anchor.attr('href', anchor.attr('href') + '#locerr' + parseInt(errorObject.code + 1));
    return this;
  }
  // end jQuery safety.
});

function BuildSlip(mid, favorite) {
  var li = $(document.createElement("li"));
  li.attr("data-sid", mid);
  var src = searchData[mid];
  //var link = '<a href="/traintracker/arrivaltimes.aspx?sid=' + mid + '">' + src[1] + '</a>';
  var colors = src[0].split(";")[1].split("");
  var colorNames = [];
  var cblocks = '';
  for (c = colors.length - 1; c >= 0; --c) {
    colorNames.push(colorMap[colors[c]].substring(0, 1).toUpperCase() + colorMap[colors[c]].substring(1))
    cblocks += '<div style="background-color: ' + colorMap[colors[c] + 'h'] + ';" class="ttfav_routecolor" />';
  }
  var cWidth = colors.length * 16;
  var nameWidth = 212 - cWidth;
  ctitle = colorNames.join(", ");
  if (colorNames.length > 1) { ctitle += ' lines'; } else { ctitle += ' line'; }
  var bStar;
  if (favorite) {
    bStar = '<div class="ttfav_bstar bstar_on" />';
  } else {
    bStar = '<div class="ttfav_bstar bstar_off" />';
  }
  var link = '<a href="/traintracker/arrivaltimes.aspx?sid=' + mid + '" style="display:inline-block; height:26px;width:' + nameWidth + 'px;">' + src[1] + '</a>';
  li.html('<div class="ttfav_station">' + bStar + '<div style="width: ' + nameWidth + 'px;" class="ttfav_name">' + link + '</div><div width="' + cWidth + 'px" class="ttfav_routeblock" title="' + ctitle + '">' + cblocks + '</div></div>');
  return li;
}

// Station Search related:
function BuildSearch() {
  var dict = {};
  var counter = 0;
  var SearchKeys = new Array();
  for (key in searchData) {
    var d = searchData[key][0].toString().split(';');
    var data = d[0].split(',');
    data = data.concat(BuildColors(d[1]));
    for (k in data) {
      if (dict.hasOwnProperty(data[k])) {
        dict[data[k]].push(key);
      } else {
        dict[data[k]] = new Array();
        dict[data[k]].push(key);
        ++counter;
      }
    }
  }
  for (k in dict) {
    SearchKeys.push({ key: k, mapid: dict[k] });
  }
  SearchKeys.sort(function (a, b) {
    if (a.key < b.key) {
      return -1;
    } else {
      return 1;
    }
  });
  return SearchKeys;
}
function BuildColors(c) {
  var keys = c.split("");
  var result = [];
  for (k in keys) {
    if (colorMap.hasOwnProperty(keys[k])) {
      result.push(colorMap[keys[k]]);
    }
  }
  return result;
}
function GetMergedMapIds(SearchKeys, keywords) {
  var keymap = [];
  var merged = {};
  for (keyidx in keywords) {
    if (keywords[keyidx].length == 0) { continue; }
    keymap.push({});
    for (o in SearchKeys) {
      if (SearchKeys[o].key.indexOf(keywords[keyidx].toLowerCase()) > -1) {
        for (i in SearchKeys[o].mapid) {
          keymap[keymap.length - 1][SearchKeys[o].mapid[i]] = 1;
        }
      }
    }
  }
  for (i = 1; i < keymap.length; ++i) {
    for (mid in keymap[i]) {
      if (keymap[i - 1].hasOwnProperty(mid)) {
        merged[mid] = 1;
      }
    }
    if ((i + 1) < keymap.length) {
      keymap[i] = merged;
      merged = {};
    }
  }
  if (keymap.length == 1) { merged = keymap[0]; }

  return merged;
}
function popUp(URL) {
  day = new Date();
  id = day.getTime();
  eval("page" + id + " = window.open(URL, '" + id + "');");
}
