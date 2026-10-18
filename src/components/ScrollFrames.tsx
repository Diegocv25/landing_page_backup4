import { useEffect, useRef, type RefObject } from "react";

// These public URLs match the 50 files inspected in public/imagens_frames.
const FRAME_URLS = [
  "/imagens_frames/ezgif-frame-001.png",
  "/imagens_frames/ezgif-frame-002.png",
  "/imagens_frames/ezgif-frame-003.png",
  "/imagens_frames/ezgif-frame-004.png",
  "/imagens_frames/ezgif-frame-005.png",
  "/imagens_frames/ezgif-frame-006.png",
  "/imagens_frames/ezgif-frame-007.png",
  "/imagens_frames/ezgif-frame-008.png",
  "/imagens_frames/ezgif-frame-009.png",
  "/imagens_frames/ezgif-frame-010.png",
  "/imagens_frames/ezgif-frame-011.png",
  "/imagens_frames/ezgif-frame-012.png",
  "/imagens_frames/ezgif-frame-013.png",
  "/imagens_frames/ezgif-frame-014.png",
  "/imagens_frames/ezgif-frame-015.png",
  "/imagens_frames/ezgif-frame-016.png",
  "/imagens_frames/ezgif-frame-017.png",
  "/imagens_frames/ezgif-frame-018.png",
  "/imagens_frames/ezgif-frame-019.png",
  "/imagens_frames/ezgif-frame-020.png",
  "/imagens_frames/ezgif-frame-021.png",
  "/imagens_frames/ezgif-frame-022.png",
  "/imagens_frames/ezgif-frame-023.png",
  "/imagens_frames/ezgif-frame-024.png",
  "/imagens_frames/ezgif-frame-025.png",
  "/imagens_frames/ezgif-frame-026.png",
  "/imagens_frames/ezgif-frame-027.png",
  "/imagens_frames/ezgif-frame-028.png",
  "/imagens_frames/ezgif-frame-029.png",
  "/imagens_frames/ezgif-frame-030.png",
  "/imagens_frames/ezgif-frame-031.png",
  "/imagens_frames/ezgif-frame-032.png",
  "/imagens_frames/ezgif-frame-033.png",
  "/imagens_frames/ezgif-frame-034.png",
  "/imagens_frames/ezgif-frame-035.png",
  "/imagens_frames/ezgif-frame-036.png",
  "/imagens_frames/ezgif-frame-037.png",
  "/imagens_frames/ezgif-frame-038.png",
  "/imagens_frames/ezgif-frame-039.png",
  "/imagens_frames/ezgif-frame-040.png",
  "/imagens_frames/ezgif-frame-041.png",
  "/imagens_frames/ezgif-frame-042.png",
  "/imagens_frames/ezgif-frame-043.png",
  "/imagens_frames/ezgif-frame-044.png",
  "/imagens_frames/ezgif-frame-045.png",
  "/imagens_frames/ezgif-frame-046.png",
  "/imagens_frames/ezgif-frame-047.png",
  "/imagens_frames/ezgif-frame-048.png",
  "/imagens_frames/ezgif-frame-049.png",
  "/imagens_frames/ezgif-frame-050.png",
] as const;

const MAX_CACHED_FRAMES = 12;
const MAX_PARALLEL_LOADS = 2;
const PREFETCH_RADIUS = 5;

type FrameRecord = {
  image: HTMLImageElement;
  status: "loading" | "ready";
  touchedAt: number;
};

type ScrollFramesProps = {
  sectionRef: RefObject<HTMLElement>;
  stageRef: RefObject<HTMLDivElement>;
};

/**
 * CSS contract:
 * - section height: calc(var(--hero-stage-height, 100svh) + 240svh)
 * - stage: position: sticky; top: 0; min-height: 100svh
 * - canvas: position: absolute; inset: 0; width/height: 100%; pointer-events: none
 * - reduced motion: section height: auto; stage position: relative
 * The measured stage height also supports content taller than a mobile viewport.
 */
