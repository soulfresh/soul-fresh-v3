import $ from 'jquery';
import { throttle } from 'lodash';
import { Players } from './components/video-player';
import { Dimensions } from './components/dimensions';
import { Projects } from './components/projects';
import { selectors } from './components/selectors';

function createBoxes(root, ids, name, classes) {
  ids.forEach((id) => {
    root.append(
      `<div name="${name}" class="${id} ${classes}"></div>`
    );
  });
}

var documentReady = false;
const win = $(window);
const html = $('html');
const header = $(selectors.header);
const root = $(selectors.root);
const work = $(selectors.work);
const projects = $(selectors.project);
const yearsContainer = $('<div name="years" class="years"></div>');
const years = $(selectors.year);
const colorBoxContainer = $('<div name="colorBoxes" class="colors"></div>');
const descriptionBoxContainer = $('<div name="descriptionBoxes" class="description-boxes"></div>');
const dimensions = new Dimensions();

// Get the ids of all our projects.
const projectIds = [];
projects.each((i, p) => {
  projectIds.push(p.getAttribute('id'));
});

const yearsSizeRatio = 0.25;
const descriptionBoxRatio = 1.5;

// Move Year elements into their own container.
years.appendTo(yearsContainer);
root.prepend(yearsContainer);
root.prepend(colorBoxContainer);
root.append(descriptionBoxContainer);

createBoxes(colorBoxContainer, projectIds, 'colorBox', 'color-box color-background');
createBoxes(descriptionBoxContainer, projectIds, 'descriptionBox', 'description-box color-background');

const descriptionBoxes = $(selectors.descriptionBox);

var bottomPadding = 0;
const resizeBottomPadding = () => {
  // Calculate bottom padding so last item aligns to top of page.
  bottomPadding = win.height() - projects.last().outerHeight() - header.outerHeight();
  work.css('padding-bottom', bottomPadding);
};
// Get this close. We'll recalculate once the videos are loaded.
resizeBottomPadding();

// These should be calculated after DOM modifications.
const headerH = header.outerHeight();

const yearsH = yearsContainer.outerHeight();
const visibleH = years.last().outerHeight();
const boxesH = colorBoxContainer.outerHeight();

const resizeYears = () => {
  // Resize years to be a factor of their project height.
  projects.each((i) => {
    years.eq(i).height(projects.eq(i).outerHeight() * yearsSizeRatio);
  });
};
// Get these close. We'll recalculate once the videos are ready.
resizeYears();

const resizeDescriptionBoxes = () => {
  projects.each((i) => {
    let h = projects.eq(i).outerHeight() * descriptionBoxRatio;
    if (i === projects.length - 1) {
      // Add the bottom padding.
      h += bottomPadding;
    }
    descriptionBoxes.eq(i).height(h);
  });
}
resizeDescriptionBoxes();

const projectsHelper = new Projects();
projectsHelper.init(work);

projectsHelper.on('focused', (i) => {
  const project = projects.eq(i);
  const type = project.attr('data-type');
  if (type === 'video') {
    const video = project[0].querySelector('video');
    players.play(video);
  }
  years.eq(i).addClass('focused');
});

projectsHelper.on('hidden', (i) => {
  const project = projects.eq(i);
  const type = project.attr('data-type');
  if (type === 'video') {
    const video = project[0].querySelector('video');
    players.pause(video);
  }
  years.eq(i).removeClass('focused');
});

// Setup video players.
const players = new Players();
players.init(work);

const parallax = () => {
  const scrolled = dimensions.scrollPercent();
  // TODO These should be separate components that do
  // the calculation.
  const yMove = (dimensions.scrollH * scrolled) * yearsSizeRatio;
  const dMove = (dimensions.scrollH * scrolled) * descriptionBoxRatio;
  const bMove = (boxesH - dimensions.viewportH) * scrolled;

  yearsContainer.css('transform', `translateY(-${yMove}px)`);
  descriptionBoxContainer.css('transform', `translateY(-${dMove}px)`);
  colorBoxContainer.css('transform', `translateY(-${bMove}px)`);
};

const focusTracker = throttle(
  projectsHelper.testFocus.bind(projectsHelper),
  500,
  {leading: false, trailing: true}
);

const onScroll = () => {
  parallax();
  focusTracker(dimensions.viewportH);
};

const onResize = () => {
  dimensions.update();
  resizeBottomPadding();
  resizeYears();
  resizeDescriptionBoxes();

  // Listen to scroll events on the body.
  onScroll();
};

const ready = () => {
  requestAnimationFrame(() => {
    onResize();
  });
}

players.once('ready', () => {
  ready();
});

win.on('load', () => {
  documentReady = true;
  ready();
});

win.on('resize', onResize);
win.scroll(onScroll);

