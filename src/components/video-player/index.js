import $ from 'jquery';
import EventEmitter from 'eventemitter3';

// function inViewport($el) {
//   var elH = $el.outerHeight(),
//     H   = $(window).height(),
//     r   = $el[0].getBoundingClientRect(), t=r.top, b=r.bottom;
//   return Math.max(0, t>0? Math.min(elH, H-t) : Math.min(b, H));
// }

const selectors = {
  container: '[name=videoContainer]',
  video: '[name=video]',
  play: '[name=playVideo]'
};

export class Players extends EventEmitter {
  constructor() {
    super();
    this.ready = false;
    this.playersLoaded = 0;
  }

  init(root) {
    this.root = root;
    this.containers = $(this.root).find(selectors.container);
    this.videos = this.containers.find(selectors.video);
    this.waitForPlayersReady();
    this.initPlayButtons();
  }

  testIfPlayersAreReady() {
    if (this.playersLoaded = this.videos.length) {
      this.ready = true;
      this.emit('ready');
    }
  }

  waitForPlayersReady() {
    this.videos.each((i, v) => {
      if (v.readyState > 0) {
        this.playersLoaded++;
      } else {
        v.addEventListener('loadedmetadata', (event) => {
          this.playersLoaded++;
          this.testIfPlayersAreReady();
        });
      }
    });

    // If all of the players were already loaded, fire the ready event.
    this.testIfPlayersAreReady();
  }

  initPlayButtons() {
    this.containers.on('click', (event) => {
      const video = event.currentTarget.querySelector(selectors.video);
      if (video.paused) {
        this.play(video);
      } else {
        this.pause(video);
      }
    });
  }

  // TODO This logic could be moved elsewhere to be project specific
  // and could then call play/pause.
  focus(bottom) {
    let found = false;
    for (let i = 0; i < this.videos.length; i++) {
      let video = this.videos[i];
      let bounds = video.getBoundingClientRect();
      let videoBottom = bounds.top + bounds.height;
      if (bounds.top < 0) {
        this.playerHidden(video, i);
      } else if (videoBottom < bottom && !found) {
        this.playerShown(video, i);
        found = true;
      } else if (video.classList.contains('visible')) {
        this.playerHidden(video, i);
      } else {
        return;
      }
    }
  }

  playerShown(video, index) {
    if (!video.__focused) {
      video.__focused = true;
      video.classList.add('visible');
      this.play(video);
    }
  }

  playerHidden(video, index) {
    if (video.__focused) {
      video.__focused = false;
      video.classList.remove('visible');
      this.pause(video);
    }
  }

  play(video) {
    if (video.paused) {
      video.play();
      $(video).closest(selectors.container).addClass('playing');
    }
  }

  pause(video) {
    if (!video.paused) {
      video.pause();
      $(video).closest(selectors.container).removeClass('playing');
    }
  }
}
