import { Animated, Easing } from 'react-native';

/**
 * Animations utility module for smooth, reusable animations
 */

export const Animations = {
  /**
   * Fade in animation
   */
  fadeIn: (duration = 300) => {
    const anim = new Animated.Value(0);
    Animated.timing(anim, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    return anim;
  },

  /**
   * Slide up animation
   */
  slideUp: (duration = 400) => {
    const anim = new Animated.Value(20);
    Animated.timing(anim, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    return anim;
  },

  /**
   * Scale animation
   */
  scale: (duration = 400) => {
    const anim = new Animated.Value(0.8);
    Animated.timing(anim, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    return anim;
  },

  /**
   * Pulse animation (for loading states)
   */
  pulse: () => {
    const anim = new Animated.Value(1);
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 0.7,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
    return anim;
  },

  /**
   * Bounce animation
   */
  bounce: (duration = 600) => {
    const anim = new Animated.Value(0);
    Animated.timing(anim, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.bounce),
      useNativeDriver: true,
    }).start();
    return anim;
  },

  /**
   * Shake animation (for errors)
   */
  shake: () => {
    const anim = new Animated.Value(0);
    Animated.sequence([
      Animated.timing(anim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
    return anim;
  },

  /**
   * Staggered animation for lists
   */
  staggeredAnimation: (
    items: any[],
    duration = 400,
    staggerDelay = 100
  ) => {
    return items.map((_, index) => {
      const anim = new Animated.Value(0);
      Animated.timing(anim, {
        toValue: 1,
        delay: index * staggerDelay,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return anim;
    });
  },

  /**
   * Interpolate opacity and transform
   */
  messageAnimation: (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  }),

  /**
   * Interpolate scale
   */
  scaleAnimation: (anim: Animated.Value) => ({
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
  }),

  /**
   * Interpolate rotation
   */
  rotateAnimation: (anim: Animated.Value) => ({
    transform: [
      {
        rotate: anim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  }),
};

export default Animations;
