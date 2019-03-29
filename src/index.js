import $ from 'jquery';
import { throttle } from 'lodash';
import { Players } from './components/video-player';
import { Dimensions } from './components/dimensions';
import { Projects } from './components/projects';
import { selectors } from './components/selectors';
import { Years } from './components/years';
import { LeftColors, RightColors } from './components/color-boxes';
import { BackgroundColors } from './components/background-colors';
import { SineWaveDrawing } from './components/background-drawing';

const win = $(window);
const header = $(selectors.header);
const root = $(selectors.root);
const work = $(selectors.work);
const projects = $(selectors.project);
const dimensions = new Dimensions();

// Get the ids of all our projects.
const projectIds = [];
projects.each((i, p) => {
  projectIds.push(p.getAttribute('id'));
});

// TODO Don't initialize ALL of these immediately.
const bgColors = new BackgroundColors(root, projectIds);
bgColors.init();

const colorsL = new LeftColors(root, projectIds);
colorsL.init();

const years = new Years(root);
years.init();

const drawing = new SineWaveDrawing($('body'), projectIds);

const projectsHelper = new Projects();
projectsHelper.init(work);

// Setup video players.
const players = new Players();
players.init(work);

projectsHelper.on('focused', (i) => {
  requestAnimationFrame(() => {
    const project = projects.eq(i);
    players.focus(project);
    years.focus(i);
  });
});

const parallax = () => {
  const scrolled = dimensions.scrollPercent();

  years.scroll(scrolled, dimensions.scrollH, dimensions.viewportH);
  colorsL.scroll(scrolled, dimensions.scrollH, dimensions.viewportH);
  drawing.scroll(scrolled);
};

const focusTracker = throttle(
  projectsHelper.testFocus.bind(projectsHelper),
  500,
  {leading: false, trailing: true}
);

const start = () => {
  drawing.init();
};

const onScroll = () => {
  requestAnimationFrame(() => {
    parallax();
    focusTracker(dimensions.viewportH);
  });
};

const onResize = throttle(() => {
    requestAnimationFrame(() => {
      dimensions.update();
      years.resize();
      drawing.resize();

      // Update the positions of everything.
      onScroll();
    });
  },
  500,
  {trailing: true, leading: false}
);

players.on('ready', onResize);

document.addEventListener('visibilitychange', (e) => {
  if (document.hidden) {
    players.backgrounded();
  } else {
    players.foregrounded();
  }
});

win.on('load', () => {
  start();
  onResize();
});

win.on('resize', onResize);
win.scroll(onScroll);

