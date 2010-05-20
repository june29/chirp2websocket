$(document).ready(function() {
  function format(text) {
    return text.replace(/(http:\/\/[\x21-\x7e]+)/gi,'<a href="$1" target="_blank">$1</a>')
               .replace(/@([a-zA-Z0-9_]+)/gi,'<a href="http://twitter.com/$1" target="_blank">@$1</a>')
               .replace(/#([a-zA-Z0-9_]+)/gi,'<a href="http://search.twitter.com/search?q=%23$1" target="_blank">#$1</a>');
  }

  if(!("WebSocket" in window)) {
    alert("Sorry, the build of your browser does not support WebSockets. Please use latest Chrome or Webkit nightly");
    return;
  }

  var number = 10;
  var size   = 36;

  ws = new WebSocket("ws://localhost:8080/");
  ws.onmessage = function(evt) {
    $("#waiting").remove();

    var data = eval("(" + evt.data + ")");

    var user  = data.user;
    var event = data.event;

    if (user) {
      var id                = data.id;
      var text              = data.text;
      var screen_name       = user.screen_name;
      var profile_image_url = user.profile_image_url;
      var d                 = new Date(data.created_at);
      var time_string       = d.getFullYear() + "/" + d.getMonth() + "/" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

      var div = $("<div/>")
                .addClass("tweet")
                .append($("<p/>")
                        .append($("<img/>")
                                .addClass("icon")
                                .attr({ src: profile_image_url, alt: screen_name, width: size, height: size }))
                        .append($("<a/>")
                                .addClass("screen_name")
                                .attr({ href: "http://twitter.com/" + screen_name + "/status/" + id, target: "_blank" })
                                .text(screen_name)))
                .append($("<p/>")
                        .addClass("object")
                        .append(format(text)))
                .append($("<span/>")
                        .addClass("created_at")
                        .text(time_string));

      if ($('#tweets div.tweet').size() > number) {
        $('#tweets div.tweet:last').slideDown(100, function() {
          $(this).remove();
        });
      }

      $('#tweets').prepend(div);
      div.slideDown(140);
    }
    else if (event) {
      var source = data.source;
      var target = data.target;
      var object = data.target_object;

      var source_screen_name = source.screen_name;
      var target_screen_name = target.screen_name;

      var target_html;
      var object_html;

      switch (event) {
      case "favorite":
        object_html = $("<p/>")
                      .addClass("object")
                      .append(format(object.text));
        target_html = $("<p/>")
                      .addClass("target")
                      .append($("<img/>")
                              .attr({ src: event + ".png", alt: event }))
                      .append($("<a/>")
                              .addClass("screen_name")
                              .attr({ href: "http://twitter.com/" + target_screen_name + "/status/" + object.id, target: "_blank" })
                              .text(target_screen_name))
                      .append($("<img/>")
                              .addClass("icon")
                              .attr({ src: target.profile_image_url, alt: target_screen_name, width: size, height: size }));
        break;
      case "retweet":
        object_html = $("<p/>")
                      .addClass("object")
                      .append(format(object.text));
        target_html = $("<p/>")
                      .addClass("target")
                      .append($("<img/>")
                              .attr({ src: event + ".png", alt: event }))
                      .append($("<a/>")
                              .addClass("screen_name")
                              .attr({ href: "http://twitter.com/" + target_screen_name + "/status/" + object.id, target: "_blank" })
                              .text(target_screen_name))
                      .append($("<img/>")
                              .addClass("icon")
                              .attr({ src: target.profile_image_url, alt: target_screen_name, width: size, height: size }));
        break;
      case "follow":
        object_html = $("<p/>");
        target_html = $("<p/>")
                      .addClass("target")
                      .append($("<img/>")
                              .attr({ src: event + ".png", alt: event }))
                      .append($("<a/>")
                              .addClass("screen_name")
                              .attr({ href: "http://twitter.com/" + target_screen_name, target: "_blank" })
                              .text(target_screen_name))
                      .append($("<img/>")
                              .addClass("icon")
                              .attr({ src: target.profile_image_url, alt: target_screen_name, width: size, height: size }));
        break;
      default:
        break;
      }

      if (target_html) {
        var source_html = $("<p/>")
                          .addClass("source")
                          .append($("<img/>")
                                  .addClass("icon")
                                  .attr({ src: source.profile_image_url, alt: source_screen_name, width: size, height: size }))
                          .append($("<a/>")
                                  .addClass("screen_name")
                                  .attr({ href: "http://twitter.com/" + source_screen_name, target: "_blank" })
                                  .text(source_screen_name))
                          .append(event.replace(/e$/, "") + "ed:");

        var d           = new Date(data.created_at);
        var time_string = d.getFullYear() + "/" + d.getMonth() + "/" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

        var div = $("<div/>")
                  .addClass("event")
                  .addClass(event)
                  .append(source_html)
                  .append(object_html)
                  .append(target_html)
                  .append($("<span/>")
                          .addClass("created_at")
                          .text(time_string));

        if ($('#events div.event').size() > number) {
          $('#events div.event:last').slideDown(100, function() {
            $(this).remove();
          });
        }

        $('#events').prepend(div);
        div.slideDown(140);
      }
    }
  }

  ws.onclose = function() {
    alert("socket closed");
  };

  ws.onopen = function() {
    //alert("connected...");
  }
});
