import { useEffect, useRef } from "react";

/**
 * Subtle elastic "give" at the absolute top and bottom of the page.
 *
 * Desktop browsers have no overscroll affordance: the scroll position hard-stops
 * the instant you hit 0 or maxScroll, which is what makes long pages feel rigid.
 * This reads the wheel delta that *didn't* produce movement and turns the unused
 * part of that gesture into a small damped displacement of the page wrapper.
 *
 * The whole thing is modelled as ONE spring that always chases a target:
 *
 *      wheel  →  target  ⇢⇢⇢  spring  →  pull (what you see)
 *
 * There are two springs sharing that one loop. A gentle one follows your gesture
 * while you are still scrolling, so pushing feels continuous and elastic. The
 * moment input stops, a much stiffer *critically damped* spring takes over and
 * snaps the page home in a single sweep — no slow float, no second wobble.
 *
 * The loop is never stopped or restarted by input, and no timer gates motion.
 * While you keep pushing, the target keeps moving and the page keeps easing after
 * it every frame; when you let go, the same loop simply retargets to zero.
 *
 * Design constraints, deliberately narrow:
 * - Wheel input only. Touch platforms (iOS/Android) already ship a native rubber
 *   band, so we deliberately do not touch `overscroll-behavior` and do not
 *   double up on gesture devices.
 * - Never changes scroll position, never blocks input, never re-renders React,
 *   never touches layout. One rAF loop writes `transform` on a single DOM node,
 *   so it is entirely compositor work.
 * - No-ops entirely under `prefers-reduced-motion`.
 */

/** Peak displacement in px once fully stretched. Deliberately small. */
const MAX_PULL = 24;
/** Max vertical scale at full stretch. Well under 1% to stay imperceptible. */
const MAX_STRETCH = 0.006;

/**
 * px of stretch accumulated per px of wheel delta.
 *
 * Tuned against a real mouse notch (~110px) so the effect is clearly felt:
 * one notch gives ~1.3px, a sustained push builds to ~20px, and the `tanh`
 * resistance below stops it ever reaching the 24px ceiling. A single flick can
 * never slam the page to its limit — it takes a real push to build up, which is
 * what reads as resistance.
 */
const GAIN = 0.07;

/**
 * Share of each wheel notch applied straight to the target, so the *onset* of the
 * stretch is immediate rather than waiting on a spring. The spring eases in the
 * remainder, which is where the elasticity comes from.
 */
const FEED_FORWARD = 0.16;

/**
 * How many "maximum stretches" of accumulated wheel input it takes to approach
 * the limit. The resistance curve is `tanh(accum / (MAX_PULL * this))`, so a
 * higher value means the page gives a little more for a much longer push instead
 * of pinning early and then sitting dead still.
 */
const RESISTANCE_RANGE = 5;

/**
 * PULL spring — governs how the stretch follows your hand while you're still
 * scrolling. ζ ≈ 0.65: stiff enough to track a continuing gesture with no lag,
 * slightly underdamped so the pull itself has a little life in it.
 */
const PULL_STIFFNESS = 600;
const PULL_DAMPING = 32;

/**
 * RETURN spring — governs the snap-back once input stops.
 *
 * A separate, much stiffer, *critically damped* spring (ζ = 1.0 exactly, since
 * DAMPING = 2·√STIFFNESS), so the page returns in one decisive sweep and can
 * never ring back past centre.
 *
 * This split is the core of the fix. Sharing one gentle, underdamped spring for
 * both jobs was what made the return crawl: at ζ≈0.65 and ω≈24.5rad/s the page
 * needed well over a second to fall the last few pixels, then wobbled a second
 * time — which reads as "hanging". At ω≈95rad/s that same travel is done in
 * roughly 50–80ms.
 */
const RETURN_STIFFNESS = 9000;
const RETURN_DAMPING = 190; // 2·√9000 = 189.7

/**
 * Hard cap on return speed, in px/s.
 *
 * Stiffness alone returns *too* abruptly: from a full 20px stretch it would
 * cover ~7px in a single frame, which reads as a jump rather than a glide. This
 * caps the fastest frame to ~4-5px so the snap-back stays smooth at any depth,
 * while the spring does the final easing into rest.
 */
const RETURN_MAX_SPEED = 280;

/**
 * How long the stretch stays held after input stops.
 *
 * Only exists to absorb the gap between two separate wheel notches — it must
 * never be long enough to be perceived as the page "waiting". At 26ms it sits
 * below the ~33ms it takes a physical mouse wheel to deliver the next notch, so
 * continuous scrolling always re-arms the stretch before this can elapse, while a
 * genuine stop releases almost immediately. This was 60ms, which *was* a visible
 * pause before the return even began.
 */
