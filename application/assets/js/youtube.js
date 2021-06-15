var player;

const yt_player = ((_) => {
  let onYouTubeIframeAPIReady = function (id) {
    player = new YT.Player("youtube-player", {
      width: "562",
      videoId: id,
      playerVars: {
        autoplay: 0,
        controls: 0,
        rel: 0,
        fs: 0,
        showinfo: 0,
        modestbranding: 1,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
  };

  let play = function () {
    player.playVideo();
  };

  let seeking = function () {};

  let pause = function () {};

  return {
    onYouTubeIframeAPIReady,
    play,
    seeking,
    pause,
  };
})();
