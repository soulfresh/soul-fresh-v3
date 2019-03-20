import $ from 'jquery';

export class SizeAnimation {
  static collapse($elements) {
    const handleTransitionEnd = () => {
      $elements.each((i, n) => {
        n.removeEventListener('transitionend', handleTransitionEnd);
        n.classList.remove('closing');
      });
    };

    $elements.each((i, n) => {
      const w = n.scrollWidth;
      n.style.width = `${w}px`;
      n.classList.add('closing');
      n.addEventListener('transitionend', handleTransitionEnd);

      // Wait 1 paint to set the width to 0;
      requestAnimationFrame(() => {
        n.style.width = '0px';
      });
    });
  }

  static expand($elements) {
    const handleTransitionEnd = () => {
      $elements.each((i, n) => {
        n.removeEventListener('transitionend', handleTransitionEnd);
        n.classList.remove('opening');
      });
    };

    $elements.each((i, n) => {
      const w = n.scrollWidth;
      // Immediately set the width to our desired width;
      n.style.width = `${w}px`;
      n.classList.add('opening');
      n.addEventListener('transitionend', handleTransitionEnd);
    });
  }

  static slideIn($elements) {
    const handleTransitionEnd = () => {
      $elements.each((i, n) => {
        n.removeEventListener('transitionend', handleTransitionEnd);
        n.classList.remove('opening');
      });
    };

    $elements.each((i, n) => {
      const w = n.scrollWidth;
      // TODO Check the transforms for any current transforms
      // - non-translateX transforms should be added.
      // - translateX transforms should be modified.
      // const originalTransforms = n.style.transform;

      n.style.transform = `translateX(-${w}px)`;
      requestAnimationFrame(() => {
        n.classList.add('opening');
        n.addEventListener('transitionend', handleTransitionEnd);

        requestAnimationFrame(() => {
          n.style.transform = 'translateX(0px)';
        });
      });
    });
  }

  static slideOut($elements) {
    const handleTransitionEnd = () => {
      $elements.each((i, n) => {
        n.removeEventListener('transitionend', handleTransitionEnd);
        n.classList.remove('opening');
      });
    };

    $elements.each((i, n) => {
      const w = n.scrollWidth;

      n.style.transform = 'translateX(0px)';
      requestAnimationFrame(() => {
        n.classList.add('opening');
        n.addEventListener('transitionend', handleTransitionEnd);

        requestAnimationFrame(() => {
          n.style.transform = `translateX(-${w}px)`;
        });
      });
    });
  }

  static roll($elements) {
    const $texts = $elements.find('.text');
    const handleTransitionEnd = () => {
      $elements.each((i, n) => {
        n.removeEventListener('transitionend', handleTransitionEnd);
        n.classList.remove('closing');
      });
    };

    $elements.each((i, n) => {
      const w = n.scrollWidth;
      const text = $texts[i];

      text.style.transform = 'translateX(0%)';
      n.style.width = `${w}px`;
      n.classList.add('closing');
      n.addEventListener('transitionend', handleTransitionEnd);

      requestAnimationFrame(() => {
        text.style.transform = `translateX(-100%)`;
        n.style.width = '0px';
      });
    });
  }

  static unroll($elements) {
    const $texts = $elements.find('.text');
    const handleTransitionEnd = () => {
      $elements.each((i, n) => {
        n.removeEventListener('transitionend', handleTransitionEnd);
        n.classList.remove('opening');
      });
    };

    $elements.each((i, n) => {
      const w = n.scrollWidth;
      const text = $texts[i];

      text.style.transform = 'translateX(-100px)';
      n.style.width = '0px';
      n.classList.add('opening');
      n.addEventListener('transitionend', handleTransitionEnd);

      requestAnimationFrame(() => {
        text.style.transform = 'translateX(0%)';
        n.style.width = `${w}px`;
      });
    });
  }
}
