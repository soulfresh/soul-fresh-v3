import EventEmitter from "eventemitter3";
import { selectors } from "../selectors";
import { browserDetect } from "../browser-detect";
import { makeElement } from "../element-creator";

export class PlayersInteractivity extends EventEmitter {
  constructor() {
    super();
    this.ready = false;
    this.muted = false;
    this.paused = false;
    this.nativeControls = false;
    this._backgrounded = false;
    this.errors = false;
    this.progressSpeed = 1000;
    // The index of the video element that is focused.
    this.focused = null;
    this.debug = false;
    this.browser = browserDetect();
  }

  log() {
    if (this.debug) {
      console.log(...arguments);
    }
  }

  init(root) {
    root = root[0];
    this.onVideoProgress = this.onVideoProgress.bind(this);
    this.onCheckProgress = this.onCheckProgress.bind(this);
    this.lastProgressEvent = Date.now();

    const projects = Array.from(root.querySelectorAll(selectors.project));

    this.data = [];
    projects.forEach((p) => {
      const id = p.getAttribute("id");
      const placeholder = p.querySelector(selectors.videoPlaceholder);

      if (placeholder) {
        const root = placeholder.getAttribute("data-root");
        debugger;
        const small = placeholder
          .getAttribute("data-small")
          .split("||")
          .map((src) => `${root}/${src}`);
        const large = placeholder
          .getAttribute("data-large")
          .split("||")
          .map((src) => `${root}/${src}`);

        this.data.push({
          id: id,
          isVideoProject: true,
          ready: false,
          container: p.querySelector(selectors.container),
          placeholder: placeholder,
          poster: placeholder.getAttribute("data-poster"),
          srcRoot: root,
          srcsSmall: small,
          srcsLarge: large,
          video: null,
          muteButton: p.querySelector(selectors.videoMute),
          muted: this.muted,
          pause: this.paused,
        });
      } else {
        this.data.push({ isVideoProject: false });
      }
    });

    // Initialize controls.
    if (!this.nativeControls) {
      this.initPlayerButtons();
    } else {
      this.useNativeControls();
    }

    // If we're starting out muted.
    if (this.muted) {
      this.muteAll();
    }

    // If we're starting out paused.
    if (this.paused) {
      this.setGlobalPausedState(true);
    }

    if (this.debug) {
      this.onAbort = () => this.log("abort", ...arguments);
      this.onEmptied = () => this.log("emptied", ...arguments);
      this.onError = () => this.log("error", ...arguments);
      this.onCanPlay = () => this.log("canplay", ...arguments);
      this.onCanPlayThrough = () => this.log("canplaythrough", ...arguments);
      this.onLoadedData = () => this.log("loadeddata", ...arguments);
      this.onLoadedMetadata = () => this.log("loadedmetadata", ...arguments);
      this.onLoadStart = () => this.log("loadstart", ...arguments);
      this.onSuspend = () => this.log("suspend", ...arguments);
      this.onStalled = () => this.log("stalled", ...arguments);
      this.onWaiting = () => this.log("waiting", ...arguments);
      this.onPlaying = () => this.log("playing", ...arguments);
      this.onPlay = () => this.log("play", ...arguments);
      this.onPause = () => this.log("pause", ...arguments);
    }

    this.emit("ready");
  }

  useLargeVideo(el) {
    const small = 640;
    const overThreshold = 1.0;
    return !this.browser.safari && el.clientWidth > small * overThreshold;
  }

  onVideoProgress() {
    this.lastProgressEvent = Date.now();
  }

  onCheckProgress() {
    // TODO After enough data is loaded for the current video, start
    // preloading the next video.
    // TODO Test how quickly download is happening. If it's pretty fast
    // and the screen is large enough, boost the video quality for all videos.
    // Also do the inverse if downloads are slow.
    this.log("check progress");
    if (this.focused != null && !this.paused) {
      const v = this.data[this.focused].video;
      const now = Date.now();

      if (now >= this.lastProgressEvent + this.progressSpeed) {
        this.log(
          `slow progress: ${now} >= ${this.lastProgressEvent + this.progressSpeed} = true`,
        );
        this.loadingState(this.focused);
      } else {
        this.log(
          `normal progress: ${now} >= ${this.lastProgressEvent + this.progressSpeed} = false`,
        );
        if (!v.paused) {
          this.playingState(this.focused);
        } else {
          this.pausedState(this.focused);
        }
      }

      this.lastProgressEvent = now;
    }
  }

