var page = 0;
let article_array;
var window_status = "intro";
var content_arr = [];
var source_array = [];
var link_target;
var k = 0;
var panels = ["all"];
var current_panel = 0;
var activity = false;
var volume_status = false;
let current_article;
let epsiodes_download = 3;

//store all used article ids
let all_cid = [];

let read = [];
let recently_played = [];
let listened_elements = "";
let read_elem = "";

let tab_index = 0;
//xml items
var rss_title = "";
var item_title = "";
var item_summary = "";
var item_link = "";
var item_date_unix = "";
var item_duration = "";
var item_type = "";
var item_filesize = "";
var item_date_unix = "";
var item_category = "";
var item_cid = "";

//youtube
var item_image = "";
var item_id = "";
let listened_elem = "";
let sleepmode = false;

let lock = window.navigator.requestWakeLock("screen");

//read and listened articles/podcasts
if (localStorage.getItem("listened") != null) {
  listened_elem = JSON.parse(localStorage.getItem("listened"));
}

if (localStorage.getItem("recentlyplayed") != null) {
  recently_played = JSON.parse(localStorage.getItem("recentlyplayed"));
}

if (localStorage.getItem("read") != null) {
  read_elem = JSON.parse(localStorage.getItem("read"));
}

if (localStorage.getItem("epsiodes_download") != null) {
  epsiodes_download = localStorage.getItem("episodes_download");
}

setTimeout(() => {
  document.getElementById("intro").style.display = "none";
  navigator.minimizeMemoryUsage();
}, 3500);

//check if activity or not
setTimeout(() => {
  if (activity === false) {
    //check if source file is set

    if (
      localStorage["source_local"] == undefined &&
      localStorage["source"] == undefined
    ) {
      localStorage.setItem(
        "source",
        "https://raw.githubusercontent.com/strukturart/rss-reader/master/example.json"
      );
      document.getElementById("message-box").style.display = "none";
      load_source();
    }
    //get update time; cache || download
    let a = localStorage.getItem("interval");
    if (a == null) {
      a = 0;
    }
    //download
    if (cache.getTime(a) && navigator.onLine) {
      if (
        localStorage["source"] &&
        localStorage["source"] != "" &&
        localStorage["source"] != undefined
      ) {
        let str = localStorage["source"];
        if (str.includes(".json")) {
          load_source();
        }
        if (str.includes(".opml")) {
          load_source_opml();
        }
      } else {
        let str = localStorage["source_local"];
        if (str.includes(".json")) {
          load_local_file();
        }
        if (str.includes(".opml")) {
          load_local_file_opml();
        }
      }
      //load cache
    } else {
      content_arr = cache.loadCache();
      if (content_arr) {
        build();
      } else {
        show_settings();
        alert("no cached data available");
      }
    }
  }
}, 1500);

/////////////////////////////
////////////////////////////
//GET URL LIST/////////////
//from local file or online source
//////////////////////////
//////////////////////////

///////////
///load source file from online source
//////////

let load_source = function () {
  let source_url = localStorage.getItem("source") + "?q=123";
  let xhttp = new XMLHttpRequest({
    mozSystem: true,
  });

  let nocaching = Math.floor(Date.now() / 1000);

  xhttp.open("GET", source_url + "?time=" + nocaching, true);
  xhttp.timeout = 5000;
  xhttp.onload = function () {
    if (xhttp.readyState === xhttp.DONE && xhttp.status === 200) {
      //alert(this.getResponseHeader("Last-Modified"));

      let data = xhttp.response;

      //check if json valid
      try {
        data = JSON.parse(data);
      } catch (e) {
        document.querySelector("#download").innerHTML =
          "😴<br>Your json file is not valid";
        setTimeout(() => {
          document.getElementById("message-box").style.display = "none";
          show_settings();
        }, 3000);

        return false;
      }

      start_download_content(data);
    }
  };

  xhttp.onerror = function () {
    document.querySelector("#download").innerHTML =
      "😴<br>the source file cannot be loaded";

    setTimeout(() => {
      document.getElementById("message-box").style.display = "none";
      show_settings();
    }, 2000);
  };

  xhttp.send();
};

///////////
///load source file from local file
//////////

/////////////////////////
let load_local_file = function () {
  let a = localStorage.getItem("source_local");

  if (
    localStorage.getItem("source_local") == "" ||
    localStorage.getItem("source_local") == null
  ) {
    document.getElementById("message-box").style.display = "none";
    show_settings();
    return false;
  }

  var finder = new Applait.Finder({
    type: "sdcard",
    debugMode: true,
  });

  finder.search(a);

  finder.on("searchBegin", function (needle) {
    alert(needle);
  });

  finder.on("empty", function (needle) {
    toaster("no sdcard found");
    document.getElementById("message-box").style.display = "none";
    show_settings();
    return;
  });

  finder.on("searchCancelled", function (message) {});

  finder.on("searchComplete", function (needle, filematchcount) {
    if (filematchcount == 0) {
      document.querySelector("#download").innerHTML =
        "😴<br>No source file founded,<br> please create a json file or set a url in the settings.";
      setTimeout(() => {
        document.getElementById("message-box").style.display = "none";
        show_settings();
      }, 3000);
    }
  });

  finder.on("error", function (message, err) {});

  finder.on("fileFound", function (file, fileinfo, storageName) {
    var reader = new FileReader();
    reader.onerror = function (event) {
      toaster("shit happens");
      reader.abort();
    };

    reader.onloadend = function (event) {
      let data;
      //check if json valid
      try {
        data = JSON.parse(event.target.result);
      } catch (e) {
        document.querySelector("#download").innerHTML =
          "😴<br>Your json file is not valid";
        setTimeout(() => {
          document.getElementById("message-box").style.display = "none";
          show_settings;
        }, 3000);
        return false;
      }

      start_download_content(data);
    };
    reader.readAsText(file);
  });
};

