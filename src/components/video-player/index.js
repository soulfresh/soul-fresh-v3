import $ from 'jquery';
import EventEmitter from 'eventemitter3';
import { selectors } from '../selectors';

export class Players extends EventEmitter {
  constructor() {
    super();
    this.ready = false;
    this.paused = false;
    this.errors = false;
    this.progressSpeed = 1000;
    // The PROJECT element that is focused.
    this.focused = null;
  }

  init(root) {
    this.root = root;
    this.containers = $(this.root).find(selectors.container);
    this.videos = this.containers.find(selectors.video);
    this.notifyWhenReady();
    this.initPlayButtons();
    this.lastProgressEvent = Date.now();

    this.onVideoProgress = this.updateVideoProgress.bind(this);
  }

  updateVideoProgress() {
    this.lastProgressEvent = Date.now();
  }

  checkProgress() {
    // TODO After enough data is loaded for the current video, start
    // preloading the next video.
    // TODO Test how quickly download is happening. If it's pretty fast
    // and the screen is large enough, boost the video quality for all videos.
    // Also do the inverse if downloads are slow.
    if (this.focused && !this.paused) {
      const v = this.focused[0].querySelector('video');
      const now = Date.now();

      if (now >= this.lastProgressEvent + this.progressSpeed) {
        console.log('no progress in a while');
        this.loadingState(v);
      }
      else {
        if (!v.paused) {
          console.log('setting playing state');
          this.playingState(v);
        } else {
          console.log('setting paused state.');
          this.pausedState(v);
        }
      }

      this.lastProgressEvent = now;
    }
  }

  listenToStateChanges(v) {
    // Turn on the loading state immediately.
    this.loadingState(v);

    // TODO Do this in a request animation frame so it will pause when backgrounded.
    this.interval = setInterval(this.checkProgress.bind(this), this.progressSpeed);
    v.addEventListener('timeupdate', this.onVideoProgress);
  }

  removeStateChanges(v) {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    v.removeEventListener('timeupdate', this.onVideoProgress);
  }

  notifyWhenReady() {
    this.videos.each((i, v) => {
      if (v.readyState > 0) {
        this.ready = true;
      } else {
        v.addEventListener('loadedmetadata', (event) => {
          this.ready = true;
          this.emit('ready');
        });
      }
    });

    if (this.ready) {
      this.emit('ready');
    }
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

  muteAll() {
    this.videos.each((i, v) => v.muted = true);
  }

  showAllControls() {
    this.videos.each((i, v) => v.controls = true);
  }

  playingState(video) {
    const container = $(video).closest(selectors.container)
    container.addClass('playing');
    container.removeClass('loading');
  }

  pausedState(video) {
    const container = $(video).closest(selectors.container);
    container.removeClass('playing');
    container.removeClass('loading');
  }

  loadingState(video) {
    const container = $(video).closest(selectors.container);
    container.removeClass('playing');
    container.addClass('loading');
  }

  focus(project) {
    // Compare against the video node (rather than the jquery object)
    // because we know the video node won't change.
    if (this.focused && this.focused[0] !== project[0]) {
      this.pause(this.focused);
    }

    // If the project being focused has a video, store it
    // as the focused element. Otherwise, clear our currently
    // focused project because we don't care about this project.
    const video = project[0].querySelector('video');
    if (video) {
      this.focused = project;
      this.play(project);
    } else {
      this.focused = null;
    }
  }

  unfocus(project) {
    // If the project being unfocused is the item we currently have
    // as the focused project, clear the focused project. Otherwise,
    // leave the focused project alone.
    if (this.focused && this.focused[0] === project[0]) {
      this.focused = null;
    }

    this.pause(project);
  }

  play(project) {
    const video = project[0].querySelector('video');
    if (video.paused && !this.paused) {
      this.listenToStateChanges(video);
      const result = video.play();
      if (result && result.catch) {
        result
          .then(() => {
            console.log('playback starting');
          })
          .catch((e) => {
            console.warn('could not play...trying again');
            this.errors = true;
            this.muteAll();

            video.play()
              .then(() => {
                console.log('playback started the second time.');
                // this.playingState(video);
              })
              .catch((e) => {
                this.removeStateChanges(video);
                console.error('Could not play video', e);
              })
            ;
          })
        ;
      }
    }
  }

  pause(project) {
    const video = project[0].querySelector('video');
    if (!video.paused) {
      video.pause();
      this.removeStateChanges(video);
      this.pausedState(video);
    }
  }

  // Can be used to dynamically attach a video to the page.
  show(project) {
    const video = project.find(selectors.video);

    if (video.length < 1) {
      const image = project.find(selectors.poster);
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
}