  listenToStateChanges(index) {
    const v = this.data[index].video;

    // Turn on the loading state immediately.
    this.loadingState(index);

    // TODO Do this in a request animation frame so it will pause when backgrounded.
    this.interval = setInterval(this.onCheckProgress, this.progressSpeed);
    v.addEventListener("timeupdate", this.onVideoProgress);

    if (this.debug) {
      v.addEventListener("abort", this.onAbort);
      v.addEventListener("emptied", this.onEmptied);
      v.addEventListener("error", this.onError);
      v.addEventListener("canplay", this.onCanPlay);
      v.addEventListener("canplaythrough", this.onCanPlayThrough);
      v.addEventListener("loadedata", this.onLoadedData);
      v.addEventListener("loadedmetadata", this.onLoadedMetadata);
      v.addEventListener("loadstart", this.onLoadStart);
      v.addEventListener("suspend", this.onSuspend);
      v.addEventListener("stalled", this.onStalled);
      v.addEventListener("waiting", this.onWaiting);
      v.addEventListener("playing", this.onPlaying);
      v.addEventListener("play", this.onPlay);
      v.addEventListener("pause", this.onPause);
    }
  }

  removeStateChanges(index) {
    const v = this.data[index].video;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    v.removeEventListener("timeupdate", this.onVideoProgress);

    if (this.debug) {
      v.removeEventListener("abort", this.onAbort);
      v.removeEventListener("emptied", this.onEmptied);
      v.removeEventListener("error", this.onError);
      v.removeEventListener("canplay", this.onCanPlay);
      v.removeEventListener("canplaythrough", this.onCanPlayThrough);
      v.removeEventListener("loadedata", this.onLoadedData);
      v.removeEventListener("loadedmetadata", this.onLoadedMetadata);
      v.removeEventListener("loadstart", this.onLoadStart);
      v.removeEventListener("suspend", this.onSuspend);
      v.removeEventListener("stalled", this.onStalled);
      v.removeEventListener("waiting", this.onWaiting);
      v.removeEventListener("playing", this.onPlaying);
      v.removeEventListener("play", this.onPlay);
      v.removeEventListener("pause", this.onPause);
    }
  }

  notifyWhenReady() {
    this.data.forEach((d) => {
      if (d.isVideoProject && d.video) {
        if (d.video.readyState > 0) {
          this.ready = true;
        } else {
          v.addEventListener("loadedmetadata", () => {
            this.ready = true;
            this.emit("ready");
          });
        }
      }
    });

    if (this.ready) {
      this.emit("ready");
    }
  }

  playClick(index) {
    const p = this.data[index];
    if (p.video) {
      if (p.video.paused) {
        this.paused = false;
        this.play(index);
        this.setGlobalPausedState(false);
      } else {
        this.paused = true;
        this.pause(index);
        this.setGlobalPausedState(true);
      }
    }
  }

  muteClick() {
    this.muted = !this.muted;
    if (this.muted) {
      this.muteAll();
    } else {
      this.unmuteAll();
    }
  }

  initPlayerButtons() {
    if (!this.nativeControls) {
      this.data.forEach((p, i) => {
        if (p.isVideoProject) {
          p.container.handleClick = () => {
            this.playClick(i);
          };
          p.container.addEventListener("click", p.container.handleClick);

          p.muteButton.handleClick = (event) => {
            event.stopPropagation();
            this.muteClick();
          };
          p.muteButton.addEventListener("click", p.muteButton.handleClick);
        }
      });
    }
  }

  setGlobalPausedState(paused = true) {
    if (paused) {
      document.body.classList.add("media-paused");
    } else {
      document.body.classList.remove("media-paused");
    }
  }

  setGlobalMutedState(muted = true) {
    if (muted) {
      document.body.classList.add("media-muted");
    } else {
      document.body.classList.remove("media-muted");
    }
  }

  disableCustomPlayButtons() {
    this.data.forEach((p) => {
      if (p.container && p.container.handleClick) {
        p.container.removeEventListener("click", p.container.handleClick);
      }
    });
  }

  muteAll() {
    this.changeAllMuteStates(true);
  }

  unmuteAll() {
    this.changeAllMuteStates(false);
  }

  changeAllMuteStates(muted = true) {
    this.data.forEach((p) => {
      if (p.isVideoProject && p.video) {
        p.video.muted = muted;
      }
    });

    this.muted = muted;
    this.setGlobalMutedState(this.muted);
  }

  pauseAllOthers(index) {
    for (let i = 0; i < this.data.length; i++) {
      if (i !== index) {
        this.pause(i);
      }
    }
  }

  pauseAll() {
    this.data.forEach((i) => this.pause(i));
    this.paused = true;
  }

  showAllControls() {
    this.disableCustomPlayButtons();
    this.data.forEach((d) => {
      if (d.isVideoProject && d.video) {
        d.video.controls = true;
      }
    });
    this.nativeControls = true;
    document.body.classList.add("show-native-media-controls");
  }

