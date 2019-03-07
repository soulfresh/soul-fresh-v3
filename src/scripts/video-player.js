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
    this.playersReady();
    this.initPlayButtons();
  }

  playersReady() {
    this.videos.each((i, v) => {
      v.addEventListener('loadedmetadata', () => {
        this.playersLoaded++;
        if (this.playersLoaded = this.videos.length) {
          this.ready = true;
          this.emit('ready');
        }
      });
    });
  }

  initPlayButtons() {
    let me = this;
    this.videos.on('click', function(event) {
      // this = video element
      if (this.paused) {
        me.play(this);
      } else {
        me.pause(this);
      }
    });
  }

  focus(bottom) {
    let found = false;
    for (let i = 0; i < this.videos.length; i++) {
      let video = this.videos[i];
      let bounds = video.getBoundingClientRect();
      let videoBottom = bounds.top + bounds.height;
      if (bounds.top < 0) {
        this.playerHidden(video);
      } else if (videoBottom < bottom && !found) {
        this.playerShown(video);
        found = true;
      } else if (video.classList.contains('visible')) {
        this.playerHidden(video);
      } else {
        return;
      }
    }
  }

  playerShown(video) {
    video.classList.add('visible');
    this.play(video);
  }

  playerHidden(video) {
    video.classList.remove('visible');
    this.pause(video);
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
