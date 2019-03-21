import $ from 'jquery';
import EventEmitter from 'eventemitter3';
import { selectors } from '../selectors';

// function inViewport($el) {
//   var elH = $el.outerHeight(),
//     H   = $(window).height(),
//     r   = $el[0].getBoundingClientRect(), t=r.top, b=r.bottom;
//   return Math.max(0, t>0? Math.min(elH, H-t) : Math.min(b, H));
// }

export class Players extends EventEmitter {
  constructor() {
    super();
    this.ready = false;
    this.playersLoaded = 0;
    this.paused = false;
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
        this.paused = false;
        this.play(video);
      } else {
        this.paused = true;
        this.pause(video);
      }
    });
  }

  muteAll() {
    this.videos.each((i, v) => v.muted = true);
  }

  play(video) {
    if (video.paused && !this.paused) {
      const result = video.play();
      if (result && result.catch) {
        result
          .then(() => {
            $(video).closest(selectors.container).addClass('playing');
          })
          .catch((e) => {
            this.muteAll();

            video.play()
              .then(() => {
                $(video).closest(selectors.container).addClass('playing');
              })
              .catch((e) => console.error('Could not play video', e))
            ;
          })
        ;
      } else {
        $(video).closest(selectors.container).addClass('playing');
      }
    }
  }

  pause(video) {
    if (!video.paused) {
      video.pause();
      $(video).closest(selectors.container).removeClass('playing');
    }
  }
}
