import { useEffect, useState } from "react";

const AnimatedCounter = ({ target, suffix = "", duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const GlowingOrb = ({ color, size = "w-2 h-2", delay = 0 }) => (
  <div
    className={`${size} ${color} rounded-full animate-pulse absolute`}
    style={{
      animationDelay: `${delay}s`,
      boxShadow: `0 0 20px currentColor`,
    }}
  />
);

const StatCard = ({
  icon: Icon,
  title,
  value,
  suffix,
  description,
  gradient,
  iconColor,
  delay,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-1000 hover:scale-105 hover:-rotate-1 group ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
      style={{
        background: `linear-gradient(135deg, ${gradient})`,
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <GlowingOrb color="text-white/20" size="w-1 h-1" delay={0} />
        <GlowingOrb color="text-white/10" size="w-3 h-3" delay={1} />
        <GlowingOrb color="text-white/15" size="w-2 h-2" delay={2} />
      </div>

      {/* Flowing gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

      <div className="relative p-8 text-white">
        <div className="flex items-center mb-4">
          <div
            className={`p-3 rounded-full bg-white/20 backdrop-blur-sm mr-4 transform transition-transform group-hover:rotate-12 group-hover:scale-110`}
          >
            <Icon className={`h-8 w-8 ${iconColor}`} />
          </div>
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
        </div>

        <div className="mb-4">
          <p className="text-5xl font-black mb-2 tracking-tight">
            {isVisible &&
              (suffix === "%" ? (
                <>
                  <AnimatedCounter target={parseFloat(value)} duration={2500} />
                  {suffix}
                </>
              ) : (
                <>
                  +
                  <AnimatedCounter
                    target={parseInt(value.replace(/[+,%]/g, ""))}
                    duration={3000}
                  />
                  {suffix}
                </>
              ))}
          </p>
        </div>

        <p className="text-white/90 leading-relaxed font-medium">
          {description}
        </p>

        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-full" />
      </div>
    </div>
  );
};

export default StatCard;