const HOLD_MS = 26;

/**
 * Fixed integration substep for the spring, in seconds.
 *
 * The return spring is stiff enough that a single explicit Euler step at a 60Hz
 * frame delta (or worse, at the 32ms clamp used after a dropped frame) is
 * numerically unstable and would fling the page off-screen. Integrating in small
 * fixed substeps keeps it stable at any frame rate. Twelve substeps of 1/720s
 * costs a handful of extra arithmetic operations per frame — nothing measurable.
 */
const SUBSTEP = 1 / 720;
const SUBSTEPS = 12;

/**
 * Rest thresholds, in px and px/s. Deliberately looser than "mathematically at
 * rest": sub-pixel drift is invisible, and stopping the loop a little early means
 * the rAF isn't kept alive to animate nothing.
 */
const REST_OFFSET = 0.12;
const REST_VELOCITY = 2;

/**
 * Reading `scrollHeight` forces a layout flush. Doing it on every wheel event —
 * i.e. every few ms during continuous scrolling — is a real cost, so it is
 * cached and refreshed on a timer and on resize.
 */
const MAX_SCROLL_TTL_MS = 400;

const clamp = (value: number, lo: number, hi: number) =>
  value < lo ? lo : value > hi ? hi : value;

/**
 * Walks up from the wheel target looking for an ancestor that scrolls on its own
 * (modal body, filter sheet, search overlay). If one is scrolling, the page
 * boundary is irrelevant and we must stay out of the way.
 *
 * This calls getComputedStyle, which forces style resolution — far too expensive
 * to repeat per event, so callers cache the answer for the whole gesture.
 */
