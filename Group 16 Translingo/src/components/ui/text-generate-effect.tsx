"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "motion/react";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}) => {
  const [scope, animate] = useAnimate();
  let wordsArray = words.split(" ");

  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration: duration || 1,
        delay: stagger(0.2),
      }
    );
  }, [scope.current]);

  const renderWords = () => {
    return (
      <motion.div ref={scope} style={{ display: "inline-block" }}>
        {wordsArray.map((word, idx) => (
          <motion.span
            key={word + idx}
            style={{
              opacity: 0,
              filter: filter ? "blur(10px)" : "none",
              fontWeight: "bold" as const, // Explicitly define as constant
              fontSize: "24px",
              color: "#ffffff",
              display: "inline-block",
              marginRight: "5px",
              transition: "opacity 0.5s ease, filter 0.5s ease",
            }}
          >
            {word}{" "}
          </motion.span>
        ))}
      </motion.div>
    );
  };

  return (
    <div
      style={{
        fontWeight: "bold" as const,
        color: "#ffffff",
        textAlign: "center" as const, // Explicitly define as constant
      }}
      className={className}
    >
      <div style={{ marginTop: "16px" }}>
        <div style={{ fontSize: "24px", color: "#ffffff", lineHeight: "1.5", letterSpacing: "1px" }}>
          {renderWords()}
        </div>
      </div>
    </div>
  );
};