///////////
///load source opml file from local source
//////////

let load_local_file_opml = function () {
  let a = localStorage.getItem("source_local");

  if (
    localStorage.getItem("source_local") == "" ||
    localStorage.getItem("source_local") == null
  ) {
    document.getElementById("message-box").style.display = "none";
    show_settings();
    return false;
  }

  var finder = new Applait.Finder({
    type: "sdcard",
    debugMode: true,
  });

  finder.search(a);

  finder.on("searchBegin", function (needle) {
    alert(needle);
  });

  finder.on("empty", function (needle) {
    toaster("no sdcard found");
    document.getElementById("message-box").style.display = "none";
    show_settings();
    return;
  });

  finder.on("searchCancelled", function (message) {});

  finder.on("searchComplete", function (needle, filematchcount) {
    if (filematchcount == 0) {
      document.querySelector("#download").innerHTML =
        "😴<br>No source file founded,<br> please create a json file or set a url in the settings.";
      setTimeout(() => {
        document.getElementById("message-box").style.display = "none";
        show_settings();
      }, 3000);
    }
  });

  finder.on("error", function (message, err) {});

  finder.on("fileFound", function (file, fileinfo, storageName) {
    var reader = new FileReader();
    reader.onerror = function (event) {
      toaster("shit happens");
      reader.abort();
    };

    reader.onloadend = function (event) {
      let data = event.target.result;

      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(data, "text/xml");
      let content = xmlDoc.getElementsByTagName("body")[0];

      let m = content.querySelectorAll("outline");
      for (var i = 0; i < m.length; i++) {
        var nested = m[i].querySelectorAll("outline");

        if (nested.length > 0) {
          for (var z = 0; z < nested.length; z++) {
            console.log(m[i].getAttribute("text"));

            source_array.push([
              nested[z].getAttribute("xmlUrl"),
              epsiodes_download,
              m[i].getAttribute("text"),
              m[i].getAttribute("text"),
            ]);
          }
        }
      }

      rss_fetcher(
        source_array[0][0],
        source_array[0][1],
        source_array[0][2],
        source_array[0][3]
      );
    };
    reader.readAsText(file);
  });
};

///////////
///load source opml file from online source
//////////
let load_source_opml = function () {
  let source_url = localStorage.getItem("source") + "?q=123";
  let xhttp = new XMLHttpRequest({
    mozSystem: true,
  });

  xhttp.open("GET", source_url + "?test=1&time=12345", true);
  xhttp.timeout = 5000;
  xhttp.onload = function () {
    if (xhttp.readyState === xhttp.DONE && xhttp.status === 200) {
      let data = xhttp.response;

      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(data, "text/xml");
      let content = xmlDoc.getElementsByTagName("body")[0];

      let m = content.querySelectorAll("outline");
      for (var i = 0; i < m.length; i++) {
        var nested = m[i].querySelectorAll("outline");

        if (nested.length > 0) {
          for (var z = 0; z < nested.length; z++) {
            source_array.push([
              nested[z].getAttribute("xmlUrl"),
              epsiodes_download,
              m[i].getAttribute("text"),
              m[i].getAttribute("text"),
            ]);
          }
        }
      }

      console.log(JSON.stringify(source_array));
    }

    rss_fetcher(
      source_array[0][0],
      source_array[0][1],
      source_array[0][2],
      source_array[0][3]
    );
  };

  xhttp.onerror = function () {
    document.querySelector("#download").innerHTML =
      "😴<br>the source file cannot be loaded";

    setTimeout(() => {
      document.getElementById("message-box").style.display = "none";
      show_settings();
    }, 2000);
  };

  xhttp.send();
};

//when open single xml from browser

if (navigator.mozSetMessageHandler) {
  navigator.mozSetMessageHandler("activity", function (activityRequest) {
    var option = activityRequest.source;
    activity = true;

    if (option.name == "view") {
      while (source_array.length > 0) {
        source_array.pop();
      }
      source_array.push([option.data.url, 4, "", "all"]);
      rss_fetcher(
        source_array[0][0],
        source_array[0][1],
        source_array[0][2],
        source_array[0][3]
      );
    }
  });
}

let start_download_content = function (source_data) {
  for (let i = 0; i < source_data.length; i++) {
    if (!source_data[i].category || source_data[i].category == "") {
      source_data[i].category = 0;
    }
    source_array.push([
      source_data[i].url,
      source_data[i].limit,
      source_data[i].channel,
      source_data[i].category,
    ]);
  }

  //check if internet connection
  if (navigator.onLine) {
    //start download loop
    rss_fetcher(
      source_array[0][0],
      source_array[0][1],
      source_array[0][2],
      source_array[0][3]
    );
  } else {
    document.querySelector("#download").innerHTML =
      "😴<br>Your device is offline, please connect it to the internet ";
  }
};