const hasScrollableAncestor = (node: EventTarget | null, root: HTMLElement) => {
  let el = node instanceof Element ? node : null;
  while (el && el !== root) {
    const style = getComputedStyle(el);
    if (/(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight + 1) {
      return true;
    }
    el = el.parentElement;
  }
  return false;
};

/**
 * Returns a ref to attach to the element that should absorb the stretch.
 * Only ever writes `transform` / `transform-origin` on that node.
 */
export function useScrollRubberBand<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    const doc = document.scrollingElement ?? document.documentElement;

    /* Firefox reports wheel deltas in lines, some setups in pages. Normalise so
       the effect feels the same everywhere instead of ~30× weaker on Firefox. */
    let lineHeight = 0;
    const getLineHeight = () => {
      if (lineHeight) return lineHeight;
      const size = parseFloat(getComputedStyle(document.body).fontSize);
      lineHeight = Number.isFinite(size) && size > 0 ? size : 16;
      return lineHeight;
    };

    let maxScroll = -1;
    let maxScrollAt = -Infinity;
    const readMaxScroll = (now: number) => {
      if (maxScroll < 0 || now - maxScrollAt > MAX_SCROLL_TTL_MS) {
        maxScroll = doc.scrollHeight - window.innerHeight;
        maxScrollAt = now;
      }
      return maxScroll;
    };

    /** Current displayed displacement, px. */
    let pull = 0;
    /** px/s. */
    let velocity = 0;
    /** Running total of wheel input held past the edge — drives the resistance. */
    let accum = 0;
    /** Where the spring is heading. Non-zero only while held or returning. */
    let target = 0;
    /** Which edge the page stretches from, kept until fully settled. */
    let edge: "top" | "bottom" = "top";
    let lastInputAt = 0;
    let frame = 0;
    /** Cached per gesture — the DOM walk is too costly for every event. */
    let nestedBlocked: boolean | null = null;

    const write = () => {
      const ratio = Math.min(1, Math.abs(pull) / MAX_PULL);
      el.style.transformOrigin = edge === "bottom" ? "center bottom" : "center top";
      el.style.transform =
        `translate3d(0, ${pull.toFixed(2)}px, 0) scaleY(${(1 + ratio * MAX_STRETCH).toFixed(5)})`;
    };

    const settle = () => {
      pull = 0;
      velocity = 0;
      accum = 0;
      target = 0;
      frame = 0;
      nestedBlocked = null;
      el.style.transform = "";
      el.style.transformOrigin = "";
    };

    const step = (now: number) => {
      /* Spring integration runs on fixed substeps below, so no frame delta is
         needed here — which also makes the motion identical at any refresh rate. */

      /* Release the instant input genuinely pauses. The target goes straight to
         zero with no ramp — the previous 28ms decay ramp was dead time sitting
         in front of the spring, so the page stayed visibly stretched while the
         ramp ran down. The return spring provides all the smoothing needed, so
         there is nothing to ramp through.
         */
      if (now - lastInputAt > HOLD_MS) {
        accum = 0;
        target = 0;
      }

      /* Two springs, one loop. The gentle one tracks your hand while you push;
         the stiff critically-damped one snaps the page home the moment you stop.
         The loop itself never stops, so a continuing gesture always has something
         animating it — that is the difference between "elastic" and "frozen". */
      const returning = target === 0;
      const stiffness = returning ? RETURN_STIFFNESS : PULL_STIFFNESS;
      const damping = returning ? RETURN_DAMPING : PULL_DAMPING;

      /* Fixed substeps: numerically stable at this stiffness regardless of how
         long the frame took. */
      for (let i = 0; i < SUBSTEPS; i += 1) {
        velocity += (-stiffness * (pull - target) - damping * velocity) * SUBSTEP;
        pull += velocity * SUBSTEP;
        /* Cap only the return, so a deep stretch eases home at a constant,
           gentle clip instead of teleporting, while the spring's own damping
           handles the final settle into rest. */
        if (returning && velocity > RETURN_MAX_SPEED) velocity = RETURN_MAX_SPEED;
        else if (returning && velocity < -RETURN_MAX_SPEED) velocity = -RETURN_MAX_SPEED;
      }

      if (returning && Math.abs(pull) < REST_OFFSET && Math.abs(velocity) < REST_VELOCITY) {
        settle();
        return;
      }

      write();
      frame = requestAnimationFrame(step);
    };

    const start = () => {
      if (frame) return;
      frame = requestAnimationFrame(step);
    };

    /**
     * Let go of the edge without snapping. Zeroing the target hands control to
     * the stiff return spring, which carries the page home in one sweep.
     */
    const release = () => {
      accum = 0;
      target = 0;
      lastInputAt = 0;
      nestedBlocked = null;
      if (pull !== 0 || Math.abs(velocity) > REST_VELOCITY) start();
    };

    const onWheel = (event: WheelEvent) => {
      /* Ctrl+wheel is browser zoom, not scrolling. */
      if (event.ctrlKey) return;

      const unit =
        event.deltaMode === 1
          ? getLineHeight()
          : event.deltaMode === 2
            ? window.innerHeight
            : 1;
      const deltaY = event.deltaY * unit;

      /* Trackpad horizontal swipes and pinch gestures are not vertical intent. */
      if (Math.abs(deltaY) <= Math.abs(event.deltaX)) return;
      if (Math.abs(deltaY) < 0.05) return;

      const now = performance.now();
      const limit = readMaxScroll(now);
      if (limit <= 1) return;

      const scrollTop = doc.scrollTop;
      const atTop = scrollTop <= 0.5;
      const atBottom = scrollTop >= limit - 0.5;
      /* Page shorter than the viewport — nothing to stretch. */
      if (atTop && atBottom) return;

      /* Only the direction that *cannot* scroll produces give. Everything else
         (mid-page, or scrolling back inward) releases smoothly. */
      const pulling = atTop ? deltaY < 0 : atBottom ? deltaY > 0 : false;
      if (!pulling) {
        release();
        return;
      }

      if (nestedBlocked === null) nestedBlocked = hasScrollableAncestor(event.target, el);
      if (nestedBlocked) return;

      edge = atTop ? "top" : "bottom";

      /* -deltaY at both edges: up at the top drags the page down, down at the
         bottom lifts it. */
      const applied = clamp(-deltaY * GAIN, -MAX_PULL, MAX_PULL);

      /* Resistance is applied per increment rather than to the accumulated
         total, so pushing harder always still moves the page (it asymptotes
         smoothly instead of saturating into a dead stop) and easing off reverses
         at exactly the same rate. */
      accum = clamp(
        accum + applied,
        -MAX_PULL * RESISTANCE_RANGE,
        MAX_PULL * RESISTANCE_RANGE,
      );
      target = clamp(
        MAX_PULL * Math.tanh(accum / (MAX_PULL * RESISTANCE_RANGE)) +
          applied * FEED_FORWARD,
        -MAX_PULL * 1.15,
        MAX_PULL * 1.15,
      );

      lastInputAt = now;
      start();
    };

    const invalidateScrollCache = () => {
      maxScroll = -1;
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("resize", invalidateScrollCache);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", invalidateScrollCache);
      if (frame) cancelAnimationFrame(frame);
      el.style.transform = "";
      el.style.transformOrigin = "";
    };
  }, []);

  return ref;
}

export default useScrollRubberBand;