export default function ScrollFrames({ sectionRef, stageRef }: ScrollFramesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!section || !stage || !canvas || !context) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cache = new Map<number, FrameRecord>();
    const failedFrames = new Set<number>();
    const initialStageHeight = section.style.getPropertyValue("--hero-stage-height");
    let disposed = false;
    let reducedMotion = motionPreference.matches;
    let requestId = 0;
    let activeLoads = 0;
    let accessCounter = 0;
    let desiredFrame = 0;
    let paintedFrame = -1;
    let direction = 1;
    let queue: number[] = [];
    let preferredWindow = new Set<number>();

    function schedule() {
      if (!disposed && requestId === 0) {
        requestId = window.requestAnimationFrame(update);
      }
    }

    function releaseImage(record: FrameRecord) {
      record.image.onload = null;
      record.image.onerror = null;
      record.image.removeAttribute("src");
    }

    function reserveCacheSlot() {
      if (cache.size < MAX_CACHED_FRAMES) return true;

      let oldestIndex = -1;
      let oldestAccess = Infinity;
      let oldestIsOutsideWindow = false;
      for (const [index, record] of cache) {
        // Loading images count toward the limit and stay tracked until settled.
        const isOutsideWindow = !preferredWindow.has(index);
        if (
          record.status === "ready" &&
          index !== desiredFrame &&
          index !== paintedFrame &&
          (oldestIndex === -1 ||
            (isOutsideWindow && !oldestIsOutsideWindow) ||
            (isOutsideWindow === oldestIsOutsideWindow && record.touchedAt < oldestAccess))
        ) {
          oldestIndex = index;
          oldestAccess = record.touchedAt;
          oldestIsOutsideWindow = isOutsideWindow;
        }
      }

      if (oldestIndex === -1) return false;
      releaseImage(cache.get(oldestIndex)!);
      cache.delete(oldestIndex);
      return true;
    }

    function pumpQueue() {
      while (!disposed && activeLoads < MAX_PARALLEL_LOADS && queue.length > 0) {
        const index = queue[0];
        if (cache.has(index) || failedFrames.has(index)) {
          queue.shift();
          continue;
        }
        if (!reserveCacheSlot()) break;
        queue.shift();

        const image = new Image();
        const record: FrameRecord = {
          image,
          status: "loading",
          touchedAt: ++accessCounter,
        };
        let settled = false;
        cache.set(index, record);
        activeLoads += 1;
        image.decoding = "async";
        image.fetchPriority = index === desiredFrame ? "high" : "low";

        const finish = (loaded: boolean) => {
          if (settled) return;
          settled = true;
          activeLoads -= 1;
          image.onload = null;
          image.onerror = null;
          if (disposed) return;

          if (loaded && image.naturalWidth > 0 && image.naturalHeight > 0) {
            record.status = "ready";
            record.touchedAt = ++accessCounter;
            // update() checks the CURRENT target before painting. An old load
            // can never move the sequence backward after the user scrolls.
            schedule();
          } else {
            failedFrames.add(index);
            cache.delete(index);
            releaseImage(record);
            canvas.dataset.frameError = String(index + 1);
          }
          pumpQueue();
        };

        image.onload = () => {
          image.decode().then(
            () => finish(true),
            () => finish(image.complete && image.naturalWidth > 0),
          );
        };
        image.onerror = () => finish(false);
        image.src = FRAME_URLS[index];
      }
    }

    function updateQueue() {
      const preferred = [desiredFrame];
      if (!reducedMotion) {
        for (let offset = 1; offset <= PREFETCH_RADIUS; offset += 1) {
          for (const index of [
            desiredFrame + offset * direction,
            desiredFrame - offset * direction,
          ]) {
            if (index >= 0 && index < FRAME_URLS.length) preferred.push(index);
          }
        }
      }
      // Replace stale work instead of downloading every skipped frame after
      // fast scrolling. Already running requests are limited to two.
      preferredWindow = new Set(preferred);
      queue = preferred.filter((index) => !cache.has(index) && !failedFrames.has(index));
      pumpQueue();
    }

    function paint(index: number, force: boolean) {
      const record = cache.get(index);
      if (!record || record.status !== "ready") return false;
      if (index === paintedFrame && !force) return true;

      const { image } = record;
      const scale = Math.min(
        canvas.width / image.naturalWidth,
        canvas.height / image.naturalHeight,
      );
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(
        image,
        (canvas.width - width) / 2,
        (canvas.height - height) / 2,
        width,
        height,
      );
      paintedFrame = index;
      record.touchedAt = ++accessCounter;
      canvas.dataset.frame = String(index + 1);
      return true;
    }

    function update() {
      requestId = 0;
      if (disposed) return;

      const stageBounds = stage.getBoundingClientRect();
      if (stageBounds.width <= 0 || stageBounds.height <= 0) return;
      const measuredStageHeight = `${Math.ceil(stageBounds.height)}px`;
      if (section.style.getPropertyValue("--hero-stage-height") !== measuredStageHeight) {
        section.style.setProperty("--hero-stage-height", measuredStageHeight);
      }

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(stageBounds.width * pixelRatio));
      const height = Math.max(1, Math.round(stageBounds.height * pixelRatio));
      const resized = canvas.width !== width || canvas.height !== height;
      if (resized) {
        canvas.width = width;
        canvas.height = height;
      }

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const stickyTop = Number.parseFloat(window.getComputedStyle(stage).top) || 0;
      const travel = Math.max(1, section.offsetHeight - stageBounds.height);
      const progress = Math.min(
        1,
        Math.max(0, (window.scrollY + stickyTop - sectionTop) / travel),
      );
      const nextFrame = reducedMotion ? 0 : Math.round(progress * (FRAME_URLS.length - 1));
      if (nextFrame !== desiredFrame) {
        direction = nextFrame > desiredFrame ? 1 : -1;
        desiredFrame = nextFrame;
      }
      canvas.dataset.targetFrame = String(desiredFrame + 1);

      // Keep the last complete drawing while the requested image is loading.
      // A resize clears the backing buffer, so redraw that same ready frame.
      if (!paint(desiredFrame, resized) && resized && paintedFrame >= 0) {
        paint(paintedFrame, true);
      }
      updateQueue();
    }

    function handleMotionChange() {
      reducedMotion = motionPreference.matches;
      window.removeEventListener("scroll", schedule);
      if (!reducedMotion) {
        window.addEventListener("scroll", schedule, { passive: true });
      }
      schedule();
    }

    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(section);
    resizeObserver.observe(stage);
    window.addEventListener("resize", schedule, { passive: true });
    motionPreference.addEventListener("change", handleMotionChange);
    if (!reducedMotion) {
      window.addEventListener("scroll", schedule, { passive: true });
    }
    schedule();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(requestId);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motionPreference.removeEventListener("change", handleMotionChange);
      resizeObserver.disconnect();
      for (const record of cache.values()) releaseImage(record);
      cache.clear();
      queue = [];
      if (initialStageHeight) {
        section.style.setProperty("--hero-stage-height", initialStageHeight);
      } else {
        section.style.removeProperty("--hero-stage-height");
      }
    };
  }, [sectionRef, stageRef]);

  return <canvas ref={canvasRef} className="hero-frames" aria-hidden="true" data-target-frame="1" />;
}