function formatFileSize(bytes, decimalPoint) {
  if (bytes || bytes > 0 || bytes != undefined || bytes != NaN) {
    var k = 1000,
      dm = decimalPoint || 2,
      sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
}

//////////////////////////////
//download content////
//////////////////////////////

let rss_fetcher = function (
  param_url,
  param_limit,
  param_channel,
  param_category
) {
  var xhttp = new XMLHttpRequest({
    mozSystem: true,
  });

  xhttp.open("GET", param_url, true);
  xhttp.timeout = 2000;
  xhttp.responseType = "document";
  xhttp.overrideMimeType("text/xml");

  xhttp.send(null);

  document.getElementById("message-box").style.display = "block";

  xhttp.addEventListener("error", transferFailed);
  xhttp.addEventListener("loadend", loadEnd);

  function transferFailed() {
    toaster("failed" + param_channel, 1000);
  }

  xhttp.onload = function () {
    if (xhttp.readyState === xhttp.DONE && xhttp.status === 200) {
      //youtube
      item_image = "";
      item_id = "";
      item_summary = "";
      item_link = "";
      item_summary = "";
      item_title = "";
      item_type = "";
      item_media = "rss";
      item_duration = "";
      item_filesize = "";
      listened_track = "false";
      play_track = "false";
      item_cid = "";

      let data = xhttp.response;

      //ATOM
      rss_title = data.querySelector("title").textContent;
      if (data.querySelector("image")) {
        item_image = data.querySelector("image").getElementsByTagName("url")[0]
          .textContent;
      }
      let count = k + " / " + (source_array.length - 1);

      document.getElementById("download").innerText = rss_title;
      bottom_bar("", count, "");

      el = data.querySelectorAll("entry");

      if (el.length > 0) {
        for (let i = 0; i < el.length; i++) {
          if (i < param_limit) {
            item_title = el[i].querySelector("title").innerHTML;
            item_cid = hashCode(item_title);

            var elem = el[i].querySelector("summary");
            if (elem) {
              item_summary = el[i].querySelector("summary").textContent;
              item_summary = item_summary.replace(/(<!\[CDATA\[)/g, "");
              item_summary = item_summary.replace(/(]]>)/g, "");
              item_summary = item_summary.replace(/(&lt;!\[CDATA\[)/g, "");
              item_summary = item_summary.replace(/(]]&gt;)/g, "");
            }

            elem = el[i].querySelector("content");

            if (elem) {
              item_summary = el[i].querySelector("content").textContent;
              item_summary = item_summary.replace(/(<!\[CDATA\[)/g, "");
              item_summary = item_summary.replace(/(]]>)/g, "");
              item_summary = item_summary.replace(/(&lt;!\[CDATA\[)/g, "");
              item_summary = item_summary.replace(/(]]&gt;)/g, "");
            }

            var elem = el[i].querySelector("description");
            if (elem) {
              item_summary = el[i].querySelector("description").textContent;
              item_summary = item_summary.replace(/(<!\[CDATA\[)/g, "");
              item_summary = item_summary.replace(/(]]>)/g, "");
              item_summary = item_summary.replace(/(&lt;!\[CDATA\[)/g, "");
              item_summary = item_summary.replace(/(]]&gt;)/g, "");
            }

            if (el[i].getElementsByTagNameNS("*", "thumbnail").length > 0) {
              item_image = el[i]
                .getElementsByTagNameNS("*", "thumbnail")
                .item(0)
                .getAttribute("url");
            }

            /*
            if (el[i].getElementsByTagNameNS("*", "videoId").length > 0) {
              console.log("yeah")
            }


            if (el[i].getElementsByTagName("id").length > 0) {
              console.log("yeah")
            }
            */

            if (el[i].querySelector("link") !== null) {
              item_link = el[i].querySelector("link").getAttribute("href");
            }

            if (
              el[i].querySelector("enclosure") != null ||
              el[i].querySelector("enclosure") != undefined
            ) {
              if (el[i].querySelector("enclosure").getAttribute("url"))
                item_download = el[i]
                  .querySelector("enclosure")
                  .getAttribute("url");
              if (el[i].querySelector("enclosure").getAttribute("type"))
                item_type = el[i]
                  .querySelector("enclosure")
                  .getAttribute("type");

              if (
                item_type == "audio/mpeg" ||
                item_type == "audio/aac" ||
                item_type == "audio/x-mpeg" ||
                item_type == "audio/mp3" ||
                item_type == "audio/x-m4a"
              ) {
                item_media = "podcast";
              }

              if (el[i].querySelector("enclosure").getAttribute("length") > 0) {
                let en_length = el[i]
                  .querySelector("enclosure")
                  .getAttribute("length");
                item_filesize = formatFileSize(en_length, 2);
              }
            }
            if (item_media == "podcast") {
              if (el[i].getElementsByTagNameNS("*", "duration").length > 0) {
                var duration = el[i]
                  .getElementsByTagNameNS("*", "duration")
                  .item(0).textContent;
                item_duration = moment(duration, "hh:mm:ss").format("HH:mm:ss");
                if (item_duration == "Invalid date") item_duration = "";
              }
            }

            //check valid date
            if (el[i].querySelector("updated").innerHTML == "") {
              item_date_unix = new Date().valueOf();
            } else {
              item_date_unix = Date.parse(
                el[i].querySelector("updated").innerHTML
              );
            }
            item_date = new Date(item_date_unix);
            item_date = item_date.toDateString();

            if (
              item_link !== null &&
              item_link.includes("https://www.youtube.com") === true
            ) {
              item_media = "youtube";
            } else {
              item_media = "rss";
            }

            item_read = "not-read";

            content_arr.push({
              title: item_title,
              summary: item_summary,
              link: item_link,
              date: item_date,
              dateunix: item_date_unix,
              channel: param_channel,
              category: param_category,
              download: item_download,
              type: item_type,
              image: item_image,
              id: item_id,
              duration: item_duration,
              media: item_media,
              filesize: item_filesize,
              cid: item_cid,
              listened: listened_track,
              recently_played: null,
              recently_order: null,
              read: item_read,
            });
          }
        }
      }

      ////////////
      //RSS
      ///////////

      el = data.querySelectorAll("item");
      if (el.length > 0) {
        for (let i = 0; i < el.length; i++) {
          if (i < param_limit) {
            if (el[i].querySelector("title")) {
              item_title = el[i].querySelector("title").innerHTML;
              item_title = item_title.replace("<![CDATA[", "");
              item_title = item_title.replace("]]>", "");
            }
            item_cid = hashCode(item_title);
            if (el[i].querySelector("description")) {
              item_summary = el[i].querySelector("description").textContent;
              item_summary = item_summary.replace(/(<!\[CDATA\[)/g, "");
              item_summary = item_summary.replace(/(]]>)/g, "");
              item_summary = item_summary.replace(/(&lt;!\[CDATA\[)/g, "");
              item_summary = item_summary.replace(/(]]&gt;)/g, "");
            }

            if (el[i].querySelector("link")) {
              item_link = el[i].querySelector("link").textContent;
              item_download = el[i].querySelector("link");
            }

            //check valid date
            if (el[i].querySelector("pubDate") != null) {
              if (el[i].querySelector("pubDate").innerHTML == "") {
                item_date_unix = new Date().valueOf();
              } else {
                item_date_unix = Date.parse(
                  el[i].querySelector("pubDate").innerHTML
                );
              }

              item_date = new Date(item_date_unix);
              item_date = item_date.toDateString();
            }

            if (
              el[i].querySelector("enclosure") != null ||
              el[i].querySelector("enclosure") != undefined
            ) {
              if (el[i].querySelector("enclosure").getAttribute("url"))
                item_download = el[i]
                  .querySelector("enclosure")
                  .getAttribute("url");
              if (el[i].querySelector("enclosure").getAttribute("type"))
                item_type = el[i]
                  .querySelector("enclosure")
                  .getAttribute("type");

              if (
                item_type == "audio/mpeg" ||
                item_type == "audio/aac" ||
                item_type == "audio/x-mpeg" ||
                item_type == "audio/mp3" ||
                item_type == "audio/x-m4a"
              ) {
                item_media = "podcast";
              }

              if (el[i].querySelector("enclosure").getAttribute("length") > 0) {
                let en_length = el[i]
                  .querySelector("enclosure")
                  .getAttribute("length");
                item_filesize = formatFileSize(en_length, 2);
              }
            }
            if (item_media == "podcast") {
              if (el[i].getElementsByTagNameNS("*", "duration").length > 0) {
                var duration = el[i]
                  .getElementsByTagNameNS("*", "duration")
                  .item(0).textContent;
                item_duration = moment(duration, "hh:mm:ss").format("HH:mm:ss");
                if (item_duration == "Invalid date") item_duration = "";
              }
            }

            item_read = "not-read";

            content_arr.push({
              title: item_title,
              summary: item_summary,
              link: item_link,
              date: item_date,
              dateunix: item_date_unix,
              channel: param_channel,
              category: param_category,
              download: item_download,
              type: item_type,
              image: item_image,
              id: item_id,
              duration: item_duration,
              media: item_media,
              filesize: item_filesize,
              cid: item_cid,
              listened: listened_track,
              recently_played: null,
              recently_order: null,
              read: item_read,
            });
          }
        }
      }
    }

    if (xhttp.status === 404) {
      console.log(param_channel + " url not found", 3000);
    }

    if (xhttp.status === 408) {
      console.log(param_channel + "Time out", 3000);
    }

    if (xhttp.status === 409) {
      console.log(param_channel + "Conflict", 3000);
    }

    ////Redirection
    if (xhttp.status === 301) {
      console.log(param_channel + " redirection", 3000);
      rss_fetcher(
        xhttp.getResponseHeader("Location"),
        param_limit,
        param_channel
      );
    }

    xhttp.ontimeout = function (e) {
      console.log(param_channel + "Time out", 3000);
    };

    if (xhttp.status === 0) {
      console.log(
        param_channel +
          " status: " +
          xhttp.status +
          xhttp.getAllResponseHeaders(),
        3000
      );
    }
  };

  function loadEnd(e) {
    if (activity === true) {
      document.querySelector("#download").innerHTML =
        "The content is <br>not a valid rss feed <div style='font-size:2rem;margin:8px 0 0 0;color:white!Important;'>¯&#92;_(ツ)_/¯</div><br><br>The app will be closed in 4sec";

      setTimeout(() => {
        window.close();
      }, 4000);
      return false;
    }

    //after download build html objects
    if (k == source_array.length - 1) {
      setTimeout(() => {
        build();
        cache.saveCache(content_arr);
      }, 1500);
    }
    if (k < source_array.length - 1) {
      k++;
      rss_fetcher(
        source_array[k][0],
        source_array[k][1],
        source_array[k][2],
        source_array[k][3]
      );
    }
  }
};

//sort content by date
//build
//write html

let read_articles = function () {
  //if element in read list
  //mark article as read
  content_arr.forEach(function (index) {
    all_cid.push(index.cid);
    index.read = "not-read";
    if (read_elem.length > 0) {
      read_elem.forEach(function (iindex) {
        if (iindex == index.cid) {
          index.read = "read";
        }
      });
    }
  });
};

//end to listen
let listened_articles = function () {
  content_arr.forEach(function (index) {
    index.listened = "false";

    if (listened_elem.length > 0) {
      for (t = 0; t < listened_elem.length; t++) {
        if (listened_elem[t] == index.cid) {
          index.listened = "true";
        }
      }
    }
  });
};

//started to listen
let listened_podcast_articles = function () {
  content_arr.forEach(function (index) {
    index.recently_played = "";
    index.recently_order = "";
    //let t = 0;
    if (recently_played.length > 0) {
      for (let t = 0; t < recently_played.length; t++) {
        if (recently_played[t] == index.cid) {
          index.recently_played = "recently-played";
          index.recently_order = t;
          console.log(t);
        }
      }
    }
  });
};

//clear local storage

let clean_localstorage = function () {
  for (let i = 0; i < read_elem.length; i++) {
    if (all_cid.indexOf(read_elem[i]) == -1) {
      read_elem.slice(i, 1);
    }
  }
  localStorage.setItem("read", JSON.stringify(read_elem));
  //recently played
  for (let i = 0; i < recently_played.length; i++) {
    if (all_cid.indexOf(recently_played[i]) == -1) {
      recently_played.slice(i, 1);
    }
  }
  localStorage.setItem("read", JSON.stringify(recently_played));
};

//render html

function renderHello(arr) {
  var template = document.getElementById("template").innerHTML;
  var rendered = Mustache.render(template, {
    data: arr,
  });
  document.getElementById("news-feed-list").innerHTML = rendered;
}
let heroArray = [];

let filter_data = function (cat) {
  heroArray.length = 0;
  for (let i = 0; i < content_arr.length; i++) {
    if (content_arr[i].category == cat) {
      heroArray.push(content_arr[i]);
    }
  }
};

let sort_array = function (arr) {
  arr.sort((a, b) => {
    return b.dateunix - a.dateunix;
  });
};

let tabs = function () {
  for (let i = 0; i < content_arr.length; i++) {
    //set panel category
    if (
      panels.includes(content_arr[i].category) === false &&
      content_arr[i].category != 0
    ) {
      panels.push(content_arr[i].category);
    }
  }
};

function build() {
  lock.unlock();
  sort_array(content_arr);
  read_articles();
  listened_articles();
  tabs();
  clean_localstorage();
  bottom_bar("settings", "select", "options");
  top_bar("", panels[0], "");

  if (activity == true) bottom_bar("add", "select", "");

  panels.push("recently-played");

  renderHello(content_arr);

  lazyload.ll();
  document.getElementById("message-box").style.display = "none";
  window_status = "article-list";
  set_tabindex();
}

let set_tabindex = function () {
  let divs = document.querySelectorAll("article");

  let t = -1;
  for (let i = 0; i < divs.length; i++) {
    divs[i].removeAttribute("tabindex");

    t++;
    divs[i].tabIndex = t;
  }

  document.querySelector('article[tabIndex="0"]').focus();
  tab_index = 0;

  article_array = document.querySelectorAll("article");
  article_array[0].focus();
};

let mark_as_read = function (un_read) {
  if (un_read == true) {
    document.activeElement.setAttribute("data-read", "read");
    read_elem.push(document.activeElement.getAttribute("data-id"));
    localStorage.setItem("read", JSON.stringify(read_elem));
  }

  if (un_read == false) {
    let kk = document
      .querySelector("[data-id ='" + current_article + "']")
      .getAttribute("data-id");

    let test = [];
    for (var i = 0; i < read_elem.length; i++) {
      if (read_elem[i] != kk) test.push(read_elem[i]);
    }
    localStorage.setItem("read", JSON.stringify(test));
    document.activeElement.setAttribute("data-read", "not-read");

    toaster("article marked as not read", 2000);
  }
};

////////////////////////
//NAVIGATION
/////////////////////////

function nav_panels(left_right) {
  if (left_right == "left") {
    current_panel--;
  }

  if (left_right == "right") {
    current_panel++;
  }

  current_panel = current_panel % panels.length;
  if (current_panel < 0) {
    current_panel += panels.length;
  }

  top_bar("", panels[current_panel], "");
  if (sleepmode)
    top_bar(
      "<img src='/assets/fonts/icons/timer.svg'>",
      panels[current_panel],
      ""
    );

  setTimeout(() => {
    article_array = document.querySelectorAll("article");
    article_array[0].focus();
  }, 500);

  //filter data
  if (panels[current_panel] == "recently-played") {
    //to do
    heroArray.length = 0;
    listened_podcast_articles();

    for (let i = 0; i < content_arr.length; i++) {
      if (content_arr[i].recently_played == "recently-played") {
        heroArray.push(content_arr[i]);
      }
    }

    heroArray.sort((a, b) => {
      return a.recently_order - b.recently_order;
    });

    renderHello(heroArray);
  }

  if (panels[current_panel] == "all") {
    renderHello(content_arr);
  }

  if (
    panels[current_panel] != "all" &&
    panels[current_panel] != "recently-played"
  ) {
    filter_data(panels[current_panel]);
    sort_array(heroArray);

    renderHello(heroArray);
  }

  set_tabindex();

  document.activeElement.scrollIntoView({
    behavior: "smooth",
    block: "end",
    inline: "nearest",
  });

  document.activeElement.classList.remove("overscrolling");
}

////////////
//TABINDEX NAVIGATION
///////////
function nav(move) {
  let elem = document.activeElement;
  // Setup siblings array and get the first sibling
  var siblings = [];
  var sibling = elem.parentNode.firstChild;

  // Loop through each sibling and push to the array
  while (sibling) {
    if (
      sibling.tabIndex != null &&
      sibling.tabIndex != undefined &&
      sibling.tabIndex >= 0
    ) {
      siblings.push(sibling);
    }
    sibling = sibling.nextSibling;
  }

  setTimeout(() => {
    document.activeElement.classList.remove("overscrolling");
  }, 400);

  if (move == "+1") {
    document.activeElement.classList.remove("overscrolling");

    tab_index++;
    if (tab_index == siblings.length || tab_index >= siblings.length) {
      document.activeElement.classList.add("overscrolling");
      tab_index = siblings.length - 1;
      return true;
    }

    siblings[tab_index].focus();

    document.activeElement.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }

  if (move == "-1" && tab_index == 1) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (move == "-1" && tab_index > 0) {
    document.activeElement.classList.remove("overscrolling");

    tab_index--;
    siblings[tab_index].focus();
    siblings[tab_index].scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    return true;
  }
  //overscrolling
  if (move == "-1" && tab_index == 0) {
    document.activeElement.classList.add("overscrolling");
  }
}

let save_settings = function () {
  var setting_interval = document.getElementById("time").value;
  var setting_source = document.getElementById("source").value;
  var setting_source_local = document.getElementById("source-local").value;
  var setting_sleeptime = document.getElementById("sleep-mode").value;
  var setting_episodes_download = document.getElementById("episodes-download")
    .value;

  if (setting_source == "" && setting_source_local == "") {
    toaster("please fill in the location of the source file", 3000);
    return false;
  }

  if (setting_source != "") {
    if (!validate(setting_source)) {
      alert("url not valid");
      return false;
    }
  }

  localStorage.setItem("interval", setting_interval);
  localStorage.setItem("source", setting_source);
  localStorage.setItem("source_local", setting_source_local);
  localStorage.setItem("sleep_time", setting_sleeptime);
  localStorage.setItem("episodes_download", setting_episodes_download);

  toaster(
    "saved, the settings will be active the next time the app is started.",
    5000
  );

  return true;
};

let show_article = function () {
  document.querySelector("div#source-page").style.display = "none";

  window_status = "single-article";
  navigator.spatialNavigationEnabled = false;

  document.querySelector("div#news-feed").style.background = "silver";
  link_target = document.activeElement.getAttribute("data-download");
  link_type = document.activeElement.getAttribute("data-audio-type");

  let elem = document.querySelectorAll("article");
  for (let i = 0; i < elem.length; i++) {
    elem[i].style.display = "none";
  }

  elem = document.querySelectorAll("div.summary");
  for (let i = 0; i < elem.length; i++) {
    elem[i].style.display = "block";
  }

  document.activeElement.style.fontStyle = "normal";
  document.activeElement.style.color = "black";

  document.activeElement.style.display = "block";
  document.getElementById("top-bar").style.display = "none";
  document.getElementById("settings").style.display = "none";

  if (document.activeElement.getAttribute("data-media") == "podcast") {
    if (document.activeElement.classList.contains("audio-playing")) {
      bottom_bar("pause", "", "options");
    } else {
      bottom_bar("play", "", "options");
    }
  }

  if (document.activeElement.getAttribute("data-media") == "rss") {
    bottom_bar("visit", "", "options");
  }

  if (document.activeElement.getAttribute("data-media") == "youtube") {
    bottom_bar("open", "", "options");
  }

  document.activeElement.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  current_article = document.activeElement.getAttribute("data-id");
  mark_as_read(true);
};

/////////////////
//show article list
//////////////////
let show_article_list = function () {
  bottom_bar("settings", "select", "options");
  top_bar("", panels[current_panel], "");

  document.getElementById("audio-player").style.display = "none";
  document.querySelector("div#news-feed").style.background = "white";
  navigator.spatialNavigationEnabled = false;
  document
    .querySelector("div#source-page div#iframe-wrapper")
    .classList.remove("video-view");
  document.getElementById("top-bar").style.display = "block";

  let elem = document.querySelectorAll("article");
  for (let i = 0; i < elem.length; i++) {
    elem[i].style.display = "block";

    let rd = elem[i].getAttribute("data-read");

    if (rd == "read") {
      document.activeElement.style.fontStyle = "italic";
      document.activeElement.style.color = "gray";
    }
  }

  elem = document.querySelectorAll("div.summary");
  for (let i = 0; i < elem.length; i++) {
    elem[i].style.display = "none";
  }

  document.querySelector("div#settings").style.display = "none";
  article_array[tab_index];
  document.querySelector("div#source-page").style.display = "none";
  document.querySelector("div#source-page iframe").setAttribute("src", "");
  bottom_bar("settings", "select", "options");

  if (sleepmode) {
    top_bar(
      "<img class='sleepmode' src='/assets/fonts/icons/timer.svg'>",
      panels[current_panel],
      ""
    );
  }

  if (!activity) {
    bottom_bar("settings", "select", "options");
  } else {
    bottom_bar("add", "select", "");
  }

  window_status = "article-list";
  document.activeElement.focus();
  document.activeElement.scrollIntoView({
    behavior: "smooth",
    block: "end",
    inline: "nearest",
  });

  tab_index = document.activeElement.getAttribute("tabIndex");
};

let show_settings = function () {
  bottom_bar("save", "", "back");

  current_article = document.activeElement.getAttribute("data-id");
  console.log(current_article);
  window_status = "settings";
  tab_index = 0;
  document.getElementById("top-bar").style.display = "none";

  let elem = document.querySelectorAll("article");
  for (let i = 0; i < elem.length; i++) {
    elem[i].style.display = "none";
  }
  document.getElementById("settings").style.display = "block";

  document.getElementById("time").focus();
  if (localStorage.getItem("interval") != null) {
    document.getElementById("time").value = localStorage.getItem("interval");
  }

  if (localStorage.getItem("source") != null) {
    document.getElementById("source").value = localStorage.getItem("source");
  }

  if (localStorage.getItem("source_local") != null) {
    document.getElementById("source-local").value = localStorage.getItem(
      "source_local"
    );
  }

  if (localStorage.getItem("sleep_time") != null) {
    document.getElementById("sleep-mode").value = localStorage.getItem(
      "sleep_time"
    );
  }

  if (localStorage.getItem("episodes_download") != null) {
    document.getElementById("episodes-download").value = localStorage.getItem(
      "episodes_download"
    );
  }
};

function open_url() {
  let link_target = document.activeElement.getAttribute("data-link");
  let link_download = document.activeElement.getAttribute("data-download");

  let title = document.activeElement.querySelector("h1.title").textContent;
  title = title.replace(/\s/g, "-");
  bottom_bar("", "", "");

  document.querySelector("div#source-page").style.display = "block";
  document.querySelector("div#source-page div#iframe-wrapper").style.height =
    "100vh";

  if (document.activeElement.getAttribute("data-media") == "rss") {
    show_article_list();
    window.open(link_target);
    return;
  }

  if (document.activeElement.getAttribute("data-media") == "youtube") {
    yt_player.onYouTubeIframeAPIReady("M7lc1UVf-VE");
    console.log("youtube");
    document
      .querySelector("div#source-page iframe")
      .setAttribute("src", link_target);
    document
      .querySelector("div#source-page div#iframe-wrapper")
      .classList.add("video-view");
    navigator.spatialNavigationEnabled = true;
    window_status = "source-page";
    player.src = "";
    return;
  }

  /*
        if (document.activeElement.getAttribute("data-media") == "podcast") {
            var finder = new Applait.Finder({
                type: "music",
                debugMode: false
            });

            finder.on("empty", function(needle) {
                toaster("no sdcard found");
                return;
            });

            finder.search(title);

            finder.on("fileFound", function(file, fileinfo, storageName) {

                toaster("The file is already available", 3000);
                return false;
            });

            finder.on("searchComplete", function(needle, filematchcount) {
                if (filematchcount == 0) {
                    download.downloadFile(link_download, title);
                }
            });

            return;
        }

    */
}

let open_options = function () {
  current_article = document.activeElement.getAttribute("data-id");
  window_status = "options";
  document.getElementById("options").style.display = "block";
  document.querySelectorAll("div#options ul li")[0].focus();
};

let start_options = function () {
  if (document.activeElement.getAttribute("data-function") == "unread") {
    mark_as_read(false);
  }
  if (document.activeElement.getAttribute("data-function") == "sleepmode") {
    sleep_mode();
  }

  if (document.activeElement.getAttribute("data-function") == "share") {
    var k = document
      .querySelector("[data-id='" + current_article + "']")
      .getAttribute("data-link");
    share(k);
  }

  if (document.activeElement.getAttribute("data-function") == "audio-player") {
    open_player();
  }

  if (document.activeElement.getAttribute("data-function") == "volume") {
    navigator.volumeManager.requestShow();
    volume_status = true;
    navigator.spatialNavigationEnabled = false;
  }
};

let sleep_mode = function () {
  let st = localStorage.getItem("sleep_time");
  st = st * 60 * 1000;

  sleepmode = true;

  toaster("sleepmode activ", 3000);
  setTimeout(() => {
    audio_player.pause();
    sleepmode = false;
  }, st);
};

let open_player = function () {
  document.getElementById("audio-player").style.display = "block";
  window_status = "audio-player";
  document.getElementById("options").style.display = "none";
  document.getElementById("image").style.backgroundImage =
    "url(" + document.activeElement.getAttribute("data-image") + ")";

  top_bar("", "", "");

  let container_block = document.getElementById("background-pattern");

  for (let i = 0; i < 115; i++) {
    var block_to_insert = document.createElement("div");
    block_to_insert.style.width = "40px";
    block_to_insert.style.height = "40px";
    block_to_insert.style.backgroundColor =
      "#" + intToRGB(content_arr[getRandomInteger(0, content_arr.length)].cid);
    container_block.appendChild(block_to_insert);
  }
};

//qr scan listener
const qr_listener = document.querySelector("input#source");
let qrscan = false;
qr_listener.addEventListener("focus", (event) => {
  bottom_bar("save", "qr", "back");
  qrscan = true;
});

qr_listener.addEventListener("blur", (event) => {
  bottom_bar("save", "", "back");
  qrscan = false;
});
//////////////////////////
////KEYPAD TRIGGER////////////
/////////////////////////

function handleKeyDown(evt) {
  switch (evt.key) {
    case "Enter":
      if (window_status == "article-list") {
        show_article();
        break;
      }

      if (window_status == "options") {
        start_options();
        break;
      }

      if (window_status == "settings" && qrscan == true) {
        window_status = "scan";

        qr.start_scan(function (callback) {
          let slug = callback;
          document.getElementById("source").value = slug;
        });

        break;
      }

      break;

    case "ArrowLeft":
      if (window_status == "article-list") {
        nav_panels("left");
        break;
      }

      if (window_status == "audio-player") {
        audio_player.seeking("backward");
        break;
      }
      break;

    case "ArrowRight":
      if (window_status == "article-list") {
        nav_panels("right");
        break;
      }

      if (window_status == "audio-player") {
        audio_player.seeking("forward");
        break;
      }
      break;

    case "ArrowDown":
      if (window_status == "settings") {
        nav("+1");
        break;
      }

      if (window_status == "article-list") {
        nav("+1");
        break;
      }

      if (window_status == "options") {
        nav("+1");
        break;
      }

      if (volume_status === true) {
        audio_player.volume_control("down");
        break;
      }

      break;

    case "ArrowUp":
      if (window_status == "settings") {
        nav("-1");
        break;
      }

      if (window_status == "options") {
        nav("-1");

        break;
      }

      if (window_status == "article-list") {
        nav("-1");
        break;
      }

      if (volume_status === true) {
        audio_player.volume_control("up");
        break;
      }
      break;

    case "#":
      navigator.volumeManager.requestShow();
      volume_status = true;
      navigator.spatialNavigationEnabled = false;
      break;

    case "SoftLeft":
      if (window_status == "article-list") {
        if (!activity) {
          show_settings();
        } else {
          toaster(source_array[0][0], 3000);
          add_source(source_array[0][0], 5, "all", rss_title);
        }
        break;
      }

      if (
        window_status == "single-article" &&
        document.activeElement.getAttribute("data-media") == "podcast"
      ) {
        open_player();
        audio_player.play_podcast();
        break;
      }

      if (window_status == "single-article") {
        open_url();
        break;
      }

      if (window_status == "settings") {
        save_settings();
        break;
      }

      if (window_status == "audio-player") {
        audio_player.play_podcast();
        break;
      }

      break;

    case "SoftRight":
      if (window_status == "single-article") {
        open_options();
        break;
      }
      if (window_status == "settings") {
        show_article_list();

        setTimeout(() => {
          article_array = document.querySelectorAll("article");
          article_array[0].focus();
        }, 1000);
        break;
      }

      if (window_status == "article-list") {
        open_options();

        break;
      }
      break;

    case "Backspace":
      evt.preventDefault();

      if (window_status == "intro") {
        bottom_bar("", "", "");
        window.close();
        break;
      }

      if (window_status == "article-list") {
        bottom_bar("", "", "");
        goodbye();
        break;
      }

      if (window_status == "settings") {
        //show_article_list();
        break;
      }

      if (window_status == "single-article") {
        show_article_list();
        break;
      }

      if (window_status == "audio-player") {
        show_article_list();
        break;
      }

      if (window_status == "source-page") {
        show_article_list();
        break;
      }

      if (window_status == "options") {
        document.getElementById("options").style.display = "none";
        show_article_list();
        document.querySelector("[data-id ='" + current_article + "']").focus();
        break;
      }

      if (window_status == "scan") {
        qr.stop_scan();
        break;
      }

      break;
  }
}

document.addEventListener("keydown", handleKeyDown);
