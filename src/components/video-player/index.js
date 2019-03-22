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
    this.errors = false;
  }

  init(root) {
    this.root = root;
    this.containers = $(this.root).find(selectors.container);
    this.videos = this.containers.find(selectors.video);
    this.waitForPlayersReady();
    // this.initPlayButtons();
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
      const target = event.currentTarget;
      const video = event.currentTarget.querySelector(selectors.video);
      const project = $(target).closest(selectors.project);
      if (video.paused) {
        this.paused = false;
        this.play(project);
      } else {
        this.paused = true;
        this.pause(project);
      }
    });
  }

  show(project) {
    const image = project.find(selectors.poster);

    if (image.length > 0) {
      console.log('showing', project);
      const container = project.find(selectors.container);
      const poster = image.attr('data-poster');
      const sources = image.attr('data-small-sd').split('||');
      const root = image.attr('data-root');

      // Generate the video element.
      const video = $(
        `<video name="video" loop preload="auto" poster=${poster}></video>`
      );
      sources.forEach((s) => {
        const parts = s.split('.');
        const type = parts[parts.length - 1];
        video.append(`<source src="${root}/${s}" type="video/${type}"></source>`);
      });

      // Remove the image.
      // TODO Don't remove the image because it causes a content flash.
      image.remove();

      // Add the video element.
      container.append(video);

      // Update the list of videos.
      this.videos = this.containers.find(selectors.video);
    }
  }

  muteAll() {
    this.videos.each((i, v) => v.muted = true);
  }

  showAllControls() {
    this.videos.each((i, v) => v.controls = true);
  }

  play(project) {
    const video = project[0].querySelector('video');
    if (video.paused && !this.paused) {
      const result = video.play();
      if (result && result.catch) {
        result
          .then(() => {
            console.log('playback starting');
            $(video).closest(selectors.container).addClass('playing');
          })
          .catch((e) => {
            console.warn('could not play...trying again');
            this.errors = true;
            this.muteAll();
            // this.showAllControls();

            video.play()
              .then(() => {
                console.log('playback started the second time.');
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

  pause(project) {
    const video = project[0].querySelector('video');
    if (!video.paused) {
      video.pause();
      $(video).closest(selectors.container).removeClass('playing');
    }
  }
}
