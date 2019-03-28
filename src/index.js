import $ from 'jquery';
import { throttle } from 'lodash';
import { Players } from './components/video-player';
import { Dimensions } from './components/dimensions';
import { Projects } from './components/projects';
import { selectors } from './components/selectors';
import { Years } from './components/years';
import { LeftColors, RightColors } from './components/color-boxes';
import { BackgroundColors } from './components/background-colors';

var documentReady = false;
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

const colorsL = new LeftColors(root, projectIds);
colorsL.init();

const bgColors = new BackgroundColors(root, projectIds);
bgColors.init();

const years = new Years(root);
years.init();

const resizeBottomPadding = () => {
  // Calculate bottom padding so last item aligns to top of page.
  work.css('padding-bottom', dimensions.bottomPadding);
};
// Get this close. We'll recalculate once the videos are loaded.
resizeBottomPadding();

colorsL.resize();

const projectsHelper = new Projects();
projectsHelper.init(work);

projectsHelper.on('focused', (i) => {
  requestAnimationFrame(() => {
    const project = projects.eq(i);
    players.focus(project);
    years.focus(i);
  });
});

// Setup video players.
const players = new Players();
players.init(work);

const parallax = () => {
  const scrolled = dimensions.scrollPercent();

  years.scroll(scrolled, dimensions.scrollH);
  colorsL.scroll(scrolled, dimensions.scrollH);
};

const focusTracker = throttle(
  projectsHelper.testFocus.bind(projectsHelper),
  500,
  {leading: false, trailing: true}
);

const onScroll = () => {
  requestAnimationFrame(() => {
    parallax();
    focusTracker(dimensions.viewportH);
  });
};

const onResize = throttle(() => {
    dimensions.update();
    resizeBottomPadding();
    years.resize();

    // Update the positions of everything.
    onScroll();
  },
  500,
  {trailing: true, leading: false}
);

const ready = throttle(() => {
    requestAnimationFrame(() => onResize());
  },
  1000,
  {trailing: true, leading: false}
);

players.on('ready', () => ready());

document.addEventListener('visibilitychange', (e) => {
  if (document.hidden) {
    players.backgrounded();
  } else {
    players.foregrounded();
  }
});

win.on('load', () => {
  documentReady = true;
  ready();
});

win.on('resize', onResize);
win.scroll(onScroll);

