const motionPrimitives = {
  duration: {
    instant: '0ms',
    fast: '120ms',
    normal: '200ms',
    slow: '320ms'
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.2, 0, 0, 1.2)',
    decelerate: 'cubic-bezier(0, 0, 0, 1)',
    accelerate: 'cubic-bezier(0.3, 0, 1, 1)'
  }
} as const;

/** @internal Aggregation-only export. Use tokens.ts as public entrypoint. */
export const internalMotionTokens = {
  duration: motionPrimitives.duration,
  easing: motionPrimitives.easing,
  transition: {
    enter: {
      duration: motionPrimitives.duration.normal,
      easing: motionPrimitives.easing.decelerate
    },
    exit: {
      duration: motionPrimitives.duration.fast,
      easing: motionPrimitives.easing.accelerate
    },
    emphasized: {
      duration: motionPrimitives.duration.slow,
      easing: motionPrimitives.easing.emphasized
    }
  },
  reduced: {
    duration: motionPrimitives.duration.instant,
    easing: motionPrimitives.easing.standard
  }
} as const;
