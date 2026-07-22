import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import image from '../assets/image.png'

export function SplashScreen({ onComplete }) {
  const container = useRef(null);
  const logo = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });

    // Logo fades in and scales slightly
    tl.from(logo.current, {
      scale: 0.8,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out'
    })
      // Gentle floating effect
      .to(logo.current, {
        y: -10,
        duration: 1,
        yoyo: true,
        repeat: 1,
        ease: 'sine.inOut'
      })
      // Container fades out smoothly
      .to(container.current, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.inOut'
      });
  }, { scope: container });

  return (
    <div
      ref={container}
      className="fixed inset-0 z-[100] bg-[#08183A] flex flex-col items-center justify-center w-full h-full shadow-2xl"
    >
      <div className="flex flex-col items-center justify-center p-8">
        <img
          ref={logo}
          src={image}
          alt="Houra Jewels"
          className="w-64 md:w-96 object-contain drop-shadow-2xl rounded-2xl mix-blend-screen"
        />
      </div>
    </div>
  );
}