  useNativeControls() {
    this.log("Reverting to native video controls.");
    this.unmuteAll();
    this.pauseAll();
    this.showAllControls();
    if (this.focused != null) {
      this.removeStateChanges(this.focused);
    }
  }

  playingState(index) {
    const p = this.data[index];
    p.container.classList.add("playing");
    p.container.classList.remove("loading");
  }

  pausedState(index) {
    const p = this.data[index];
    p.container.classList.remove("playing");
    p.container.classList.remove("loading");
  }

  loadingState(index) {
    const p = this.data[index];
    p.container.classList.remove("playing");
    p.container.classList.add("loading");
  }

  focus(index) {
    const project = this.data[index];

    // Pause the currently focused player.
    if (this.focused != null && this.focused !== index) {
      this.pause(this.focused);
      this.focused = null;
    }

    if (project.isVideoProject) {
      this.log("focused video", index);

      if (!project.video) {
        this.attachVideo(index);
      }

      this.focused = index;
      this.play(index);
      // this.preloadNext(index);
    }
  }

  unfocus(index) {
    // If the project being unfocused is the item we currently have
    // as the focused project, clear the focused project. Otherwise,
    // leave the focused project alone.
    if (this.focused != null && this.focused === index) {
      this.focused = null;
    }

    this.pause(index);
  }

  preloadNext(index) {
    const total = this.browser.safari ? 1 : 2;
    const start = index + 1;
    const end = Math.min(this.data.length, start + total);

    this.log("preloading videos", start, " -> ", end);

    for (let i = start; i < end; i++) {
      const p = this.data[i];
      if (p.isVideoProject && p.video) {
        p.video.setAttribute("preload", "auto");
      }
    }
  }

  backgrounded() {
    this._backgrounded = true;
    if (this.focused != null) {
      this.pause(this.focused);
    }
  }

  foregrounded() {
    this._backgrounded = false;
    if (this.focused != null) {
      this.log("restarting the focused player", this.focused);
      this.play(this.focused);
    }
  }

  play(index) {
    // Do the auto play functionality if we're using the custom
    // controls and we haven't globally paused video playback.
    if (!this.paused) {
      this.pauseAllOthers(index);

      const video = this.data[index].video;
      if (video && video.paused) {
        this.listenToStateChanges(index);

        this.log("playing video", video);
        const result = video.play();
        if (result && result.catch) {
          result
            .then(() => this.log("Playback started the first time."))
            .catch((e) => {
              this.log("1. Could not play...trying again", e.name, e.message);
              this.errors = true;
              this.muteAll();

              video
                .play()
                .then(() => this.log("Playback started the second time."))
                .catch((e) => {
                  this.log("2. Could not play video", e.name, e.message);
                  this.useNativeControls();
                });
            });
        }
      }
    }
  }

  pause(index) {
    const video = this.data[index].video;
    if (video) {
      video.pause();
      this.removeStateChanges(index);
      this.pausedState(index);

      // Remove the video element in Safari in order
      // to improve load performance of the next video.
      if (this.browser.safari) {
        this.detachVideo(index);
      }
    }
  }

  hidePlaceholder(index) {
    const p = this.data[index];
    if (p.placeholder) {
      p.placeholder.style.visibility = "hidden";
    }
  }

  showPlaceholder(index) {
    const p = this.data[index];
    if (p.placeholder) {
      p.placeholder.style.visibility = "visible";
    }
  }

  detachVideo(index) {
    this.log("detach video", this.data[index].id);
    // this.showPlaceholder(index);

    const p = this.data[index];
    p.video.remove();
    p.video = null;
  }

  // Can be used to dynamically attach a video to the page.
  attachVideo(index) {
    this.log("attach video", this.data[index].id);
    const project = this.data[index];

    // Generate the video element.
    const video = makeElement(
      `<video name="video" class="video"
         loop preload="auto"
         ${!this.paused ? "autoplay" : ""}
         ${this.muted ? "muted" : ""}
         ${this.nativeControls ? "controls" : ""}
         poster=${project.poster}>
       </video>`,
    );

    const sources = this.useLargeVideo(project.placeholder)
      ? project.srcsLarge
      : project.srcsSmall;

    sources.forEach((s) => {
      const parts = s.split(".");
      const type = parts[parts.length - 1];
      const source = makeElement(
        `<source src="${s}" type="video/${type}"></source>`,
      );
      video.appendChild(source);
    });

    // Add the video element.
    project.container.appendChild(video);

    // this.hidePlaceholder(index)

    project.video = video;
    project.ready = true;
  }
}
